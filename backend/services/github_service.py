import requests
import os

from dotenv import load_dotenv

# Učitavamo .env fajl da bi os.getenv video GITHUB_TOKEN
load_dotenv()

GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')


class GitHubService:

    @staticmethod
    def get_headers():
        """Pomoćna funkcija za zaglavlja sa tokenom"""
        headers = {
            "Accept": "application/vnd.github.v3+json"
        }
        if GITHUB_TOKEN:
            headers["Authorization"] = f"token {GITHUB_TOKEN}"
        return headers

    @staticmethod
    def get_repo_details(repo_url):
        try:
            # 1. Proveravamo da li URL uopšte sadrži kosu crtu (da li je format owner/repo)
            if "/" not in repo_url:
                print(f"DEBUG: '{repo_url}' nije validan repo URL (nedostaje '/')")
                return None

            parts = repo_url.rstrip('/').split('/')

            # 2. Proveravamo da li imamo bar dva dela nakon splitovanja
            if len(parts) < 2:
                return None

            owner, repo = parts[-2], parts[-1]

            url = f"https://api.github.com/repos/{owner}/{repo}"
            response = requests.get(url, headers=GitHubService.get_headers())

            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            # Sada ovde više nećeš dobijati "index out of range"
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