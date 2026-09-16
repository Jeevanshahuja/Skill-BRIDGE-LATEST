from sqlalchemy import text
from app.database.db import engine

try:
    with engine.connect() as connection:
        result = connection.execute(text("SELECT sqlite_version()"))
        print("Connected to SQLite!")
        print("SQLite version:", result.scalar())
except Exception as e:
    print("Connection Failed!")
    print(e)