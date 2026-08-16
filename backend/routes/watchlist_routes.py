from flask import Blueprint, jsonify, request
from services.repository_service import RepositoryService
from schemas.repository_schema import repositories_schema
from services.telegram_service import TelegramService

watchlist_bp = Blueprint('watchlist_bp', __name__)


# --- 1. MY HISTORY (Sve pretrage iz baze) ---
@watchlist_bp.route('/api/history', methods=['GET'])
def get_my_history():
    """
    Istorija pretraga korisnika (preko query parametra)
    ---
    tags:
      - Watchlist
    parameters:
      - name: user_id
        in: query
        type: integer
        required: true
        description: ID korisnika
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
      400:
        description: user_id nije prosleđen
    """
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    # Ako je u servisu postoji metoda za istoriju, poziva se ovde (ili prilagodi po potrebi)
    return jsonify([]), 200


@watchlist_bp.route('/api/following', methods=['GET'])
def get_following_list():
    """
    Lista repozitorijuma koje korisnik prati
    ---
    tags:
      - Watchlist
    parameters:
      - name: user_id
        in: query
        type: integer
        required: true
        description: ID korisnika
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
      400:
        description: user_id nije prosleđen
    """
    user_id = request.args.get('user_id', type=int)

    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    following = RepositoryService.get_user_watchlist(user_id)
    return jsonify(repositories_schema.dump(following)), 200


@watchlist_bp.route('/api/watchlist/follow', methods=['POST'])
def follow_repo():
    """
    Dodaje repozitorijum u listu praćenih
    ---
    tags:
      - Watchlist
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required: [user_id, repo_data]
          properties:
            user_id:
              type: integer
              example: 1
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
    """
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
    """
    Uklanja repozitorijum iz liste praćenih
    ---
    tags:
      - Watchlist
    parameters:
      - name: user_id
        in: query
        type: integer
        required: true
        description: ID korisnika
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
      404:
        description: Repozitorijum nije pronađen u praćenima
    """
    user_id = request.args.get('user_id')
    identifier = request.args.get('repo_id')

    if not user_id or not identifier:
        return jsonify({"error": "user_id and repo_id (or name) are required"}), 400

    success = RepositoryService.unfollow_repository(user_id, identifier)

    if success:
        return jsonify({"message": "Successfully removed"}), 200
    return jsonify({"error": "Not found in following list"}), 404