"""Configuration settings for the Mini AI Speaker Agent"""

# Word limits for different bio formats
BIO_LIMITS = {
    "short": 50,        # Program book
    "medium": 100,      # Website
    "intro": 1          # One-sentence emcee intro (in sentences, not words)
}

# Session content limits
SESSION_LIMITS = {
    "abstract": 75,     # Session abstract
    "takeaways": 3      # Number of key takeaways
}

# Maximum acceptable bio length before flagging
MAX_BIO_WORDS = 500

# Forbidden buzzwords (will be flagged in quality control)
FORBIDDEN_BUZZWORDS = [
    "synergy",
    "thought leader",
    "rockstar",
    "ninja",
    "guru",
    "disruptive",
    "paradigm shift",
    "game-changer",
    "innovator",
    "visionary"
]

# Tone and style guidelines
TONE_GUIDELINES = """
- Professional but approachable
- No jargon or corporate buzzwords
- Active voice only
- Attendee-centric language (focus on what attendees will learn, not what speakers will "share")
- Clear and concise
- Inclusive and accessible language
"""

# Supported file formats
SUPPORTED_IMAGE_FORMATS = ['.jpg', '.jpeg', '.png', '.heic', '.webp', '.gif']
SUPPORTED_BIO_FORMATS = ['.txt', '.pdf', '.docx', '.doc']

# Upload configuration
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# Claude API settings
CLAUDE_MODEL = "claude-sonnet-4-5-20250929"
CLAUDE_MAX_TOKENS = 4000
