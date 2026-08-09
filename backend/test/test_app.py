import os
import pytest
from unittest.mock import patch

# Postavljamo test bazu (SQLite u memoriji) pre nego sto se uvozi app
os.environ['DATABASE_URL'] = 'sqlite:///:memory:'

from app import app, db


@pytest.fixture
def client():
    """Kreira test klijent sa in-memory bazom."""
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'

    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.session.remove()
        db.drop_all()


# 1. Test za uspešan /api/repository/<owner>/<repo_name>
@patch('services.github_service.GitHubService.get_repo_details')
def test_get_repo_info_success(mock_get_details, client):
    mock_get_details.return_value = {
        "name": "react",
        "owner": "facebook",
        "stars": 200000,
        "description": "A JavaScript library for building user interfaces"
    }

    response = client.get('/api/repository/facebook/react')

    assert response.status_code == 200
    assert response.is_json
    data = response.get_json()
    assert data["name"] == "react"
    mock_get_details.assert_called_once_with("facebook/react")


# 2. Test za 404 Not Found repozitorijum
@patch('services.github_service.GitHubService.get_repo_details')
def test_get_repo_info_not_found(mock_get_details, client):
    mock_get_details.return_value = None

    response = client.get('/api/repository/nepostojeci_owner/nepostojeci_repo')

    assert response.status_code == 404
    data = response.get_json()
    assert data["error"] == "Repository not found"


# 3. Test za kontributore sa ?limit= parametrom
@patch('services.github_service.GitHubService.get_contributors')
def test_get_repo_contributors_with_limit(mock_get_contributors, client):
    mock_get_contributors.return_value = [
        {"login": "user1", "contributions": 150},
        {"login": "user2", "contributions": 90},
        {"login": "user3", "contributions": 40}
    ]

    response = client.get('/api/contributors/facebook/react?limit=2')

    assert response.status_code == 200
    data = response.get_json()
    assert len(data) == 2
    assert data[0]["login"] == "user1"


# 4. Test za praznu listu kontributora
@patch('services.github_service.GitHubService.get_contributors')
def test_get_repo_contributors_empty(mock_get_contributors, client):
    mock_get_contributors.return_value = []

    response = client.get('/api/contributors/test/empty-repo')

    assert response.status_code == 200
    data = response.get_json()
    assert data["message"] == "Nema dostupnih contributora"


# 5. Test za nepostojeću rutu (404)
def test_404_handling(client):
    response = client.get('/api/nepostojeca-ruta-12345')
    assert response.status_code == 404