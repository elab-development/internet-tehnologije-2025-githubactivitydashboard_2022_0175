from flask import Blueprint, jsonify, request
from services.repository_service import RepositoryService
from services.search_service import SearchService

watchlist_bp = Blueprint('watchlist_bp', __name__)

# --- 1. MY HISTORY (Sve pretrage iz baze) ---
@watchlist_bp.route('/api/history', methods=['GET'])
def get_my_history():
    """Vraća istoriju pretraga korisnika koristeći SearchService."""
    user_id = request.args.get('user_id')

    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    # Koristimo SearchService jer on gleda tabelu SearchHistory (ono što si kucala)
    history = SearchService.get_user_history(user_id)

    result = []
    for item in history:
        result.append({
            "query": item.query,
            "type": item.search_type,
            "timestamp": item.timestamp.strftime("%Y-%m-%d %H:%M:%S") if item.timestamp else None
        })
    return jsonify(result), 200


# --- 2. FOLLOWING LIST (Samo zapraćeni repozitorijumi) ---
@watchlist_bp.route('/api/following', methods=['GET'])
def get_following_list():
    """Vraća samo one repozitorijume koje je korisnik zapratio (kliknuo SRCE/FOLLOW)."""
    user_id = request.args.get('user_id')

    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    # RepositoryService gađa tabelu UserRepoFollow (prave pratioce)
    following = RepositoryService.get_user_watchlist(user_id)

    result = []
    for repo in following:
        result.append({
            "repo_id": repo.repo_id,
            "full_name": repo.full_name,
            "url": repo.url
        })
    return jsonify(result), 200


# --- 3. AKCIJE: FOLLOW & UNFOLLOW ---

@watchlist_bp.route('/api/watchlist/follow', methods=['POST'])
def follow_repo():
    """Dodaje repozitorijum u listu praćenih (UserRepoFollow)."""
    data = request.json
    if not data or 'user_id' not in data or 'repo_data' not in data:
        return jsonify({"error": "Missing data"}), 400

    res, status = RepositoryService.follow_repository(data['user_id'], data['repo_data'])
    return jsonify(res), status


@watchlist_bp.route('/api/watchlist/unfollow', methods=['DELETE'])
def unfollow_repo():
    """Uklanja repozitorijum iz liste praćenih."""
    user_id = request.args.get('user_id')
    repo_id = request.args.get('repo_id')

    if not user_id or not repo_id:
        return jsonify({"error": "user_id and repo_id are required"}), 400

    success = RepositoryService.unfollow_repository(user_id, repo_id)

    if success:
        return jsonify({"message": "Successfully removed from following list"}), 200
    else:
        return jsonify({"error": "Repository not found in your following list"}), 404