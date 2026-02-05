import requests

class GitHubService:
    @staticmethod
    def get_repo_details(repo_url):
        # Logika za izvlačenje vlasnika i imena iz URL-a
        # Poziv GitHub API-ja: https://api.github.com/repos/{owner}/{repo}
        parts = repo_url.rstrip('/').split('/')
        owner, repo = parts[-2], parts[-1]
        response = requests.get(f"https://api.github.com/repos/{owner}/{repo}")
        return response.json() if response.status_code == 200 else None

    @staticmethod
    def get_contributors(owner, repo):
        response = requests.get(f"https://api.github.com/repos/{owner}/{repo}/contributors")
        return response.json()