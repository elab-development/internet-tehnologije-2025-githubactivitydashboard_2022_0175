from flask import Blueprint, jsonify, request
from services.repository_service import RepositoryService

watchlist_bp = Blueprint('watchlist_bp', __name__)

@watchlist_bp.route('/api/watchlist', methods=['GET'])
def get_my_watchlist():
    # Uzimamo user_id (kasnije iz sesije, sad za test iz args)
    user_id = request.args.get('user_id')
    watchlist = RepositoryService.get_user_watchlist(user_id)
    return jsonify(watchlist), 200

@watchlist_bp.route('/api/watchlist/follow', methods=['POST'])
def follow_repo():
    # Zahtev: "Upravlja listom praćenih repozitorijuma (follow)"
    data = request.json
    res, status = RepositoryService.follow_repository(data['user_id'], data['repo_data'])
    return jsonify(res), status