"""Content processor using Claude API"""

import os
from anthropic import Anthropic
import config
import json


class SpeakerContentProcessor:
    """Process speaker content using Claude API"""

    def __init__(self, api_key=None):
        """Initialize the processor with API key."""
        self.api_key = api_key or os.getenv('ANTHROPIC_API_KEY')
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY not found in environment variables")

        self.client = Anthropic(api_key=self.api_key)

    def process_bio(self, bio_text, speaker_name=None):
        """
        Process speaker bio into three formats.

        Args:
            bio_text: Original bio text
            speaker_name: Speaker's name (optional, for context)

        Returns:
            dict: {
                'short': 50-word version,
                'medium': 100-word version,
                'intro': one-sentence intro
            }
        """
        prompt = f"""You are processing speaker biographical information for an event.

Original bio:
{bio_text}

{f"Speaker name: {speaker_name}" if speaker_name else ""}

Please create THREE versions of this bio following these strict requirements:

1. SHORT VERSION (exactly {config.BIO_LIMITS['short']} words):
   - Concise, highlights key credentials
   - Professional but approachable tone

2. MEDIUM VERSION (exactly {config.BIO_LIMITS['medium']} words):
   - More detail than short version
   - Include relevant experience and expertise
   - Professional but approachable tone

3. ONE-SENTENCE INTRO (1 compelling sentence for an emcee):
   - Exciting and engaging
   - Highlights most impressive credential or achievement
   - Sets up why the audience should listen

IMPORTANT RULES:
{config.TONE_GUIDELINES}

FORBIDDEN WORDS (do not use these): {', '.join(config.FORBIDDEN_BUZZWORDS)}

Return your response as JSON in this exact format:
{{
    "short": "50-word bio here",
    "medium": "100-word bio here",
    "intro": "One-sentence intro here"
}}
"""

        response = self.client.messages.create(
            model=config.CLAUDE_MODEL,
            max_tokens=config.CLAUDE_MAX_TOKENS,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        # Parse the JSON response
        content = response.content[0].text
        # Extract JSON from response (handle cases where Claude adds explanation)
        try:
            # Try to find JSON in the response
            start_idx = content.find('{')
            end_idx = content.rfind('}') + 1
            if start_idx != -1 and end_idx > start_idx:
                json_str = content[start_idx:end_idx]
                return json.loads(json_str)
            else:
                # Fallback if no JSON found
                return {
                    "short": "Error: Could not parse bio",
                    "medium": "Error: Could not parse bio",
                    "intro": "Error: Could not parse bio"
                }
        except json.JSONDecodeError:
            return {
                "short": "Error: Could not parse bio",
                "medium": "Error: Could not parse bio",
                "intro": "Error: Could not parse bio"
            }

    def process_session(self, session_title, session_description):
        """
        Process session information into abstract and takeaways.

        Args:
            session_title: Session title
            session_description: Session description

        Returns:
            dict: {
                'abstract': 75-word abstract,
                'takeaways': [list of 3 takeaways]
            }
        """
        prompt = f"""You are processing session information for an event program.

Session Title: {session_title}

Session Description:
{session_description}

Please create:

1. ABSTRACT (exactly {config.SESSION_LIMITS['abstract']} words):
   - Professional, active voice
   - Focus on what ATTENDEES will learn or gain (not what the speaker will "share")
   - Clear and compelling
   - No vague language

2. KEY TAKEAWAYS (exactly {config.SESSION_LIMITS['takeaways']} bullet points):
   - Specific, actionable outcomes
   - Attendee-focused (what they'll be able to DO)
   - Clear and concrete

IMPORTANT RULES:
{config.TONE_GUIDELINES}

FORBIDDEN WORDS (do not use these): {', '.join(config.FORBIDDEN_BUZZWORDS)}

Return your response as JSON in this exact format:
{{
    "abstract": "75-word abstract here",
    "takeaways": [
        "First specific takeaway",
        "Second specific takeaway",
        "Third specific takeaway"
    ]
}}
"""

        response = self.client.messages.create(
            model=config.CLAUDE_MODEL,
            max_tokens=config.CLAUDE_MAX_TOKENS,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        # Parse the JSON response
        content = response.content[0].text
        try:
            start_idx = content.find('{')
            end_idx = content.rfind('}') + 1
            if start_idx != -1 and end_idx > start_idx:
                json_str = content[start_idx:end_idx]
                return json.loads(json_str)
            else:
                return {
                    "abstract": "Error: Could not parse session",
                    "takeaways": ["Error", "Error", "Error"]
                }
        except json.JSONDecodeError:
            return {
                "abstract": "Error: Could not parse session",
                "takeaways": ["Error", "Error", "Error"]
            }

    def generate_alt_text(self, speaker_name, speaker_bio=None):
        """
        Generate alt text for headshot (without analyzing the actual image).

        Args:
            speaker_name: Speaker's name
            speaker_bio: Optional bio for context

        Returns:
            str: WCAG-compliant alt text
        """
        prompt = f"""Generate professional, WCAG-compliant alt text for a speaker headshot photo.

Speaker Name: {speaker_name}
{f"Bio context: {speaker_bio[:200]}..." if speaker_bio else ""}

The alt text should:
- Be descriptive but concise (1-2 sentences max)
- Follow WCAG 2.1 guidelines
- Be professional
- Focus on describing what's relevant for context

Return ONLY the alt text, nothing else.
"""

        response = self.client.messages.create(
            model=config.CLAUDE_MODEL,
            max_tokens=200,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        return response.content[0].text.strip()
