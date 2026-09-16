import requests
from bs4 import BeautifulSoup

from app.services.youtube_service import search_youtube


def get_courses(query):
    url = f"https://www.coursera.org/search?query={query.replace(' ', '+')}"
    headers = {
        "User-Agent": "Mozilla/5.0"
    }

    try:
        res = requests.get(url, headers=headers, timeout=10)
        res.raise_for_status()

        soup = BeautifulSoup(res.content, "html.parser")

        # Fetch only the first 4 courses
        cards = soup.select("ul.cds-10 li.cds-grid-item")[:4]

        courses = []

        for card in cards:
            title_tag = card.select_one(
                "a.cds-CommonCard-titleLink h3"
            )

            link = card.select_one(
                "a.cds-CommonCard-titleLink"
            )

            institution = card.select_one(
                "div.cds-ProductCard-partners"
            )

            meta = card.select_one(
                "div.cds-CommonCard-metadata p"
            )

            rating = card.select_one(
                "div.cds-RatingStat-meter"
            )

            reviews = card.select_one(
                "div.cds-RatingStat-sizeLabel + div.css-vac8rf"
            )

            meta_text = meta.get_text(strip=True) if meta else ""
            meta_parts = meta_text.split(" · ")

            courses.append({
                "name": (
                    title_tag.get_text(strip=True)
                    if title_tag
                    else "N/A"
                ),

                "link": (
                    f"https://www.coursera.org{link['href']}"
                    if link and link.get("href")
                    else "N/A"
                ),

                "institution": (
                    institution["title"]
                    if institution and institution.has_attr("title")
                    else "N/A"
                ),

                "rating": (
                    rating["aria-valuenow"]
                    if rating and rating.has_attr("aria-valuenow")
                    else "N/A"
                ),

                "reviews": (
                    reviews.get_text(strip=True)
                    if reviews
                    else "N/A"
                ),

                "difficulty": (
                    meta_parts[0]
                    if len(meta_parts) > 0
                    else "N/A"
                ),

                "type": (
                    meta_parts[1]
                    if len(meta_parts) > 1
                    else "N/A"
                ),

                "duration": (
                    meta_parts[2]
                    if len(meta_parts) > 2
                    else "N/A"
                )
            })

        return courses

    except Exception as e:
        print(f"Error while scraping Coursera: {e}")
        return []


def get_learning_resources(skills):
    resources = []

    for skill in skills:
        courses = get_courses(skill)

        resource = {
            "skill": skill,
            "courses": courses,
            "youtube": search_youtube(skill)
        }

        resources.append(resource)

    return resources