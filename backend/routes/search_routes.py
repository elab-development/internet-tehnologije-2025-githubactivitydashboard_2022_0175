from flask import Blueprint, jsonify, request
from services.github_service import GitHubService
from services.search_service import SearchService
from schemas.searchhistory_schema import SearchHistorySchema  # Pretpostavljam da se tako zove u tvojim šemama

search_bp = Blueprint('search', __name__)
search_schema = SearchHistorySchema(many=True)


@search_bp.route('/api/search/repositories', methods=['POST']) # Endpoint koji prima POST zahtev sa terminom pretrage.
def search_repos():
    data = request.json # Preuzima podatke sa frontenda (query i user_id).
    query = data.get('query') # To je username koji korisnik kuca u search bar.
    user_id = data.get('user_id') # ID ulogovanog korisnika (ako postoji).

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
def get_history(user_id):
    # Zahtev: "Pristup pojedinim rutama omogućen samo autentifikovanim korisnicima"
    # Za sada dozvoljavamo preko ID-a, kasnije ćemo dodati pravu zaštitu
    history = SearchService.get_user_history(user_id)
    return jsonify(search_schema.dump(history)), 200
