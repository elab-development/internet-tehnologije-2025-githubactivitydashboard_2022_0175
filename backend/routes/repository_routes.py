from flask import Blueprint, jsonify, request
from services.github_service import GitHubService
from services.repository_service import RepositoryService

repo_bp = Blueprint('repo_bp', __name__)

@repo_bp.route('/api/repository/<owner>/<repo_name>', methods=['GET'])
def get_repo_info(owner, repo_name):
    """
    Detalji o repozitorijumu sa GitHub-a
    ---
    tags:
      - Repository
    parameters:
      - name: owner
        in: path
        type: string
        required: true
        description: Vlasnik repozitorijuma
        example: facebook
      - name: repo_name
        in: path
        type: string
        required: true
        description: Naziv repozitorijuma
        example: react
    responses:
      200:
        description: Podaci o repozitorijumu
        schema:
          type: object
      404:
        description: Repozitorijum nije pronađen
    """
    #spajamo vlasnika u ime repoa kao facebook/react
    full_name = f"{owner}/{repo_name}"
    #pozivamo nas servis koji kontaktira API
    details = GitHubService.get_repo_details(full_name)
    if not details:
        return jsonify({"error": "Repository not found"}), 404
    return jsonify(details), 200


@repo_bp.route('/api/contributors/<owner>/<repo_name>', methods=['GET'])
def get_repo_contributors(owner, repo_name):
    """
    Lista kontributora repozitorijuma
    ---
    tags:
      - Repository
    parameters:
      - name: owner
        in: path
        type: string
        required: true
        example: facebook
      - name: repo_name
        in: path
        type: string
        required: true
        example: react
      - name: limit
        in: query
        type: integer
        required: false
        description: Ograničava broj vraćenih kontributora
        example: 3
    responses:
      200:
        description: Lista kontributora (ili poruka ako ih nema)
        schema:
          type: array
          items:
            type: object
    """
    # Uzimamo opcioni query parametar 'limit', npr. /api/contributors/owner/repo?limit=3
    limit = request.args.get('limit', type=int)

    contributors = GitHubService.get_contributors(owner, repo_name)

    if not contributors:
        return jsonify({"message": "Nema dostupnih contributora"}), 200

    if limit:
        return jsonify(contributors[:limit]), 200

    return jsonify(contributors), 200