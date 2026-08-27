from app_models.models import User
from conftest import auth_headers


def add_user(db, username="pera"):
    user = User(username=username, email=f"{username}@example.com", password="hashed")
    db.session.add(user)
    db.session.commit()
    return user


def test_follow_repo_creates_repo_and_follow(client, db):
    user = add_user(db)

    response = client.post(
        "/api/watchlist/follow",
        json={
            "repo_data": {
                "full_name": "facebook/react",
                "html_url": "https://github.com/facebook/react",
            },
        },
        headers=auth_headers(user),
    )
    assert response.status_code == 201
    assert response.get_json()["message"] == "Successfully followed"


def test_follow_repo_missing_data(client, db):
    user = add_user(db)
    response = client.post("/api/watchlist/follow", json={}, headers=auth_headers(user))
    assert response.status_code == 400


def test_follow_repo_requires_token(client):
    # Bez ulogovanog korisnika - 401, ne 400.
    response = client.post("/api/watchlist/follow", json={
        "repo_data": {"full_name": "facebook/react", "html_url": "https://github.com/facebook/react"},
    })
    assert response.status_code == 401


def test_follow_repo_twice_returns_already_following(client, db):
    user = add_user(db)
    repo_data = {
        "full_name": "facebook/react",
        "html_url": "https://github.com/facebook/react",
    }
    headers = auth_headers(user)

    client.post("/api/watchlist/follow", json={"repo_data": repo_data}, headers=headers)
    second = client.post("/api/watchlist/follow", json={"repo_data": repo_data}, headers=headers)

    assert second.status_code == 200
    assert second.get_json()["message"] == "Already following this repository"


def test_following_list_returns_followed_repos(client, db):
    user = add_user(db)
    headers = auth_headers(user)
    client.post(
        "/api/watchlist/follow",
        json={"repo_data": {"full_name": "facebook/react", "html_url": "https://github.com/facebook/react"}},
        headers=headers,
    )

    response = client.get("/api/following", headers=headers)
    assert response.status_code == 200

    data = response.get_json()
    assert len(data) == 1
    assert data[0]["full_name"] == "facebook/react"


def test_following_list_requires_token(client):
    # user_id se vise ne salje kao query parametar - sada je obavezan token.
    response = client.get("/api/following")
    assert response.status_code == 401


def test_following_list_only_shows_own_repos(client, db):
    # Bezbednosna provera: korisnik A ne sme da vidi repo-e korisnika B,
    # cak i da pokusa da posalje tudji user_id kroz query (sto se sada ignorise).
    user_a = add_user(db, username="alice")
    user_b = add_user(db, username="bob")

    client.post(
        "/api/watchlist/follow",
        json={"repo_data": {"full_name": "facebook/react", "html_url": "https://github.com/facebook/react"}},
        headers=auth_headers(user_a),
    )

    response = client.get(f"/api/following?user_id={user_a.user_id}", headers=auth_headers(user_b))
    assert response.status_code == 200
    assert response.get_json() == []


def test_unfollow_repo_success(client, db):
    user = add_user(db)
    headers = auth_headers(user)
    client.post(
        "/api/watchlist/follow",
        json={"repo_data": {"full_name": "facebook/react", "html_url": "https://github.com/facebook/react"}},
        headers=headers,
    )

    response = client.delete("/api/watchlist/unfollow?repo_id=facebook/react", headers=headers)
    assert response.status_code == 200

    following = client.get("/api/following", headers=headers).get_json()
    assert following == []


def test_unfollow_repo_not_found(client, db):
    user = add_user(db)
    response = client.delete("/api/watchlist/unfollow?repo_id=ne/postoji", headers=auth_headers(user))
    assert response.status_code == 404


def test_unfollow_missing_params(client, db):
    user = add_user(db)
    response = client.delete("/api/watchlist/unfollow", headers=auth_headers(user))
    assert response.status_code == 400


def test_unfollow_requires_token(client):
    response = client.delete("/api/watchlist/unfollow?repo_id=facebook/react")
    assert response.status_code == 401