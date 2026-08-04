from flask import Blueprint, jsonify, request
from services.github_service import GitHubService
from services.repository_service import RepositoryService
import requests

activity_bp = Blueprint('activity', __name__)
#posto podaci ne dolaze iz baze sema nema sta da cita, zivi podaci...
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
        owner = data.get('owner') # Vlasnik (npr. 'octocat').
        repo = data.get('repo')   # Naziv (npr. 'Hello-World').
        filter_type = data.get('filter', 'All') # Filter za tip (Push, Watch...).
        # Normalizacija teksta za pretragu autora (mala slova, bez razmaka i @).
        author_filter = data.get('author_filter', '').lower().strip().replace('@', '')

        # RUČNI POZIV: Formiraš URL direktno za 'events' endpoint.
        url = f"https://api.github.com/repos/{owner}/{repo}/events?per_page=100"
        headers = GitHubService.get_headers() # Koristiš servis bar za zaglavlja (token).
        response = requests.get(url, headers=headers)

        if response.status_code != 200:
            return jsonify({"error": "GitHub API error"}), response.status_code

        events = response.json() # Lista od 100 sirovih događaja sa GitHub-a.
        activity_feed = [] # Tvoja pročišćena lista za frontend.

        for event in events: # Prolazimo kroz svaki događaj.
            # 1. FILTRIRANJE TIPA: Čistimo ime (npr. 'PushEvent' -> 'Push').
            raw_type = event.get("type", "").replace("Event", "")
            if filter_type != "All" and raw_type != filter_type:
                continue # Preskačemo ako se ne poklapa sa filterom (npr. tražimo samo Push).

            # 2. IDENTIFIKACIJA: Ko je ovo uradio?
            pusher_login = event.get("actor", {}).get("login", "")

            # 3. FILTRIRANJE AUTORA: Provera da li ime POČINJE slovima koje je korisnik uneo.
            if author_filter:
                if not pusher_login.lower().startswith(author_filter):
                    continue # Ako kucam "al", a user je "bob", preskačem.

            payload = event.get("payload", {})
            commits = payload.get("commits", [])

            # Čupanje SHA koda (identifikatora) i naslova iz dubokog JSON-a.
            sha = commits[0].get("sha") if commits else payload.get("head")
            title = commits[0].get("message", "").split('\n')[0] if commits else f"Activity: {raw_type}"

            # Pakovanje u čist format koji tvoj frontend (React/Vue/JS) očekuje.
            activity_feed.append({
                "id": event.get("id"),
                "type": raw_type,
                "author": pusher_login,
                "date": event.get("created_at"),
                "title": title,
                "sha": sha,
                "repo_full": f"{owner}/{repo}"
            })

            if len(activity_feed) >= 50: # Optimizacija: ne šalji više od 50 stavki.
                break

        return jsonify(activity_feed), 200
    except Exception as e:
        print(f"Greška u get_activity_list: {e}")
        return jsonify({"error": str(e)}), 500
# --- RUTA ZA MODAL (DETALJI KOMITA) ---
@activity_bp.route('/api/activity/details/<owner>/<repo>/<sha>', methods=['GET'])
def get_activity_details(owner, repo, sha):
    # Ponovo ručni poziv jer nam treba specifičan 'commit' endpoint.
    url = f"https://api.github.com/repos/{owner}/{repo}/commits/{sha}"
    headers = GitHubService.get_headers()
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        data = response.json()

        # Logika za pronalaženje imena autora (proverava više polja jer GitHub nije konzistentan).
        author_display = data.get("committer", {}).get("login") or data.get("author", {}).get("login")
        if not author_display:
            author_display = data.get("commit", {}).get("author", {}).get("name")

        return jsonify({
            "title": data.get("commit", {}).get("message", "").split('\n')[0],
            "author": author_display,
            "date": data.get("commit", {}).get("author", {}).get("date"),
            "hash": data.get("sha"),
            "description": data.get("commit", {}).get("message"), # Pun opis za modal.
            "stats": data.get("stats"), # Broj izmena (additions/deletions).
            "files": data.get("files", []) # Lista fajlova.
        }), 200

    return jsonify({"error": "Commit not found"}), 404