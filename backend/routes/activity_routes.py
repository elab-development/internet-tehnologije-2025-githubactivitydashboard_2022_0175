from flask import Blueprint, jsonify, request
from services.github_service import GitHubService
from services.repository_service import RepositoryService
activity_bp = Blueprint('activity', __name__)
import requests

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

@activity_bp.route('/api/activity/details', methods=['POST'])
def get_activity_details():
        data = request.json
        owner = data.get('owner')
        repo = data.get('repo')
        sha = data.get('sha') # Commit hash je ključ za detalje

        if not all([owner, repo, sha]):
            return jsonify({"error": "Nedostaju podaci"}), 400

        # Pozivamo GitHub API za specifičan commit
        url = f"https://api.github.com/repos/{owner}/{repo}/commits/{sha}"
        headers = GitHubService.get_headers()
        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            commit_data = response.json()
            # Pakujemo samo ono što nam scenario traži
            details = {
                "title": commit_data['commit']['message'].split('\n')[0],
                "description": commit_data['commit']['message'],
                "branch": "main",  # GitHub API ne vraća direktno granu iz commit-a, ostavljamo default ili doradjujemo
                "hash": commit_data['sha'],
                "status": "Success", # Može se vaditi iz check-runs API-ja, za sada fiksno
                "author": commit_data['commit']['author']['name'],
                "date": commit_data['commit']['author']['date'],
                "stats": commit_data.get('stats', {}) # Broj izmenjenih linija (povezana metadata)
            }
            return jsonify(details), 200

        return jsonify({"error": "Greska pri ucitavanju detalja aktivnosti."}), 404
@activity_bp.route('/api/activity/list', methods=['POST'])
def get_activity_list():
    data = request.json
    owner = data.get('owner')
    repo = data.get('repo')

    # GitHub "Events" API je najbolji za Feed jer pokriva commit-ove, pull request-ove, itd.
    url = f"https://api.github.com/repos/{owner}/{repo}/events"
    headers = GitHubService.get_headers()
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        events = response.json()
        activity_feed = []

        for event in events[:20]: # Uzimamo poslednjih 20 aktivnosti
            activity_feed.append({
                "id": event.get("id"),
                "type": event.get("type").replace("Event", ""),
                "author": event.get("actor", {}).get("login"),
                "date": event.get("created_at"),
                "title": event.get("payload", {}).get("commits", [{}])[0].get("message", "No description") if event.get("type") == "PushEvent" else f"Activity: {event.get('type')}",
                "sha": event.get("payload", {}).get("commits", [{}])[0].get("sha") if event.get("type") == "PushEvent" else None,
                "repo_full": f"{owner}/{repo}"
            })
        return jsonify(activity_feed), 200

    return jsonify({"error": "Aktivnosti nisu dostupne"}), 404