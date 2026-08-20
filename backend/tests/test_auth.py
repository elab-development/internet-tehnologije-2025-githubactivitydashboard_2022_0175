def test_register_success(client):
    response = client.post("/api/auth/register", json={
        "username": "novikorisnik",
        "email": "novi@example.com",
        "password": "lozinka123",
    })
    assert response.status_code == 201

    data = response.get_json()
    assert data["username"] == "novikorisnik"
    assert data["email"] == "novi@example.com"
    assert data["role"] == "User"
    # lozinka se nikad ne vraća u odgovoru (load_only polje)
    assert "password" not in data


def test_register_missing_fields(client):
    response = client.post("/api/auth/register", json={"username": "nepotpun"})
    assert response.status_code == 400


def test_register_duplicate_username(client):
    payload = {"username": "isto", "email": "prvi@example.com", "password": "lozinka123"}
    first = client.post("/api/auth/register", json=payload)
    assert first.status_code == 201

    duplicate = client.post("/api/auth/register", json={
        "username": "isto",
        "email": "drugi@example.com",
        "password": "lozinka123",
    })
    assert duplicate.status_code == 400


def test_register_duplicate_email(client):
    client.post("/api/auth/register", json={
        "username": "prvi", "email": "isti@example.com", "password": "lozinka123",
    })

    response = client.post("/api/auth/register", json={
        "username": "drugi", "email": "isti@example.com", "password": "lozinka123",
    })
    assert response.status_code == 400


def test_login_success(client):
    client.post("/api/auth/register", json={
        "username": "loginuser", "email": "login@example.com", "password": "tajna123",
    })

    response = client.post("/api/auth/login", json={
        "username": "loginuser", "password": "tajna123",
    })
    assert response.status_code == 200

    data = response.get_json()
    assert data["username"] == "loginuser"
    assert "user_id" in data


def test_login_wrong_password(client):
    client.post("/api/auth/register", json={
        "username": "loginuser2", "email": "login2@example.com", "password": "tajna123",
    })

    response = client.post("/api/auth/login", json={
        "username": "loginuser2", "password": "pogresna",
    })
    assert response.status_code == 401


def test_login_nonexistent_user(client):
    response = client.post("/api/auth/login", json={
        "username": "nepostojeci", "password": "bilo_sta",
    })
    assert response.status_code == 401