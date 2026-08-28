from app_models.models import User
from conftest import auth_headers


def add_user(db, username="pera", email="pera@example.com", role="User"):
    user = User(username=username, email=email, password="hashed", role=role)
    db.session.add(user)
    db.session.commit()
    return user


def test_get_users_empty(client, db):
    # /api/users je sad admin-only ruta - treba nam ulogovan admin token.
    admin = add_user(db, username="Anja", email="anja@example.com", role="Admin")

    response = client.get("/api/users", headers=auth_headers(admin))
    assert response.status_code == 200
    assert response.get_json() == [{"id": admin.user_id, "username": "Anja", "role": "Admin"}]


def test_get_users_requires_admin(client, db):
    # Obican User ne sme da vidi listu korisnika.
    regular = add_user(db, username="pera", email="pera@example.com", role="User")

    response = client.get("/api/users", headers=auth_headers(regular))
    assert response.status_code == 403


def test_get_users_requires_token(client):
    # Bez tokena uopste - 401, ne 200.
    response = client.get("/api/users")
    assert response.status_code == 401


def test_get_users_returns_created_users(client, db):
    add_user(db, username="pera", email="pera@example.com", role="User")
    admin = add_user(db, username="Anja", email="anja@example.com", role="Admin")

    response = client.get("/api/users", headers=auth_headers(admin))
    assert response.status_code == 200

    data = response.get_json()
    usernames = {u["username"] for u in data}
    assert usernames == {"pera", "Anja"}


def test_update_user_username_success(client, db):
    admin = add_user(db, username="Anja", email="anja@example.com", role="Admin")
    user = add_user(db, username="staroime", email="staroime@example.com")

    response = client.put(
        f"/api/users/{user.user_id}",
        json={"username": "novoime"},
        headers=auth_headers(admin),
    )
    assert response.status_code == 200

    updated = User.query.get(user.user_id)
    assert updated.username == "novoime"


def test_update_user_username_conflict(client, db):
    admin = add_user(db, username="Anja", email="anja@example.com", role="Admin")
    add_user(db, username="zauzeto", email="a@example.com")
    user2 = add_user(db, username="slobodno", email="b@example.com")

    response = client.put(
        f"/api/users/{user2.user_id}",
        json={"username": "zauzeto"},
        headers=auth_headers(admin),
    )
    assert response.status_code == 400


def test_update_user_not_found(client, db):
    admin = add_user(db, username="Anja", email="anja@example.com", role="Admin")

    response = client.put(
        "/api/users/9999",
        json={"username": "bilo_sta"},
        headers=auth_headers(admin),
    )
    assert response.status_code == 404


def test_delete_user_success(client, db):
    admin = add_user(db, username="Anja", email="anja@example.com", role="Admin")
    user = add_user(db, username="zabrisanje", email="zabrisanje@example.com")

    response = client.delete(f"/api/users/{user.user_id}", headers=auth_headers(admin))
    assert response.status_code == 200
    assert User.query.get(user.user_id) is None


def test_delete_user_not_found(client, db):
    admin = add_user(db, username="Anja", email="anja@example.com", role="Admin")

    response = client.delete("/api/users/9999", headers=auth_headers(admin))
    assert response.status_code == 404


def test_delete_protected_admin_forbidden(client, db):
    admin = add_user(db, username="Anja", email="anja@example.com", role="Admin")

    response = client.delete(f"/api/users/{admin.user_id}", headers=auth_headers(admin))
    assert response.status_code == 403
    assert User.query.get(admin.user_id) is not None