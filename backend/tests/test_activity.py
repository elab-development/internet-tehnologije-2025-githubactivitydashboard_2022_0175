from unittest.mock import patch

FAKE_REPO_DETAILS = {"full_name": "facebook/react", "html_url": "https://github.com/facebook/react"}

FAKE_EVENTS = [
    {"id": "1", "type": "Push", "author": "gaearon", "date": "2026-01-01T00:00:00Z",
     "title": "Fix bug", "sha": "abc123", "repo_full": "facebook/react"},
]

FAKE_COMMIT_DETAILS = {
    "title": "Fix bug",
    "description": "Fix bug\n\nDetaljan opis",
    "author": "gaearon",
    "date": "2026-01-01T00:00:00Z",
    "hash": "abc123",
    "stats": {"additions": 5, "deletions": 1},
    "files": [],
}


@patch("routes.activity_routes.GitHubService.get_repo_details", return_value=FAKE_REPO_DETAILS)
def test_get_repo_details_route_success_guest(mock_get_repo_details, client):
    response = client.post("/api/repository/details", json={"url": "facebook/react"})
    assert response.status_code == 200

    data = response.get_json()
    assert data["db_status"] == "Guest mode: Data not saved"
    assert data["repo_data"]["full_name"] == "facebook/react"


def test_get_repo_details_route_missing_url(client):
    response = client.post("/api/repository/details", json={})
    assert response.status_code == 400


@patch("routes.activity_routes.GitHubService.get_repo_details", return_value=None)
def test_get_repo_details_route_not_found(mock_get_repo_details, client):
    response = client.post("/api/repository/details", json={"url": "ne/postoji"})
    assert response.status_code == 404


@patch("routes.activity_routes.GitHubService.get_repo_events", return_value=FAKE_EVENTS)
def test_get_activity_list_success(mock_get_repo_events, client):
    response = client.post("/api/activity/list", json={"owner": "facebook", "repo": "react"})
    assert response.status_code == 200
    assert response.get_json() == FAKE_EVENTS


@patch("routes.activity_routes.GitHubService.get_repo_events", return_value=None)
def test_get_activity_list_github_error(mock_get_repo_events, client):
    response = client.post("/api/activity/list", json={"owner": "facebook", "repo": "react"})
    assert response.status_code == 502


@patch("routes.activity_routes.GitHubService.get_commit_details", return_value=FAKE_COMMIT_DETAILS)
def test_get_activity_details_success(mock_get_commit_details, client):
    response = client.get("/api/activity/details/facebook/react/abc123")
    assert response.status_code == 200
    assert response.get_json()["hash"] == "abc123"


@patch("routes.activity_routes.GitHubService.get_commit_details", return_value=None)
def test_get_activity_details_not_found(mock_get_commit_details, client):
    response = client.get("/api/activity/details/facebook/react/nepostojeci_sha")
    assert response.status_code == 404