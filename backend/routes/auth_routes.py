from flask import Blueprint, jsonify, request
from services.github_service import GitHubService
from services.search_service import SearchService
from schemas.searchhistory_schema import SearchHistorySchema

search_bp = Blueprint('search_bp', __name__)
search_schema = SearchHistorySchema()
search_history_list_schema = SearchHistorySchema(many=True)


@search_bp.route('/api/search/repositories', methods=['POST'])
def search_repositories():
    """
    Ruta za pretragu GitHub repozitorijuma.
    Gost šalje samo 'query', dok Korisnik šalje i 'user_id'.
    """
    data = request.json
    query = data.get('query')
    user_id = data.get('user_id')  # None ako je Gost

    if not query:
        return jsonify({"error": "Search query is required"}), 400

    # 1. Pozivamo eksterni GitHub API preko servisa
    # (Pretpostavljamo da GitHubService vraća listu repozitorijuma)
    github_results = GitHubService.get_repo_details(query)

    if github_results is None:
        return jsonify({"error": "Failed to fetch data from GitHub"}), 503

    # 2. Logujemo pretragu u bazu ako je user_id prosleđen (Korisnik)
    if user_id:
        SearchService.log_search(user_id, query, "repository_search")

    return jsonify({
        "query": query,
        "results": github_results
    }), 200


@search_bp.route('/api/search/history/<int:user_id>', methods=['GET'])
def get_search_history(user_id):
    """
    Vraća istoriju pretraga za određenog korisnika.
    Zahtev: Dozvoljeno samo autentifikovanim korisnicima.
    """
    # Kasnije ćemo ovde dodati @jwt_required ili sličnu zaštitu
    history = SearchService.get_user_history(user_id)

    return jsonify(search_history_list_schema.dump(history)), 200