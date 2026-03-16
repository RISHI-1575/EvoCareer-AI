import re
import logging
from typing import Dict, List, Optional
import numpy as np

logger = logging.getLogger(__name__)

# ─── Lazy-load heavy models ───────────────────────────────────────────────────

_spacy_model = None
_sentence_model = None
_bert_classifier = None
_bert_vectorizer = None

def get_spacy():
    global _spacy_model
    if _spacy_model is None:
        try:
            import spacy
            try:
                _spacy_model = spacy.load("en_core_web_trf")
                logger.info("Loaded en_core_web_trf")
            except OSError:
                _spacy_model = spacy.load("en_core_web_sm")
                logger.info("Loaded en_core_web_sm (fallback)")
        except Exception as e:
            logger.error(f"SpaCy load failed: {e}")
    return _spacy_model

def get_sentence_model():
    global _sentence_model
    if _sentence_model is None:
        try:
            from sentence_transformers import SentenceTransformer
            _sentence_model = SentenceTransformer("all-MiniLM-L6-v2")
            logger.info("Loaded sentence transformer")
        except Exception as e:
            logger.error(f"Sentence transformer load failed: {e}")
    return _sentence_model

# ─── Vocabulary banks ─────────────────────────────────────────────────────────

TECH_SKILLS = {
    "python","javascript","typescript","java","c++","c#","rust","go","ruby","php","swift","kotlin",
    "react","vue","angular","next.js","nuxt","svelte","node.js","express","fastapi","django","flask",
    "spring","laravel","rails","graphql","rest api","grpc","websocket",
    "sql","postgresql","mysql","sqlite","mongodb","redis","elasticsearch","cassandra","dynamodb",
    "machine learning","deep learning","nlp","computer vision","reinforcement learning","llm",
    "pytorch","tensorflow","keras","scikit-learn","hugging face","langchain","openai","gemini",
    "docker","kubernetes","terraform","ansible","jenkins","github actions","circleci",
    "aws","gcp","azure","vercel","railway","heroku","cloudflare",
    "linux","bash","git","ci/cd","devops","sre","microservices","serverless",
    "html","css","tailwind","sass","webpack","vite","figma","adobe xd",
}

SOFT_SKILLS = {
    "leadership","communication","problem solving","critical thinking","teamwork","collaboration",
    "project management","agile","scrum","kanban","product management","strategic planning",
    "mentoring","coaching","public speaking","negotiation","stakeholder management",
    "data analysis","business analysis","requirements gathering","user research",
    "time management","prioritisation","adaptability","creativity","innovation",
}

ALL_SKILLS = TECH_SKILLS | SOFT_SKILLS

TOOLS = {
    "git","github","gitlab","bitbucket","jira","confluence","notion","linear","asana","trello",
    "slack","teams","zoom","figma","sketch","invision","miro","lucidchart",
    "vs code","intellij","pycharm","vim","neovim","xcode","android studio",
    "postman","insomnia","swagger","datadog","grafana","prometheus","sentry","pagerduty",
    "tableau","power bi","looker","metabase","dbt","airflow","spark","kafka","rabbitmq",
    "jupyter","google colab","hugging face hub","weights & biases","mlflow",
    "excel","google sheets","salesforce","hubspot","stripe","twilio",
}

DOMAINS = {
    "fintech","healthtech","edtech","ecommerce","saas","enterprise software","cybersecurity",
    "blockchain","ai","machine learning","robotics","iot","gaming","media","logistics",
    "supply chain","hr tech","legal tech","prop tech","climate tech","biotech","deeptech",
    "b2b","b2c","marketplace","platform","infrastructure","developer tools",
}

HEDGING_PHRASES = [
    "i think","i believe","maybe","perhaps","probably","possibly","i guess","i suppose",
    "sort of","kind of","might be","could be","not sure","i feel like","hopefully","somewhat",
    "i suppose","to be honest","if i'm being honest","not entirely sure",
]

FILLER_WORDS = ["um","uh","like","you know","basically","literally","actually","just","right","so"]

POWER_WORDS = [
    "led","built","delivered","achieved","expert","proven","launched","grew","managed",
    "increased","created","drove","designed","architected","scaled","optimised","transformed",
    "spearheaded","pioneered","established","developed","implemented","deployed","shipped",
]

# ─── Intent Training Data ─────────────────────────────────────────────────────

INTENT_TRAINING = [
    ("looking for a software engineer job", "job"),
    ("seeking full-time position in data science", "job"),
    ("want to apply for a product manager role", "job"),
    ("preparing for engineering interviews", "job"),
    ("applying to FAANG companies", "job"),
    ("need resume review for job application", "job"),
    ("building a SaaS startup for healthcare", "startup"),
    ("founding a company in edtech space", "startup"),
    ("startup idea for food delivery app", "startup"),
    ("raise seed funding for fintech app", "startup"),
    ("building MVP and looking for co-founder", "startup"),
    ("launching B2B software company", "startup"),
    ("PhD research in machine learning", "research"),
    ("academic career computational biology", "research"),
    ("publishing papers NLP deep learning", "research"),
    ("postdoctoral fellowship university professor", "research"),
    ("transitioning from finance to software engineering", "career_switch"),
    ("switching careers from teaching to UX design", "career_switch"),
    ("changing from marketing to data analytics", "career_switch"),
    ("lawyer wanting to move into product management", "career_switch"),
    ("pivot mechanical engineering to machine learning", "career_switch"),
    ("freelancing as a consultant", "freelance"),
    ("building personal brand and consulting practice", "freelance"),
]

_intent_clf = None
_intent_vec = None

def get_intent_classifier():
    global _intent_clf, _intent_vec
    if _intent_clf is None:
        try:
            from sklearn.feature_extraction.text import TfidfVectorizer
            from sklearn.linear_model import LogisticRegression
            texts  = [t for t, _ in INTENT_TRAINING]
            labels = [l for _, l in INTENT_TRAINING]
            vec = TfidfVectorizer(ngram_range=(1,2), max_features=1000)
            X   = vec.fit_transform(texts)
            clf = LogisticRegression(max_iter=500, C=2.0, random_state=42)
            clf.fit(X, labels)
            _intent_clf = clf
            _intent_vec = vec
        except Exception as e:
            logger.error(f"Intent classifier failed: {e}")
    return _intent_clf, _intent_vec

# ─── NER-based Entity Extraction ─────────────────────────────────────────────

def extract_entities_ner(text: str) -> Dict:
    """Use SpaCy NER + vocabulary matching for skill/tool/domain/role extraction."""
    lower = text.lower()
    nlp   = get_spacy()

    # Vocabulary matching (fast, comprehensive)
    skills  = sorted({s for s in ALL_SKILLS  if re.search(r'\b' + re.escape(s) + r'\b', lower)})[:15]
    tools   = sorted({t for t in TOOLS       if re.search(r'\b' + re.escape(t) + r'\b', lower)})[:10]
    domains = sorted({d for d in DOMAINS     if re.search(r'\b' + re.escape(d) + r'\b', lower)})[:8]

    # SpaCy NER for ORG (companies/tools), PERSON, roles
    ner_orgs  = []
    ner_roles = []

    if nlp:
        doc = nlp(text[:2000])  # limit for performance
        for ent in doc.ents:
            if ent.label_ in ("ORG", "PRODUCT") and len(ent.text) > 2:
                candidate = ent.text.lower().strip()
                if candidate in TOOLS and candidate not in tools:
                    tools.append(candidate)
                elif candidate not in ner_orgs:
                    ner_orgs.append(ent.text)
            elif ent.label_ in ("WORK_OF_ART",):
                if ent.text.lower() in TECH_SKILLS:
                    skills.append(ent.text.lower())

        # Extract role patterns via dependency parsing
        role_patterns = [
            r"\b(senior|lead|principal|staff|chief|head of|director of|vp of|manager of)\s+\w+\b",
            r"\b(software|data|ml|ai|product|ux|ui|devops|backend|frontend|full.?stack)\s+(engineer|developer|scientist|analyst|designer|architect|manager|lead)\b",
            r"\b(cto|ceo|coo|cpo|vp|svp|evp)\b",
            r"\b(founder|co-founder|founding engineer)\b",
        ]
        for pat in role_patterns:
            for m in re.finditer(pat, lower):
                role = m.group().strip()
                if role not in ner_roles:
                    ner_roles.append(role)

    # Add Agile and methodology skills if mentioned
    methodology_keywords = {
        "agile": "agile", "scrum": "scrum", "kanban": "kanban",
        "lean": "lean", "waterfall": "waterfall", "devops": "devops",
        "tdd": "tdd", "bdd": "bdd", "ci/cd": "ci/cd",
        "design thinking": "design thinking", "six sigma": "six sigma",
    }
    for kw, label in methodology_keywords.items():
        if kw in lower and label not in skills:
            skills.append(label)

    return {
        "skills":  list(dict.fromkeys(skills))[:15],
        "tools":   list(dict.fromkeys(tools))[:10],
        "domains": domains[:8],
        "roles":   list(dict.fromkeys(ner_roles))[:6],
        "organizations": ner_orgs[:5],
    }

# ─── Sentence Embedding Similarity ───────────────────────────────────────────

def compute_embedding_features(text: str) -> Dict:
    """Compute semantic richness using sentence embeddings."""
    model = get_sentence_model()
    if not model:
        return {"semantic_density": 0.5, "avg_sentence_similarity": 0.5}

    sentences = [s.strip() for s in re.split(r'[.!?]', text) if len(s.strip()) > 10]
    if len(sentences) < 2:
        return {"semantic_density": 0.5, "avg_sentence_similarity": 0.5}

    try:
        embeddings = model.encode(sentences[:20], convert_to_numpy=True)
        # Compute pairwise cosine similarities
        norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
        normed = embeddings / (norms + 1e-9)
        sim_matrix = np.dot(normed, normed.T)
        # Average off-diagonal similarity = semantic coherence
        n = len(sentences)
        if n > 1:
            mask = ~np.eye(n, dtype=bool)
            avg_sim = float(sim_matrix[mask].mean())
        else:
            avg_sim = 0.5

        # Semantic density = how much unique content (lower similarity = more diverse = richer)
        semantic_density = 1.0 - avg_sim
        return {
            "semantic_density":        round(semantic_density, 3),
            "avg_sentence_similarity": round(avg_sim, 3),
            "sentence_count":          len(sentences),
        }
    except Exception as e:
        logger.warning(f"Embedding computation failed: {e}")
        return {"semantic_density": 0.5, "avg_sentence_similarity": 0.5}

# ─── Optimised Communication Analysis ────────────────────────────────────────

def analyze_confidence(text: str) -> Dict:
    lower = text.lower()
    words = lower.split()
    sentences = [s.strip() for s in re.split(r'[.!?]', text) if s.strip()]

    # Hedging and fillers
    hedging = [p for p in HEDGING_PHRASES if re.search(r'\b' + re.escape(p) + r'\b', lower)]
    fillers = [w for w in FILLER_WORDS if re.search(r'\b' + w + r'\b', lower)]

    # Passive voice detection
    passive_matches = re.findall(
        r'\b(was|were|been|being|is|are|am)\s+\w+ed\b|\b(was|were)\s+being\s+\w+ed\b',
        text, re.I
    )
    passive_count = len(passive_matches)

    # Power words
    power_count = sum(1 for w in POWER_WORDS if re.search(r'\b' + w + r'\b', lower))

    # Vocabulary richness (Type-Token Ratio)
    ttr = len(set(words)) / max(len(words), 1)

    # Average sentence length
    avg_sent_len = len(words) / max(len(sentences), 1)

    # Readability proxy (shorter sentences + simpler words = more readable)
    readability = max(0, min(100, 100 - (avg_sent_len - 15) * 2))

    # Quantification detection (numbers, percentages, metrics)
    quantification = len(re.findall(
        r'\b\d+[%xX]?\b|\b\d+\s*(million|billion|thousand|k|m)\b|\b(increased|decreased|grew|reduced)\s+by\s+\d+',
        lower
    ))

    # Sentiment score
    pos_count = sum(1 for w in POWER_WORDS if w in lower)
    neg_words  = ["failed","struggled","difficulty","problem","issue","challenge","weak","poor"]
    neg_count  = sum(1 for w in neg_words if w in lower)
    sentiment  = min(1.0, max(0.1, 0.4 + pos_count * 0.06 - neg_count * 0.04))

    # Hesitation score (0-100, lower is better)
    hesitation = min(100, len(hedging)*10 + passive_count*6 + len(fillers)*7)

    # Final confidence score (0-100)
    confidence = max(10, min(98,
        ttr * 30
        + sentiment * 30
        + power_count * 4
        + quantification * 5
        + (readability / 100) * 15
        - hesitation * 0.3
        + min(len(words) / 10, 10)
    ))

    return {
        "passive_voice_count":   passive_count,
        "hedging_phrases":       hedging,
        "filler_words":          fillers,
        "sentiment_score":       round(sentiment, 3),
        "vocabulary_richness":   round(ttr, 3),
        "hesitation_score":      round(hesitation, 1),
        "confidence_score":      round(confidence, 1),
        "power_word_count":      power_count,
        "quantification_count":  quantification,
        "readability_score":     round(readability, 1),
        "avg_sentence_length":   round(avg_sent_len, 1),
        "word_count":            len(words),
    }

# ─── Intent Classification ────────────────────────────────────────────────────

def classify_intent(text: str) -> Dict:
    clf, vec = get_intent_classifier()
    if clf and vec:
        X = vec.transform([text.lower()])
        label = clf.predict(X)[0]
        proba = float(max(clf.predict_proba(X)[0]))
    else:
        label, proba = "job", 0.70
    return {"intent_label": label, "intent_confidence": round(proba, 3)}

# ─── Main processor ───────────────────────────────────────────────────────────

def process_text(text: str, resume_text: str = "", github_data: Optional[Dict] = None, linkedin_data: Optional[Dict] = None) -> Dict:
    """
    Full pipeline: combines user text + resume + GitHub + LinkedIn
    for maximum accuracy.
    """
    # Merge all sources
    combined = text
    if resume_text:
        combined += "\n\n" + resume_text
    if github_data:
        langs = ", ".join(github_data.get("top_languages", []))
        repos = ", ".join(github_data.get("repo_names", [])[:5])
        combined += f"\n\nGitHub: Languages: {langs}. Repos: {repos}."
    if linkedin_data:
        exp   = "; ".join(linkedin_data.get("experience", [])[:3])
        skills_li = ", ".join(linkedin_data.get("skills", [])[:10])
        combined += f"\n\nLinkedIn Experience: {exp}. LinkedIn Skills: {skills_li}."

    intent      = classify_intent(combined)
    entities    = extract_entities_ner(combined)
    conf        = analyze_confidence(text)  # confidence only on raw text
    embeddings  = compute_embedding_features(combined)

    return {
        "intent_label":        intent["intent_label"],
        "intent_confidence":   intent["intent_confidence"],
        "entities":            entities,
        "confidence_analysis": {**conf, **embeddings},
    }
