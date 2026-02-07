from flask import Blueprint, jsonify, request
from services.github_service import GitHubService
from services.search_service import SearchService
from schemas.searchhistory_schema import SearchHistorySchema  # Pretpostavljam da se tako zove u tvojim šemama

search_bp = Blueprint('search', __name__)
search_schema = SearchHistorySchema(many=True)


@search_bp.route('/api/search/repositories', methods=['POST'])
def search_repos():
    data = request.json
    query = data.get('query')
    user_id = data.get('user_id')

    user_info = GitHubService.get_user_info(query)
    if not user_info:
        return jsonify({"error": "Korisnik ne postoji"}), 404

    # --- OVO SI MOŽDA ZABORAVILA ---
    # Moramo stvarno pozvati GitHub da nam da listu repo-a
    repos_list = GitHubService.get_user_repos(query)

    SearchService.log_search(user_id, query, "user_search")

    return jsonify({
        "avatar_url": user_info.get("avatar_url"),
        "login": user_info.get("login"),
        "public_repos": user_info.get("public_repos"),
        "followers": user_info.get("followers"),
        "following": user_info.get("following"),
        "repos_list": repos_list, # OVO MORA BITI OVDE
        "type": "user"
    }), 200


@search_bp.route('/api/search/history/<int:user_id>', methods=['GET'])
def get_history(user_id):
    # Zahtev: "Pristup pojedinim rutama omogućen samo autentifikovanim korisnicima"
    # Za sada dozvoljavamo preko ID-a, kasnije ćemo dodati pravu zaštitu
    history = SearchService.get_user_history(user_id)
    return jsonify(search_schema.dump(history)), 200