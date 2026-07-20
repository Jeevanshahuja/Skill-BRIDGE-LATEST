import os
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

API_KEY = os.getenv("YOUTUBE_API_KEY")


def search_youtube(skill):
    url = "https://www.googleapis.com/youtube/v3/search"

    params = {
        "part": "snippet",
        "q": f"{skill} tutorial",
        "type": "video",
        "maxResults": 2,
        "key": API_KEY,
    }

    response = requests.get(url, params=params)
    print(response)
    data = response.json()

    videos = []

    for item in data.get("items", []):
        video_id = item["id"]["videoId"]

        videos.append(
    {
        "title": item["snippet"]["title"],
        "url": f"https://www.youtube.com/watch?v={video_id}",
        "thumbnail": item["snippet"]["thumbnails"]["high"]["url"],
        "channel": item["snippet"]["channelTitle"],
        "published_at": item["snippet"]["publishedAt"],
    }
    )
    print(videos)
    return videos