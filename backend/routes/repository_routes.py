from flask import Blueprint, jsonify
from services.github_service import GitHubService
from services.repository_service import RepositoryService

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
    # 1. Uzmi standardne contributore (Commits)
    contributors = GitHubService.get_contributors(owner, repo_name)

    # 2. Uzmi dodatnu statistiku (PRs i Issues)
    extra_stats = GitHubService.get_repo_stats(owner, repo_name)

    # 3. Spoji podatke
    enriched_data = []
    for c in contributors[:10]:  # Uzimamo top 10 radi preglednosti
        user_login = c['login']
        user_stats = extra_stats.get(user_login, {"prs": 0, "issues": 0})

        enriched_data.append({
            "id": c['id'],
            "login": user_login,
            "avatar_url": c['avatar_url'],
            "commits": c.get('contributions', 0),
            "prs": user_stats["prs"],
            "issues": user_stats["issues"]
        })

    if not enriched_data:
        return jsonify({"message": "Nema dostupnih contributora"}), 200

    return jsonify(enriched_data), 200