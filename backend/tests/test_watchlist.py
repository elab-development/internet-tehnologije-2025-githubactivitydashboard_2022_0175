from app_models.models import User


def add_user(db, username="pera"):
    user = User(username=username, email=f"{username}@example.com", password="hashed")
    db.session.add(user)
    db.session.commit()
    return user


def test_follow_repo_creates_repo_and_follow(client, db):
    user = add_user(db)

    response = client.post("/api/watchlist/follow", json={
        "user_id": user.user_id,
        "repo_data": {
            "full_name": "facebook/react",
            "html_url": "https://github.com/facebook/react",
        },
    })
    assert response.status_code == 201
    assert response.get_json()["message"] == "Successfully followed"


def test_follow_repo_missing_data(client):
    response = client.post("/api/watchlist/follow", json={"user_id": 1})
    assert response.status_code == 400


def test_follow_repo_twice_returns_already_following(client, db):
    user = add_user(db)
    repo_data = {
        "full_name": "facebook/react",
        "html_url": "https://github.com/facebook/react",
    }

    client.post("/api/watchlist/follow", json={"user_id": user.user_id, "repo_data": repo_data})
    second = client.post("/api/watchlist/follow", json={"user_id": user.user_id, "repo_data": repo_data})

    assert second.status_code == 200
    assert second.get_json()["message"] == "Already following this repository"


def test_following_list_returns_followed_repos(client, db):
    user = add_user(db)
    client.post("/api/watchlist/follow", json={
        "user_id": user.user_id,
        "repo_data": {"full_name": "facebook/react", "html_url": "https://github.com/facebook/react"},
    })

    response = client.get(f"/api/following?user_id={user.user_id}")
    assert response.status_code == 200

    data = response.get_json()
    assert len(data) == 1
    assert data[0]["full_name"] == "facebook/react"


def test_following_list_missing_user_id(client):
    response = client.get("/api/following")
    assert response.status_code == 400


def test_unfollow_repo_success(client, db):
    user = add_user(db)
    client.post("/api/watchlist/follow", json={
        "user_id": user.user_id,
        "repo_data": {"full_name": "facebook/react", "html_url": "https://github.com/facebook/react"},
    })

    response = client.delete(f"/api/watchlist/unfollow?user_id={user.user_id}&repo_id=facebook/react")
    assert response.status_code == 200

    following = client.get(f"/api/following?user_id={user.user_id}").get_json()
    assert following == []


def test_unfollow_repo_not_found(client, db):
    user = add_user(db)
    response = client.delete(f"/api/watchlist/unfollow?user_id={user.user_id}&repo_id=ne/postoji")
    assert response.status_code == 404


def test_unfollow_missing_params(client):
    response = client.delete("/api/watchlist/unfollow")
    assert response.status_code == 400