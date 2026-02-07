from flask import Blueprint, jsonify, request
from services.github_service import GitHubService
from services.repository_service import RepositoryService
import requests

activity_bp = Blueprint('activity', __name__)


@activity_bp.route('/api/repository/details', methods=['POST'])
def get_repo_details_route():
    try:
        data = request.json
        repo_url = data.get('url')
        user_id = data.get('user_id')

        if not repo_url:
            return jsonify({"error": "URL is required"}), 400

        details = GitHubService.get_repo_details(repo_url)

        if not details:
            return jsonify({"error": "Repository not found on GitHub"}), 404

        # --- OVDE JE BILA GREŠKA, EVO POPRAVKE ---
        if user_id:
            from services.search_service import SearchService  # Importuj ovde ako nije na vrhu
            # Umesto follow_repository, zovemo log_search za istoriju!
            SearchService.log_search(user_id, repo_url, "repo_search")
            db_message = "Search logged in history"
        else:
            db_message = "Guest mode: Data not saved"

        # Vraćamo status 200 (OK), a ne status od follow servisa
        return jsonify({"db_status": db_message, "repo_data": details}), 200

    except Exception as e:
        print(f"Greška u repository/details: {e}")
        return jsonify({"error": str(e)}), 500

# --- RUTA ZA TABELU (AKTIVNOSTI) ---
@activity_bp.route('/api/activity/list', methods=['POST'])
def get_activity_list():
    try:
        data = request.json
        owner, repo, filter_type = data.get('owner'), data.get('repo'), data.get('filter', 'All')
        url = f"https://api.github.com/repos/{owner}/{repo}/events?per_page=100"
        headers = GitHubService.get_headers()
        response = requests.get(url, headers=headers)

        events = response.json()
        activity_feed = []
        for event in events:
            raw_type = event.get("type", "").replace("Event", "")
            if filter_type != "All" and raw_type != filter_type: continue

            pusher_login = event.get("actor", {}).get("login")
            payload = event.get("payload", {})
            commits = payload.get("commits", [])

            sha = commits[0].get("sha") if commits else payload.get("head")
            title = commits[0].get("message", "").split('\n')[0] if commits else f"Activity: {raw_type}"

            activity_feed.append({
                "id": event.get("id"),
                "type": raw_type,
                "author": pusher_login,
                "date": event.get("created_at"),
                "title": title,
                "sha": sha,
                "repo_full": f"{owner}/{repo}"
            })
            if len(activity_feed) >= 20: break
        return jsonify(activity_feed), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- RUTA ZA MODAL (DETALJI KOMITA) ---
@activity_bp.route('/api/activity/details/<owner>/<repo>/<sha>', methods=['GET'])
def get_activity_details(owner, repo, sha):
    url = f"https://api.github.com/repos/{owner}/{repo}/commits/{sha}"
    headers = GitHubService.get_headers()
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        data = response.json()

        author_display = data.get("committer", {}).get("login") or data.get("author", {}).get("login")
        if not author_display:
            author_display = data.get("commit", {}).get("author", {}).get("name")

        return jsonify({
            "title": data.get("commit", {}).get("message", "").split('\n')[0],
            "author": author_display,
            "date": data.get("commit", {}).get("author", {}).get("date"),
            "hash": data.get("sha"),
            "description": data.get("commit", {}).get("message"),
            "stats": data.get("stats"),
            "files": data.get("files", [])
        }), 200

    return jsonify({"error": "Commit not found"}), 404