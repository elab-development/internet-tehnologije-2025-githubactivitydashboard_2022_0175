from unittest.mock import patch

FAKE_REPO_DETAILS = {
    "full_name": "facebook/react",
    "html_url": "https://github.com/facebook/react",
    "stargazers_count": 200000,
    "default_branch": "main",
}

FAKE_CONTRIBUTORS = [
    {"login": "gaearon", "contributions": 1500},
    {"login": "acdlite", "contributions": 900},
]


@patch("routes.repository_routes.GitHubService.get_repo_details", return_value=FAKE_REPO_DETAILS)
def test_get_repo_info_success(mock_get_repo_details, client):
    response = client.get("/api/repository/facebook/react")
    assert response.status_code == 200
    assert response.get_json()["full_name"] == "facebook/react"


@patch("routes.repository_routes.GitHubService.get_repo_details", return_value=None)
def test_get_repo_info_not_found(mock_get_repo_details, client):
    response = client.get("/api/repository/nepostojeci/repo")
    assert response.status_code == 404


@patch("routes.repository_routes.GitHubService.get_contributors", return_value=FAKE_CONTRIBUTORS)
def test_get_contributors_success(mock_get_contributors, client):
    response = client.get("/api/contributors/facebook/react")
    assert response.status_code == 200
    assert len(response.get_json()) == 2


@patch("routes.repository_routes.GitHubService.get_contributors", return_value=FAKE_CONTRIBUTORS)
def test_get_contributors_with_limit(mock_get_contributors, client):
    response = client.get("/api/contributors/facebook/react?limit=1")
    assert response.status_code == 200
    assert len(response.get_json()) == 1


@patch("routes.repository_routes.GitHubService.get_contributors", return_value=[])
def test_get_contributors_empty(mock_get_contributors, client):
    response = client.get("/api/contributors/facebook/react")
    assert response.status_code == 200
    assert response.get_json() == {"message": "Nema dostupnih contributora"}

@patch("routes.repository_routes.GitHubService.get_repo_languages", return_value={"JavaScript": 1000, "Python": 500})
def test_get_repo_languages_success(mock_get_languages, client):
    response = client.get("/api/repository/facebook/react/languages")
    assert response.status_code == 200
    assert response.get_json() == {"JavaScript": 1000, "Python": 500}


@patch("routes.repository_routes.GitHubService.get_repo_languages", return_value={})
def test_get_repo_languages_empty(mock_get_languages, client):
    response = client.get("/api/repository/facebook/react/languages")
    assert response.status_code == 200
    assert response.get_json() == {}