from flask import Blueprint, jsonify, request
from services.github_service import GitHubService
from services.repository_service import RepositoryService
activity_bp = Blueprint('activity', __name__)


@activity_bp.route('/api/repository/details', methods=['POST'])
def get_details():
    data = request.json
    repo_url = data.get('url')
    user_id = data.get('user_id') # Može biti None (gost) ili ID (ulogovan)

    # 1. Uvek povuci detalje sa GitHub-a
    details = GitHubService.get_repo_details(repo_url)

    if not details:
        return jsonify({"error": "Repository not found"}), 404

    # 2. Logika za bazu: Čuvaj samo ako user_id postoji
    if user_id:
        message, status_code = RepositoryService.follow_repository(user_id, details)
    else:
        # Ako je gost, samo obavesti front da nije čuvano u bazu
        message = "Guest mode: Data not saved to history"
        status_code = 200

    # 3. Vrati podatke Frontendu
    return jsonify({
        "db_status": message,
        "repo_data": details
    }), status_code