from flask import Blueprint, jsonify, request
from services.github_service import GitHubService
from services.search_service import SearchService

activity_bp = Blueprint('activity', __name__)


# Podaci dolaze zivi sa GitHub API-ja, ne iz baze
@activity_bp.route('/api/repository/details', methods=['POST'])
def get_repo_details_route():
    try:
        data = request.json or {}
        repo_url = data.get('url')
        user_id = data.get('user_id')

        if not repo_url:
            return jsonify({"error": "URL is required"}), 400

        details = GitHubService.get_repo_details(repo_url)
        if not details:
            return jsonify({"error": "Repository not found on GitHub"}), 404

        if user_id:
            SearchService.log_search(user_id, repo_url, "repo_search")
            db_message = "Search logged in history"
        else:
            db_message = "Guest mode: Data not saved"

        return jsonify({"db_status": db_message, "repo_data": details}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@activity_bp.route('/api/activity/list', methods=['POST'])
def get_activity_list():
    try:
        data = request.json or {}
        feed = GitHubService.get_repo_events(
            data.get('owner'),
            data.get('repo'),
            data.get('filter', 'All'),
            data.get('author_filter', '')
        )

        if feed is None:
            return jsonify({"error": "GitHub API error"}), 502

        return jsonify(feed), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@activity_bp.route('/api/activity/details/<owner>/<repo>/<sha>', methods=['GET'])
def get_activity_details(owner, repo, sha):
    details = GitHubService.get_commit_details(owner, repo, sha)
    if not details:
        return jsonify({"error": "Commit not found"}), 404
    return jsonify(details), 200