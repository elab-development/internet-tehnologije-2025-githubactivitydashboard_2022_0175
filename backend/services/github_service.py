from collections import Counter
#generalno ova klasa ce biti zaduzena za slanje zahteva ka github apiju
#zato imamo metodu headers kojom cemo praviti zaglavlje za zahteve

import requests
import os
from dotenv import load_dotenv

# 1. Specifično učitavanje - tražimo .env u trenutnom folderu
load_dotenv(override=True)


class GitHubService:
    @staticmethod
    def get_headers():
        # Uzimamo token direktno iz os.environ u trenutku poziva
        token = os.getenv('GITHUB_TOKEN')
        #format preko kog komuniciramo verzija 3 API-ja u jsonu
        headers = {
            "Accept": "application/vnd.github.v3+json" #definisemo kakav
            #odgovor od GitHuba ocekujemo
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
            #ovo je finalni url ka github apiju
            response = requests.get(url, headers=GitHubService.get_headers())
            #resposne je python objekat, pa ga moramo pretvoriti u json zbog fronta
            #ovo je get zahtev kao github apiju
            if response.status_code == 200:
                data = response.json()
                print(f"DEBUG: Repo {repo} koristi granu: {data.get('default_branch')}")
                return data
            return None
        except Exception as e:
            print(f"Greška pri parsiranju URL-a: {e}")
            return None

    @staticmethod
    def get_repo_languages(owner, repo):
        """Vraca broj bajtova koda po programskom jeziku za repozitorijum."""
        url = f"https://api.github.com/repos/{owner}/{repo}/languages"
        response = requests.get(url, headers=GitHubService.get_headers())

        if response.status_code == 200:
            return response.json()  # npr. {"JavaScript": 123456, "Python": 45678}
        return {}

    @staticmethod
    def get_repo_events(owner, repo, filter_type='All', author_filter=''):
        """Vraca filtriranu listu dogadjaja za repo, spremnu za frontend."""
        url = f"https://api.github.com/repos/{owner}/{repo}/events?per_page=100"
        response = requests.get(url, headers=GitHubService.get_headers())

        if response.status_code != 200:
            return None

        author_filter = (author_filter or '').lower().strip().replace('@', '')
        activity_feed = []

        for event in response.json():
            raw_type = event.get("type", "").replace("Event", "")
            if filter_type != "All" and raw_type != filter_type:
                continue

            pusher_login = event.get("actor", {}).get("login", "")
            if author_filter and not pusher_login.lower().startswith(author_filter):
                continue

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

            if len(activity_feed) >= 50:
                break

        return activity_feed
    @staticmethod
    def get_contributors(owner, repo, limit=None):
        url = f"https://api.github.com/repos/{owner}/{repo}/contributors"
        if limit:
            url += f"?per_page={limit}"

        response = requests.get(url, headers=GitHubService.get_headers())

        if response.status_code == 200:
            return response.json()
        return []

    @staticmethod
    def get_user_repos(username): #vraca listu javnoh repo za korisnika
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


        author_login = data.get('author', {}).get('login')

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

