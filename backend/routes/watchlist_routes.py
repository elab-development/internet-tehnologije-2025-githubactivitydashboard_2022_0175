from flask import Blueprint, jsonify, request
from services.repository_service import RepositoryService
from services.search_service import SearchService
from schemas.repository_schema import repositories_schema
from services.telegram_service import TelegramService
from utils.auth_utils import token_required

watchlist_bp = Blueprint('watchlist_bp', __name__)


# --- 1. MY HISTORY (Sve pretrage iz baze) ---
@watchlist_bp.route('/api/history', methods=['GET'])
@token_required
def get_my_history():
    """
    Istorija pretraga ulogovanog korisnika
    ---
    tags:
      - Watchlist
    security:
      - Bearer: []
    responses:
      200:
        description: Lista pretraga korisnika
        schema:
          type: array
          items:
            type: object
            properties:
              query:
                type: string
              type:
                type: string
              timestamp:
                type: string
      401:
        description: Nedostaje ili je nevalidan token
    """
    # ID korisnika se uzima IZ TOKENA, ne iz query parametra - tako niko ne
    # može da vidi tuđu istoriju prosto menjajući user_id u URL-u.
    user_id = request.current_user['id']

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
@token_required
def get_following_list():
    """
    Lista repozitorijuma koje ulogovani korisnik prati
    ---
    tags:
      - Watchlist
    security:
      - Bearer: []
    responses:
      200:
        description: Lista praćenih repozitorijuma
        schema:
          type: array
          items:
            type: object
            properties:
              repo_id:
                type: integer
              full_name:
                type: string
              url:
                type: string
      401:
        description: Nedostaje ili je nevalidan token
    """
    user_id = request.current_user['id']

    following = RepositoryService.get_user_watchlist(user_id)
    return jsonify(repositories_schema.dump(following)), 200


# --- 3. AKCIJE: FOLLOW & UNFOLLOW ---

@watchlist_bp.route('/api/watchlist/follow', methods=['POST'])
@token_required
def follow_repo():
    """
    Dodaje repozitorijum u listu praćenih ulogovanog korisnika
    ---
    tags:
      - Watchlist
    security:
      - Bearer: []
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required: [repo_data]
          properties:
            repo_data:
              type: object
              description: GitHub podaci o repozitorijumu (mora sadržati full_name i html_url)
              properties:
                full_name:
                  type: string
                  example: facebook/react
                html_url:
                  type: string
                  example: https://github.com/facebook/react
    responses:
      200:
        description: Repozitorijum uspešno dodat u praćene
      400:
        description: Nedostaju podaci
      401:
        description: Nedostaje ili je nevalidan token
    """
    data = request.json
    if not data or 'repo_data' not in data:
        return jsonify({"error": "Missing data"}), 400

    user_id = request.current_user['id']
    res, status = RepositoryService.follow_repository(user_id, data['repo_data'])

    # Slanje Telegram notifikacije pri uspešnom dodavanju
    if status == 200 or status == 201:
        repo_name = data['repo_data'].get('full_name', 'Nepoznat repozitorijum')
        TelegramService.send_notification(
            f"⭐ *Novi repozitorijum u Watchlist-i!*\nKorisnik je zapratio: `{repo_name}`")

    return jsonify(res), status


@watchlist_bp.route('/api/watchlist/unfollow', methods=['DELETE'])
@token_required
def unfollow_repo():
    """
    Uklanja repozitorijum iz liste praćenih ulogovanog korisnika
    ---
    tags:
      - Watchlist
    security:
      - Bearer: []
    parameters:
      - name: repo_id
        in: query
        type: string
        required: true
        description: ID ili puno ime repozitorijuma koji se uklanja
    responses:
      200:
        description: Uspešno uklonjeno iz praćenih
      400:
        description: Nedostaju parametri
      401:
        description: Nedostaje ili je nevalidan token
      404:
        description: Repozitorijum nije pronađen u praćenima
    """
    identifier = request.args.get('repo_id')

    if not identifier:
        return jsonify({"error": "repo_id (or name) is required"}), 400

    user_id = request.current_user['id']
    success = RepositoryService.unfollow_repository(user_id, identifier)

    if success:
        return jsonify({"message": "Successfully removed"}), 200
    else:
        return jsonify({"error": "Not found in following list"}), 404