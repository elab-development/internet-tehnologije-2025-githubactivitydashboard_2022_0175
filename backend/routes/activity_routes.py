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

        if user_id:
            from services.search_service import SearchService
            SearchService.log_search(user_id, repo_url, "repo_search")
            db_message = "Search logged in history"
        else:
            db_message = "Guest mode: Data not saved"

        return jsonify({"db_status": db_message, "repo_data": details}), 200
    except Exception as e:
        print(f"Greška u repository/details: {e}")
        return jsonify({"error": str(e)}), 500

# --- IZMENJENA RUTA ZA TABELU (AKTIVNOSTI SA FILTEROM KORISNIKA) ---
@activity_bp.route('/api/activity/list', methods=['POST'])
def get_activity_list():
    try:
        data = request.json
        owner = data.get('owner')
        repo = data.get('repo')
        filter_type = data.get('filter', 'All')
        author_filter = data.get('author_filter', '').lower().strip().replace('@', '')

        # GitHub API limitiran na 100 događaja
        url = f"https://api.github.com/repos/{owner}/{repo}/events?per_page=100"
        headers = GitHubService.get_headers()
        response = requests.get(url, headers=headers)

        if response.status_code != 200:
            return jsonify({"error": "GitHub API error"}), response.status_code

        events = response.json()
        activity_feed = []

        for event in events:
            # 1. Filter po tipu (Push, Watch, itd.)
            raw_type = event.get("type", "").replace("Event", "")
            if filter_type != "All" and raw_type != filter_type:
                continue

            # 2. Identifikacija autora
            pusher_login = event.get("actor", {}).get("login", "")

            # 3. FILTRIRANJE: Provera da li korisničko ime POČINJE sa unetim filterom
            if author_filter:
                if not pusher_login.lower().startswith(author_filter):
                    continue

            payload = event.get("payload", {})
            commits = payload.get("commits", [])

            sha = commits[0].get("sha") if commits else payload.get("head")
            title = commits[0].get("message", "").split('\n')[0] if commits else f"Activity: {raw_type}"
            #samo rpvi red commita
            activity_feed.append({
                "id": event.get("id"),
                "type": raw_type,
                "author": pusher_login,
                "date": event.get("created_at"),
                "title": title,
                "sha": sha,
                "repo_full": f"{owner}/{repo}"
            })

            if len(activity_feed) >= 50:
                break

        return jsonify(activity_feed), 200
    except Exception as e:
        print(f"Greška u get_activity_list: {e}")
        return jsonify({"error": str(e)}), 500
# --- RUTA ZA MODAL (DETALJI KOMITA) ---
@activity_bp.route('/api/activity/details/<owner>/<repo>/<sha>', methods=['GET'])
def get_activity_details(owner, repo, sha):
    url = f"https://api.github.com/repos/{owner}/{repo}/commits/{sha}"
    headers = GitHubService.get_headers()
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        data = response.json()
#"Uzmi korisničko ime onoga ko je uneo (committer), ako to nema,
        # uzmi onoga ko je napisao (author), a ako ni to nema
        # (npr. nalog je obrisan), uzmi obično ime iz teksta komita".
        # Ovo osigurava da polje "Author" u tvojoj aplikaciji nikada
        # ne ostane prazno.
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