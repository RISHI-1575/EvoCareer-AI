import httpx
import logging
import re
from typing import Dict, Optional
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


def extract_username_from_url(url: str) -> Optional[str]:
    """Extract LinkedIn username from URL."""
    url = url.strip().rstrip("/")
    match = re.search(r'linkedin\.com/in/([^/?]+)', url)
    return match.group(1) if match else None


async def fetch_linkedin_profile(url: str) -> Optional[Dict]:
    """
    Attempt to fetch LinkedIn public profile data.
    Note: LinkedIn heavily restricts scraping. This works for some public profiles.
    For reliable data, use LinkedIn's official API or RapidAPI.
    """
    username = extract_username_from_url(url)
    if not username:
        return None

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept-Language": "en-US,en;q=0.9",
    }

    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            res = await client.get(f"https://www.linkedin.com/in/{username}/", headers=headers)

            if res.status_code in (999, 429, 403):
                logger.warning(f"LinkedIn blocked request for {username}")
                # Return partial data from URL analysis
                return {
                    "username": username,
                    "profile_url": url,
                    "status": "blocked",
                    "experience": [],
                    "skills": [],
                    "education": [],
                }

            soup = BeautifulSoup(res.text, "lxml")

            # Extract name
            name_tag = soup.find("h1")
            name = name_tag.get_text(strip=True) if name_tag else ""

            # Extract headline
            headline_tag = soup.find("div", {"class": re.compile("top-card-layout__headline")})
            headline = headline_tag.get_text(strip=True) if headline_tag else ""

            # Extract skills from meta tags (often available)
            skills = []
            for meta in soup.find_all("meta"):
                content = meta.get("content", "")
                if "skills" in content.lower() or "experience" in content.lower():
                    # Parse skills from meta content
                    words = content.split(",")
                    skills.extend([w.strip() for w in words if len(w.strip()) > 2])

            # Extract experience sections
            experience = []
            exp_sections = soup.find_all(["section", "div"], {"class": re.compile("experience|position")})
            for section in exp_sections[:3]:
                title = section.find(["h3", "h2", "span"])
                if title:
                    experience.append(title.get_text(strip=True))

            return {
                "username":    username,
                "name":        name,
                "headline":    headline,
                "experience":  experience[:5],
                "skills":      skills[:15],
                "education":   [],
                "profile_url": url,
                "status":      "success",
            }

    except Exception as e:
        logger.error(f"LinkedIn fetch error: {e}")
        return {
            "username": username,
            "profile_url": url,
            "status": "error",
            "experience": [],
            "skills": [],
        }
