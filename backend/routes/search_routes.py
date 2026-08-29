from flask import Blueprint, jsonify, request
from services.github_service import GitHubService
from services.search_service import SearchService
from schemas.searchhistory_schema import search_histories_schema
from utils.auth_utils import token_required, optional_auth

search_bp = Blueprint('search', __name__)



@search_bp.route('/api/search/repositories', methods=['POST']) # Endpoint koji prima POST zahtev sa terminom pretrage.
def search_repos():
    """
    Pretraga GitHub korisnika po korisničkom imenu
    ---
    tags:
      - Search
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required: [query]
          properties:
            query:
              type: string
              description: GitHub korisničko ime koje se pretražuje
              example: octocat
            user_id:
              type: integer
              description: ID ulogovanog korisnika (opciono, radi logovanja pretrage)
              example: 1
    responses:
      200:
        description: Podaci o pronađenom GitHub korisniku
        schema:
          type: object
          properties:
            avatar_url:
              type: string
            login:
              type: string
            public_repos:
              type: integer
            followers:
              type: integer
            following:
              type: integer
            public_gists:
              type: integer
            repos_list:
              type: array
              items:
                type: object
            type:
              type: string
              example: user
      404:
        description: Korisnik ne postoji na GitHub-u
    """
    data = request.json # Preuzima podatke sa frontenda (query).
    query = data.get('query') # To je username koji korisnik kuca u search bar.

    # user_id se NE uzima iz tela zahteva (klijent bi mogao poslati tuđi ID i
    # tako "zatrovati" tuđu istoriju pretraga) - uzima se iz tokena, ako
    # postoji. Ako korisnik nije ulogovan, pretraga i dalje radi, samo se ne loguje.
    current = optional_auth()
    user_id = current['id'] if current else None

    # 1. Poziva GitHub servis da proveri da li taj korisnik uopšte postoji na GitHub-u.
    user_info = GitHubService.get_user_info(query)
    if not user_info:
        return jsonify({"error": "Korisnik ne postoji"}), 404 # Ako ne postoji, prekida i javlja grešku.

    # 2. Poziva GitHub servis da dobije listu svih javnih projekata (repozitorijuma) tog korisnika.
    repos_list = GitHubService.get_user_repos(query)

    # 3. LOGOVANJE: Poziva naš servis da upiše ovu pretragu u Postgres bazu podataka.
    # To omogućava korisniku da kasnije vidi šta je sve pretraživao.
    SearchService.log_search(user_id, query, "user_search")

    # 4. ODGOVOR: Pakuje sve informacije u jedan JSON objekat za frontend.
    return jsonify({
        "avatar_url": user_info.get("avatar_url"), # Link do slike profila.
        "login": user_info.get("login"), # Korisničko ime.
        "public_repos": user_info.get("public_repos"), # Broj repozitorijuma.
        "followers": user_info.get("followers"), # Broj pratilaca.
        "following": user_info.get("following"), # Koga on prati.
        "public_gists": user_info.get("public_gists"), # Broj javnih beleški.
        "repos_list": repos_list, # Kompletna lista njegovih projekata.
        "type": "user" # Oznaka tipa rezultata radi lakšeg prikaza na frontendu.
    }), 200


@search_bp.route('/api/search/history/<int:user_id>', methods=['GET'])
@token_required
def get_history(user_id):
    current = request.current_user

    # Eksplicitno konvertujemo obe vrednosti u int
    # Ovo sprečava 403 grešku zbog poređenja int i string tipova
    if int(current['id']) != int(user_id) and current.get('role') != 'Admin':
        return jsonify({"error": "Nemate dozvolu da vidite tuđu istoriju pretraga"}), 403

    history = SearchService.get_user_history(user_id)
    return jsonify(search_histories_schema.dump(history)), 200