from unittest.mock import patch, MagicMock

from services.github_service import GitHubService

RAW_EVENTS = [
    {
        "id": "1",
        "type": "PushEvent",
        "actor": {"login": "gaearon"},
        "created_at": "2026-01-01T00:00:00Z",
        "payload": {"commits": [{"sha": "sha1", "message": "Fix bug\n\ndetalji"}]},
    },
    {
        "id": "2",
        "type": "IssuesEvent",
        "actor": {"login": "acdlite"},
        "created_at": "2026-01-02T00:00:00Z",
        "payload": {"head": "sha2"},
    },
]


def _mock_response(status_code=200, json_data=None):
    mock_resp = MagicMock()
    mock_resp.status_code = status_code
    mock_resp.json.return_value = json_data if json_data is not None else {}
    return mock_resp


@patch("services.github_service.requests.get")
def test_get_repo_events_no_filter_returns_all(mock_get):
    mock_get.return_value = _mock_response(200, RAW_EVENTS)

    result = GitHubService.get_repo_events("owner", "repo")

    assert len(result) == 2
    assert result[0]["type"] == "Push"
    assert result[0]["title"] == "Fix bug"
    assert result[1]["type"] == "Issues"


@patch("services.github_service.requests.get")
def test_get_repo_events_filters_by_type(mock_get):
    mock_get.return_value = _mock_response(200, RAW_EVENTS)

    result = GitHubService.get_repo_events("owner", "repo", filter_type="Push")

    assert len(result) == 1
    assert result[0]["type"] == "Push"


@patch("services.github_service.requests.get")
def test_get_repo_events_filters_by_author(mock_get):
    mock_get.return_value = _mock_response(200, RAW_EVENTS)

    result = GitHubService.get_repo_events("owner", "repo", author_filter="@GAEARON")

    assert len(result) == 1
    assert result[0]["author"] == "gaearon"


@patch("services.github_service.requests.get")
def test_get_repo_events_returns_none_on_error(mock_get):
    mock_get.return_value = _mock_response(404)

    result = GitHubService.get_repo_events("owner", "repo")

    assert result is None


@patch("services.github_service.requests.get")
def test_get_repo_details_parses_owner_repo(mock_get):
    mock_get.return_value = _mock_response(200, {"full_name": "owner/repo"})

    result = GitHubService.get_repo_details("owner/repo")

    assert result == {"full_name": "owner/repo"}
    called_url = mock_get.call_args[0][0]
    assert called_url == "https://api.github.com/repos/owner/repo"


def test_get_repo_details_invalid_url_returns_none():
    assert GitHubService.get_repo_details("nema_kosu_crtu") is None