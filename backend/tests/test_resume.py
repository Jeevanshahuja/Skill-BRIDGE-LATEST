from .conftest import client


def test_resume_not_found():

    response = client.get("/resume/999999")

    assert response.status_code == 200
    assert response.json()["message"] == "Resume not found"


def test_progress_empty():

    response = client.get("/resume/999999/progress")

    assert response.status_code == 200
    assert response.json() == []


def test_history_unknown_user():

    response = client.get("/resume/history/999999")

    assert response.status_code == 200
    assert response.json() == []