import os
from unittest.mock import patch, MagicMock

from services.github_service import GitHubService


def fake_response(status_code=200, json_data=None, text=""):
    resp = MagicMock()
    resp.status_code = status_code
    resp.json.return_value = json_data
    resp.text = text
    return resp


# --- get_headers ---

def test_get_headers_without_token():
    with patch.dict(os.environ, {}, clear=True):
        headers = GitHubService.get_headers()
    assert headers["Accept"] == "application/vnd.github.v3+json"
    assert "Authorization" not in headers


def test_get_headers_with_token():
    with patch.dict(os.environ, {"GITHUB_TOKEN": "abc123"}):
        headers = GitHubService.get_headers()
    assert headers["Authorization"] == "token abc123"


# --- get_repo_details ---

@patch('services.github_service.requests.get')
def test_get_repo_details_invalid_url_no_slash(mock_get):
    assert GitHubService.get_repo_details("samoime") is None
    mock_get.assert_not_called()


@patch('services.github_service.requests.get')
def test_get_repo_details_parses_full_github_url(mock_get):
    mock_get.return_value = fake_response(200, {"name": "react", "default_branch": "main"})

    result = GitHubService.get_repo_details("https://github.com/facebook/react/")

    assert result["name"] == "react"
    called_url = mock_get.call_args[0][0]
    assert called_url == "https://api.github.com/repos/facebook/react"


@patch('services.github_service.requests.get')
def test_get_repo_details_returns_none_on_404(mock_get):
    mock_get.return_value = fake_response(404)
    assert GitHubService.get_repo_details("facebook/nepostoji") is None


# --- get_repo_events ---

EVENTS = [
    {"id": "1", "type": "PushEvent", "created_at": "2026-01-01",
     "actor": {"login": "Alice"},
     "payload": {"commits": [{"sha": "aaa", "message": "Fix bug\n\ndetails"}]}},
    {"id": "2", "type": "WatchEvent", "created_at": "2026-01-02",
     "actor": {"login": "bob"}, "payload": {}},
    {"id": "3", "type": "PushEvent", "created_at": "2026-01-03",
     "actor": {"login": "bob"},
     "payload": {"commits": [{"sha": "bbb", "message": "Add feature"}]}},
]


@patch('services.github_service.requests.get')
def test_get_repo_events_maps_fields(mock_get):
    mock_get.return_value = fake_response(200, EVENTS)

    feed = GitHubService.get_repo_events("facebook", "react")

    assert len(feed) == 3
    assert feed[0] == {
        "id": "1", "type": "Push", "author": "Alice", "date": "2026-01-01",
        "title": "Fix bug", "sha": "aaa", "repo_full": "facebook/react"
    }
    assert feed[1]["title"] == "Activity: Watch"
    assert feed[1]["sha"] is None


@patch('services.github_service.requests.get')
def test_get_repo_events_filters_by_type(mock_get):
    mock_get.return_value = fake_response(200, EVENTS)
    feed = GitHubService.get_repo_events("facebook", "react", filter_type="Push")
    assert [e["id"] for e in feed] == ["1", "3"]


@patch('services.github_service.requests.get')
def test_get_repo_events_filters_by_author_case_insensitive(mock_get):
    mock_get.return_value = fake_response(200, EVENTS)
    feed = GitHubService.get_repo_events("facebook", "react", author_filter="@ALI")
    assert [e["id"] for e in feed] == ["1"]


@patch('services.github_service.requests.get')
def test_get_repo_events_caps_at_50(mock_get):
    many = [{"id": str(i), "type": "PushEvent", "actor": {"login": "x"},
             "payload": {}, "created_at": ""} for i in range(100)]
    mock_get.return_value = fake_response(200, many)
    assert len(GitHubService.get_repo_events("o", "r")) == 50


@patch('services.github_service.requests.get')
def test_get_repo_events_returns_none_on_error(mock_get):
    mock_get.return_value = fake_response(500)
    assert GitHubService.get_repo_events("o", "r") is None


# --- get_contributors ---

@patch('services.github_service.requests.get')
def test_get_contributors_adds_per_page_when_limit(mock_get):
    mock_get.return_value = fake_response(200, [{"login": "u1"}])

    GitHubService.get_contributors("facebook", "react", limit=5)

    called_url = mock_get.call_args[0][0]
    assert called_url.endswith("/contributors?per_page=5")


@patch('services.github_service.requests.get')
def test_get_contributors_returns_empty_list_on_error(mock_get):
    mock_get.return_value = fake_response(403)
    assert GitHubService.get_contributors("o", "r") == []


# --- get_commit_details ---

COMMIT = {
    "sha": "abc123",
    "author": {"login": "alice"},
    "commit": {"message": "Naslov\n\nOpis", "author": {"name": "Alice A", "date": "2026-01-01"}},
    "stats": {"total": 3},
    "files": [{"filename": "a.py"}],
}


@patch('services.github_service.requests.get')
def test_get_commit_details_maps_fields(mock_get):
    mock_get.return_value = fake_response(200, COMMIT)

    result = GitHubService.get_commit_details("o", "r", "abc123")

    assert result["title"] == "Naslov"
    assert result["description"] == "Naslov\n\nOpis"
    assert result["author"] == "alice"
    assert result["hash"] == "abc123"
    assert result["files"] == [{"filename": "a.py"}]


@patch('services.github_service.requests.get')
def test_get_commit_details_falls_back_to_commit_author_name(mock_get):
    data = dict(COMMIT, author=None)
    data["author"] = {}
    mock_get.return_value = fake_response(200, data)

    result = GitHubService.get_commit_details("o", "r", "abc123")

    assert result["author"] == "Alice A"


@patch('services.github_service.requests.get')
def test_get_commit_details_returns_none_on_error(mock_get):
    mock_get.return_value = fake_response(404, text="Not Found")
    assert GitHubService.get_commit_details("o", "r", "xxx") is None