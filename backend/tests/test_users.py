from app_models.models import User


def add_user(db, username="pera", email="pera@example.com", role="User"):
    user = User(username=username, email=email, password="hashed", role=role)
    db.session.add(user)
    db.session.commit()
    return user


def test_get_users_empty(client):
    response = client.get("/api/users")
    assert response.status_code == 200
    assert response.get_json() == []


def test_get_users_returns_created_users(client, db):
    add_user(db, username="pera", email="pera@example.com", role="User")
    add_user(db, username="Anja", email="anja@example.com", role="Admin")

    response = client.get("/api/users")
    assert response.status_code == 200

    data = response.get_json()
    usernames = {u["username"] for u in data}
    assert usernames == {"pera", "Anja"}


def test_update_user_username_success(client, db):
    user = add_user(db, username="staroime")

    response = client.put(f"/api/users/{user.user_id}", json={"username": "novoime"})
    assert response.status_code == 200

    updated = User.query.get(user.user_id)
    assert updated.username == "novoime"


def test_update_user_username_conflict(client, db):
    add_user(db, username="zauzeto", email="a@example.com")
    user2 = add_user(db, username="slobodno", email="b@example.com")

    response = client.put(f"/api/users/{user2.user_id}", json={"username": "zauzeto"})
    assert response.status_code == 400


def test_update_user_not_found(client):
    response = client.put("/api/users/9999", json={"username": "bilo_sta"})
    assert response.status_code == 404


def test_delete_user_success(client, db):
    user = add_user(db, username="zabrisanje")

    response = client.delete(f"/api/users/{user.user_id}")
    assert response.status_code == 200
    assert User.query.get(user.user_id) is None


def test_delete_user_not_found(client):
    response = client.delete("/api/users/9999")
    assert response.status_code == 404


def test_delete_protected_admin_forbidden(client, db):
    admin = add_user(db, username="Anja", email="anja@example.com", role="Admin")

    response = client.delete(f"/api/users/{admin.user_id}")
    assert response.status_code == 403
    assert User.query.get(admin.user_id) is not None