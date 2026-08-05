from flask import Blueprint, jsonify, request
from services.repository_service import RepositoryService
from schemas.repository_schema import repositories_schema
from services.telegram_service import TelegramService

watchlist_bp = Blueprint('watchlist_bp', __name__)


@watchlist_bp.route('/api/following', methods=['GET'])
def get_following_list():
    """Vraca repozitorijume koje je korisnik zapratio."""
    user_id = request.args.get('user_id', type=int)

    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    following = RepositoryService.get_user_watchlist(user_id)
    return jsonify(repositories_schema.dump(following)), 200


@watchlist_bp.route('/api/watchlist/follow', methods=['POST'])
def follow_repo():
    """Dodaje repozitorijum u listu pracenih."""
    data = request.json
    if not data or 'user_id' not in data or 'repo_data' not in data:
        return jsonify({"error": "Missing data"}), 400

    res, status = RepositoryService.follow_repository(data['user_id'], data['repo_data'])

    # Slanje Telegram notifikacije pri uspešnom dodavanju
    if status == 200 or status == 201:
        repo_name = data['repo_data'].get('full_name', 'Nepoznat repozitorijum')
        TelegramService.send_notification(
            f"⭐ *Novi repozitorijum u Watchlist-i!*\nKorisnik je zapratio: `{repo_name}`")

    return jsonify(res), status


@watchlist_bp.route('/api/watchlist/unfollow', methods=['DELETE'])
def unfollow_repo():
    user_id = request.args.get('user_id')
    identifier = request.args.get('repo_id')

    if not user_id or not identifier:
        return jsonify({"error": "user_id and repo_id (or name) are required"}), 400

    success = RepositoryService.unfollow_repository(user_id, identifier)

    if success:
        return jsonify({"message": "Successfully removed"}), 200
    return jsonify({"error": "Not found in following list"}), 404