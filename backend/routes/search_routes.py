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
    # Opciono: preuzimamo user_id iz sesije ili headera ako je korisnik ulogovan
    user_id = data.get('user_id')

    if not query:
        return jsonify({"error": "Query is required"}), 400

    # 1. Pozivamo GitHub API preko servisa
    github_results = GitHubService.get_repo_details(query)  # Ili funkciju za search

    # 2. Logujemo pretragu u bazu (Service će sam proveriti da li je user_id None)
    SearchService.log_search(user_id, query, "repository")

    return jsonify(github_results), 200


@search_bp.route('/api/search/history/<int:user_id>', methods=['GET'])
def get_history(user_id):
    # Zahtev: "Pristup pojedinim rutama omogućen samo autentifikovanim korisnicima"
    # Za sada dozvoljavamo preko ID-a, kasnije ćemo dodati pravu zaštitu
    history = SearchService.get_user_history(user_id)
    return jsonify(search_schema.dump(history)), 200