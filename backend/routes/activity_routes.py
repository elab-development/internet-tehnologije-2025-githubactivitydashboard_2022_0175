from flask import Blueprint, jsonify, request
from services.github_service import GitHubService

activity_bp = Blueprint('activity', __name__)


@activity_bp.route('/api/repository/details', methods=['POST'])
def get_details():
    data = request.json
    repo_url = data.get('url')
    details = GitHubService.get_repo_details(repo_url)

    if details:
        return jsonify(details), 200
    return jsonify({"error": "Repository not found"}), 404