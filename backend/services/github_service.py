import requests
import os
from dotenv import load_dotenv

# 1. Specifično učitavanje - tražimo .env u trenutnom folderu
load_dotenv(override=True)

# 2. Pomeri dobijanje tokena UNUTAR funkcije get_headers
# (da bi bio siguran da ga pokupi nakon što load_dotenv odradi svoje)

class GitHubService:
    @staticmethod
    def get_headers():
        # Uzimamo token direktno iz os.environ u trenutku poziva
        token = os.getenv('GITHUB_TOKEN')

        headers = {
            "Accept": "application/vnd.github.v3+json"
        }

        if token:
            headers["Authorization"] = f"token {token}"

        else:
            print("DEBUG: TOKEN NIJE PRONAĐEN! Proveri .env fajl.")

        return headers

    @staticmethod
    def get_repo_details(repo_url):
        try:
            if "/" not in repo_url:
                return None

            parts = repo_url.rstrip('/').split('/')
            if len(parts) < 2:
                return None

            owner, repo = parts[-2], parts[-1]

            url = f"https://api.github.com/repos/{owner}/{repo}"
            response = requests.get(url, headers=GitHubService.get_headers())

            if response.status_code == 200:
                data = response.json()
                # DODAJ OVO: Da bi u terminalu videla koja je grana glavna
                print(f"DEBUG: Repo {repo} koristi granu: {data.get('default_branch')}")
                return data
            return None
        except Exception as e:
            print(f"Greška pri parsiranju URL-a: {e}")
            return None

    @staticmethod
    def get_contributors(owner, repo):
        url = f"https://api.github.com/repos/{owner}/{repo}/contributors"
        response = requests.get(url, headers=GitHubService.get_headers())

        if response.status_code == 200:
            return response.json()
        return []  # Vraćamo praznu listu ako nema podataka

    @staticmethod
    def get_user_repos(username):
        url = f"https://api.github.com/users/{username}/repos"
        response = requests.get(url, headers=GitHubService.get_headers())
        if response.status_code == 200:
            return response.json()
        return None

    @staticmethod
    def get_user_info(username):
        url = f"https://api.github.com/users/{username}"
        response = requests.get(url, headers=GitHubService.get_headers())
        if response.status_code == 200:
            return response.json()
        return None

    @staticmethod
    def get_commit_details(owner, repo, sha):
        url = f"https://api.github.com/repos/{owner}/{repo}/commits/{sha}"
        headers = GitHubService.get_headers()
        print(f"DEBUG: Pozivam GitHub API: {url}")

        response = requests.get(url, headers=headers)

        print(f"DEBUG: Status kod: {response.status_code}")
        if response.status_code != 200:
            print(f"DEBUG: GitHub Error Response: {response.text}")
            return None

        data = response.json()

        # --- OVDE JE BILA GREŠKA, SAD POPRAVLJAMO ---
        # Umesto 'name', prvo tražimo 'login' (to je ono @jacobtylerwalls)
        author_login = data.get('author', {}).get('login')

        # Ako GitHub slučajno nema login (desi se kod starih komita),
        # tek onda uzmi name kao rezervu
        if not author_login:
            author_login = data.get('commit', {}).get('author', {}).get('name')

        return {
            "title": data.get('commit', {}).get('message', '').split('\n')[0],
            "description": data.get('commit', {}).get('message', ''),
            "author": author_login,  # SAD ĆE BITI @USERNAME
            "date": data.get('commit', {}).get('author', {}).get('date'),
            "hash": data.get('sha'),
            "stats": data.get('stats'),
            "files": data.get('files', [])
        }