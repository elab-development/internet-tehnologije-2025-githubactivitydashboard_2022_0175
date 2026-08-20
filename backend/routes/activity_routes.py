from flask import Blueprint, jsonify, request
from services.github_service import GitHubService
from services.search_service import SearchService

activity_bp = Blueprint('activity', __name__)


# Podaci dolaze zivi sa GitHub API-ja, ne iz baze
@activity_bp.route('/api/repository/details', methods=['POST'])
def get_repo_details_route():
    """
    Detalji repozitorijuma (uživo sa GitHub-a), sa opcionim logovanjem pretrage
    ---
    tags:
      - Activity
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required: [url]
          properties:
            url:
              type: string
              description: Puno ime repozitorijuma (owner/repo) ili URL
              example: facebook/react
            user_id:
              type: integer
              description: ID ulogovanog korisnika (opciono, radi logovanja)
              example: 1
    responses:
      200:
        description: Podaci o repozitorijumu i status logovanja u bazu
        schema:
          type: object
          properties:
            db_status:
              type: string
            repo_data:
              type: object
      400:
        description: URL nije prosleđen
      404:
        description: Repozitorijum nije pronađen na GitHub-u
      500:
        description: Greška na serveru
    """
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
    """
    Lista aktivnosti (događaja) za repozitorijum, uživo sa GitHub-a
    ---
    tags:
      - Activity
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required: [owner, repo]
          properties:
            owner:
              type: string
              example: facebook
            repo:
              type: string
              example: react
            filter:
              type: string
              description: Filter po tipu događaja
              example: All
            author_filter:
              type: string
              description: Filter po autoru događaja
              example: ""
    responses:
      200:
        description: Lista aktivnosti
        schema:
          type: array
          items:
            type: object
      502:
        description: Greška prilikom komunikacije sa GitHub API-jem
      500:
        description: Greška na serveru
    """
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
    """
    Detalji o pojedinačnom commit-u
    ---
    tags:
      - Activity
    parameters:
      - name: owner
        in: path
        type: string
        required: true
        example: facebook
      - name: repo
        in: path
        type: string
        required: true
        example: react
      - name: sha
        in: path
        type: string
        required: true
        description: SHA hash commit-a
    responses:
      200:
        description: Detalji commit-a
        schema:
          type: object
      404:
        description: Commit nije pronađen
    """
    details = GitHubService.get_commit_details(owner, repo, sha)
    if not details:
        return jsonify({"error": "Commit not found"}), 404
    return jsonify(details), 200