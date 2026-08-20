from unittest.mock import patch

from app_models.models import db, User, SearchHistory


def add_user(db, username="pera"):
    user = User(username=username, email=f"{username}@example.com", password="hashed")
    db.session.add(user)
    db.session.commit()
    return user


FAKE_GITHUB_USER = {
    "login": "octocat",
    "avatar_url": "https://avatars.githubusercontent.com/u/1",
    "public_repos": 8,
    "followers": 100,
    "following": 9,
    "public_gists": 8,
}

FAKE_REPOS = [{"name": "Hello-World"}, {"name": "Spoon-Knife"}]


@patch("routes.search_routes.GitHubService.get_user_repos", return_value=FAKE_REPOS)
@patch("routes.search_routes.GitHubService.get_user_info", return_value=FAKE_GITHUB_USER)
def test_search_repositories_success(mock_get_user_info, mock_get_user_repos, client):
    response = client.post("/api/search/repositories", json={"query": "octocat"})

    assert response.status_code == 200
    data = response.get_json()
    assert data["login"] == "octocat"
    assert data["type"] == "user"
    assert len(data["repos_list"]) == 2


@patch("routes.search_routes.GitHubService.get_user_info", return_value=None)
def test_search_repositories_user_not_found(mock_get_user_info, client):
    response = client.post("/api/search/repositories", json={"query": "nepostojeci_korisnik"})
    assert response.status_code == 404


@patch("routes.search_routes.GitHubService.get_user_repos", return_value=FAKE_REPOS)
@patch("routes.search_routes.GitHubService.get_user_info", return_value=FAKE_GITHUB_USER)
def test_search_logs_history_when_user_id_present(mock_get_user_info, mock_get_user_repos, client, db):
    user = add_user(db)

    client.post("/api/search/repositories", json={"query": "octocat", "user_id": user.user_id})

    history = db.session.query(SearchHistory).filter_by(user_id=user.user_id).all()
    assert len(history) == 1
    # SearchHistory ima kolonu koja se zove "query", zato joj pristupamo preko __dict__
    assert history[0].__dict__["query"] == "octocat"


def test_get_history_empty(client, db):
    user = add_user(db)
    response = client.get(f"/api/search/history/{user.user_id}")
    assert response.status_code == 200
    assert response.get_json() == []