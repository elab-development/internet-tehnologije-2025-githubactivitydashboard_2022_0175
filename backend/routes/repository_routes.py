from flask import Blueprint, jsonify
from services.github_service import GitHubService
from services.repository_service import RepositoryService

repo_bp = Blueprint('repo_bp', __name__)

@repo_bp.route('/api/repository/<owner>/<repo_name>', methods=['GET'])
def get_repo_info(owner, repo_name):
    # Ovo pokriva "Pregleda detalje aktivnosti" iz tvog Use Case-a
    full_name = f"{owner}/{repo_name}"
    details = GitHubService.get_repo_details(full_name)
    return jsonify(details), 200

@repo_bp.route('/api/contributors/<owner>/<repo_name>', methods=['GET'])
def get_repo_contributors(owner, repo_name):
    # Ovo pokriva "Pregleda najveće contributore" zahtev
    contributors = GitHubService.get_contributors(owner, repo_name)
    return jsonify(contributors), 200