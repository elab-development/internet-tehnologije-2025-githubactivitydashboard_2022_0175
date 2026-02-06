import requests
import os
from github import Github
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
        # Izdvajanje owner/repo iz URL-a
        try:
            parts = repo_url.rstrip('/').split('/')
            owner, repo = parts[-2], parts[-1]

            url = f"https://api.github.com/repos/{owner}/{repo}"
            response = requests.get(url, headers=GitHubService.get_headers())

            if response.status_code == 200:
                return response.json()
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