from flask import Blueprint, jsonify, request
from services.repository_service import RepositoryService
from services.watchlist_service import WatchlistService
watchlist_bp = Blueprint('watchlist_bp', __name__)


@watchlist_bp.route('/api/watchlist', methods=['GET'])  # Proveri da li prefiks 'api' već postoji u blueprint-u
def get_my_watchlist():
    user_id = request.args.get('user_id')

    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    # Koristimo WatchlistService i metodu koju smo definisali
    watchlist = WatchlistService.get_full_watchlist_details(user_id)
    return jsonify(watchlist), 200

@watchlist_bp.route('/api/watchlist/follow', methods=['POST'])
def follow_repo():
    # Zahtev: "Upravlja listom praćenih repozitorijuma (follow)"
    data = request.json
    res, status = RepositoryService.follow_repository(data['user_id'], data['repo_data'])
    return jsonify(res), status