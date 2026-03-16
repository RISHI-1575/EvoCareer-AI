import httpx
import logging
from typing import Dict, Optional
from collections import Counter

logger = logging.getLogger(__name__)

GITHUB_API = "https://api.github.com"


async def fetch_github_profile(username: str) -> Optional[Dict]:
    """
    Fetch GitHub profile data including repos, languages, activity.
    No auth needed for public profiles (60 req/hour limit).
    For higher limits add: headers={"Authorization": f"token {GITHUB_TOKEN}"}
    """
    if not username or username.strip() == "":
        return None

    username = username.strip().lstrip("@")
    # Extract username from URL if full URL provided
    if "github.com/" in username:
        username = username.rstrip("/").split("github.com/")[-1].split("/")[0]

    headers = {"Accept": "application/vnd.github.v3+json", "User-Agent": "EvoCareer-AI"}

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # User profile
            user_res = await client.get(f"{GITHUB_API}/users/{username}", headers=headers)
            if user_res.status_code != 200:
                logger.warning(f"GitHub user not found: {username}")
                return None
            user = user_res.json()

            # Repos
            repos_res = await client.get(
                f"{GITHUB_API}/users/{username}/repos",
                headers=headers,
                params={"sort": "updated", "per_page": 30, "type": "owner"},
            )
            repos = repos_res.json() if repos_res.status_code == 200 else []

            # Aggregate languages
            lang_counter: Counter = Counter()
            for repo in repos:
                if repo.get("language"):
                    lang_counter[repo["language"]] += repo.get("stargazers_count", 0) + 1

            top_languages = [lang for lang, _ in lang_counter.most_common(8)]

            # Top repos by stars
            sorted_repos = sorted(repos, key=lambda r: r.get("stargazers_count", 0), reverse=True)
            repo_names   = [r["name"] for r in sorted_repos[:8]]
            repo_topics  = []
            for repo in sorted_repos[:5]:
                repo_topics.extend(repo.get("topics", []))

            total_stars = sum(r.get("stargazers_count", 0) for r in repos)
            total_forks = sum(r.get("forks_count", 0) for r in repos)

            return {
                "username":        username,
                "name":            user.get("name", ""),
                "bio":             user.get("bio", ""),
                "public_repos":    user.get("public_repos", 0),
                "followers":       user.get("followers", 0),
                "following":       user.get("following", 0),
                "top_languages":   top_languages,
                "repo_names":      repo_names,
                "repo_topics":     list(set(repo_topics))[:10],
                "total_stars":     total_stars,
                "total_forks":     total_forks,
                "profile_url":     f"https://github.com/{username}",
            }
    except Exception as e:
        logger.error(f"GitHub fetch error: {e}")
        return None
