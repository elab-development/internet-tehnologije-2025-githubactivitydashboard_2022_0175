from unittest.mock import patch

from app_models.models import db, User, SearchHistory
from conftest import auth_headers


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
def test_search_logs_history_for_authenticated_user(mock_get_user_info, mock_get_user_repos, client, db):
    user = add_user(db)

    client.post(
        "/api/search/repositories",
        json={"query": "octocat"},
        headers=auth_headers(user),
    )

    history = db.session.query(SearchHistory).filter_by(user_id=user.user_id).all()
    assert len(history) == 1
    # SearchHistory ima kolonu koja se zove "query", zato joj pristupamo preko __dict__
    assert history[0].__dict__["query"] == "octocat"


@patch("routes.search_routes.GitHubService.get_user_repos", return_value=FAKE_REPOS)
@patch("routes.search_routes.GitHubService.get_user_info", return_value=FAKE_GITHUB_USER)
def test_search_ignores_spoofed_user_id_when_anonymous(mock_get_user_info, mock_get_user_repos, client, db):
    """Anonimni zahtev ne sme upisati istoriju pod tuđim (izmišljenim) user_id-jem."""
    victim = add_user(db, username="zrtva")

    client.post(
        "/api/search/repositories",
        json={"query": "octocat", "user_id": victim.user_id},  # bez tokena - treba da se ignoriše
    )

    history = db.session.query(SearchHistory).filter_by(user_id=victim.user_id).all()
    assert len(history) == 0


def test_get_history_empty(client, db):
    user = add_user(db)
    response = client.get(f"/api/search/history/{user.user_id}", headers=auth_headers(user))
    assert response.status_code == 200
    assert response.get_json() == []


def test_get_history_requires_token(client, db):
    user = add_user(db)
    response = client.get(f"/api/search/history/{user.user_id}")
    assert response.status_code == 401


def test_get_history_forbidden_for_other_user(client, db):
    # Korisnik ne sme da vidi tudju istoriju pretraga.
    owner = add_user(db, username="vlasnik")
    intruder = add_user(db, username="upadac")

    response = client.get(f"/api/search/history/{owner.user_id}", headers=auth_headers(intruder))
    assert response.status_code == 403


def test_get_history_allowed_for_admin(client, db):
    owner = add_user(db, username="vlasnik")
    admin = User(username="Anja", email="anja@example.com", password="hashed", role="Admin")
    db.session.add(admin)
    db.session.commit()

    response = client.get(f"/api/search/history/{owner.user_id}", headers=auth_headers(admin))
    assert response.status_code == 200