from flask import Blueprint, jsonify, request
from services.github_service import GitHubService

repo_bp = Blueprint('repo_bp', __name__)


@repo_bp.route('/api/repository/<owner>/<repo_name>', methods=['GET'])
def get_repo_info(owner, repo_name):
    full_name = f"{owner}/{repo_name}"
    details = GitHubService.get_repo_details(full_name)
    if not details:
        return jsonify({"error": "Repository not found"}), 404
    return jsonify(details), 200


@repo_bp.route('/api/contributors/<owner>/<repo_name>', methods=['GET'])
def get_repo_contributors(owner, repo_name):
    """
    Ruta koja vraća top kontributore.
    Query parametri:
    - type: 'commits', 'prs', ili 'issues' (default: 'commits')
    - limit: broj korisnika koje vraćamo (default: 10)
    """
    # 1. Uzimamo parametre iz URL-a
    activity_type = request.args.get('type', 'commits')  # default je commits
    limit = request.args.get('limit', default=10, type=int)

    # 2. Logika u zavisnosti od tipa filtera
    if activity_type == 'commits':
        # Koristimo originalnu metodu za commit-ove
        contributors = GitHubService.get_contributors(owner, repo_name, limit=limit)

    elif activity_type in ['prs', 'issues']:
        # Koristimo novu metodu za PR-ove i Issues koju smo definisali u servisu
        contributors = GitHubService.get_activity_contributors(
            owner,
            repo_name,
            activity_type=activity_type,
            limit=limit
        )
    else:
        return jsonify({"error": "Nevalidan tip filtera. Koristi 'commits', 'prs' ili 'issues'."}), 400

    # 3. Slanje odgovora
    if not contributors:
        return jsonify([]), 200  # Vraćamo praznu listu ako nema rezultata

    return jsonify(contributors), 200