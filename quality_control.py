"""Quality control checker for speaker content"""

import config
import utils
from difflib import SequenceMatcher


class QualityChecker:
    """Run quality control checks on speaker content"""

    def __init__(self):
        self.issues = []
        self.warnings = []

    def check_all(self, speaker_data):
        """
        Run all quality control checks.

        Args:
            speaker_data: dict with speaker information

        Returns:
            dict: {
                'passed': bool,
                'issues': [list of critical issues],
                'warnings': [list of warnings],
                'checklist': {checklist items}
            }
        """
        self.issues = []
        self.warnings = []

        checklist = {
            'headshot_present': False,
            'headshot_valid': False,
            'tech_requirements_specified': False,
            'missing_tech_items': [],
            'session_description_clear': True,
            'vague_language_detected': [],
            'bio_under_limit': True,
            'bio_word_count': 0,
            'name_mismatch': False,
            'buzzwords_found': []
        }

        # Check headshot
        if speaker_data.get('headshot_path'):
            checklist['headshot_present'] = True
            validation = utils.validate_image(speaker_data['headshot_path'])
            if validation['valid']:
                checklist['headshot_valid'] = True
            else:
                self.issues.append(f"Headshot validation failed: {validation['error']}")
        else:
            self.issues.append("No headshot provided")

        # Check bio word count
        bio_text = speaker_data.get('bio', '')
        bio_word_count = utils.count_words(bio_text)
        checklist['bio_word_count'] = bio_word_count

        if bio_word_count > config.MAX_BIO_WORDS:
            checklist['bio_under_limit'] = False
            self.warnings.append(f"Bio is {bio_word_count} words (exceeds {config.MAX_BIO_WORDS} word limit)")

        if bio_word_count < 20:
            self.warnings.append(f"Bio is very short ({bio_word_count} words) - may need more detail")

        # Check for buzzwords in bio and session
        bio_buzzwords = utils.check_buzzwords(bio_text)
        session_buzzwords = utils.check_buzzwords(speaker_data.get('session_description', ''))
        all_buzzwords = list(set(bio_buzzwords + session_buzzwords))

        if all_buzzwords:
            checklist['buzzwords_found'] = all_buzzwords
            self.warnings.append(f"Buzzwords detected: {', '.join(all_buzzwords)}")

        # Check tech requirements
        tech_reqs = speaker_data.get('tech_requirements', '').strip()
        if tech_reqs and len(tech_reqs) > 5:
            checklist['tech_requirements_specified'] = True
        else:
            missing_items = self._get_missing_tech_items(tech_reqs)
            checklist['missing_tech_items'] = missing_items
            if missing_items:
                self.warnings.append(f"Missing tech requirements: {', '.join(missing_items)}")

        # Check session description clarity
        session_desc = speaker_data.get('session_description', '').strip()
        vague_phrases = self._detect_vague_language(session_desc)
        if vague_phrases:
            checklist['session_description_clear'] = False
            checklist['vague_language_detected'] = vague_phrases
            self.warnings.append(f"Vague language detected in session: {', '.join(vague_phrases)}")

        if utils.count_words(session_desc) < 20:
            checklist['session_description_clear'] = False
            self.warnings.append("Session description is very short - needs more detail")

        # Check name consistency
        speaker_name = speaker_data.get('name', '').strip()
        if speaker_data.get('headshot_path') and speaker_name:
            filename_name = utils.extract_filename_name(speaker_data['headshot_path'])
            if not self._names_match(speaker_name, filename_name):
                checklist['name_mismatch'] = True
                self.warnings.append(f"Name mismatch: '{speaker_name}' vs filename '{filename_name}'")

        return {
            'passed': len(self.issues) == 0,
            'issues': self.issues,
            'warnings': self.warnings,
            'checklist': checklist
        }

    def _get_missing_tech_items(self, tech_text):
        """Check for common missing tech requirements."""
        missing = []
        tech_lower = tech_text.lower() if tech_text else ""

        common_items = {
            'microphone': ['mic', 'microphone'],
            'projector/screen': ['projector', 'screen', 'display'],
            'laptop/computer': ['laptop', 'computer', 'pc'],
            'clicker/remote': ['clicker', 'remote', 'advance'],
            'internet': ['internet', 'wifi', 'wi-fi', 'network']
        }

        for item_name, keywords in common_items.items():
            if not any(keyword in tech_lower for keyword in keywords):
                missing.append(item_name)

        return missing

    def _detect_vague_language(self, text):
        """Detect vague or generic phrases."""
        if not text:
            return []

        vague_phrases = [
            'inspiring talk',
            'deep dive',
            'share insights',
            'explore topics',
            'discuss ideas',
            'engaging presentation',
            'interactive session',
            'and more',
            'best practices'
        ]

        text_lower = text.lower()
        detected = []

        for phrase in vague_phrases:
            if phrase in text_lower:
                detected.append(phrase)

        return detected

    def _names_match(self, name1, name2, threshold=0.6):
        """
        Check if two names are similar enough to be considered matching.

        Args:
            name1: First name
            name2: Second name
            threshold: Similarity threshold (0.0 to 1.0)

        Returns:
            bool: True if names match
        """
        if not name1 or not name2:
            return False

        # Normalize names
        name1_norm = ' '.join(name1.lower().split())
        name2_norm = ' '.join(name2.lower().split())

        # Check exact match
        if name1_norm == name2_norm:
            return True

        # Check if one name contains the other
        if name1_norm in name2_norm or name2_norm in name1_norm:
            return True

        # Check similarity ratio
        ratio = SequenceMatcher(None, name1_norm, name2_norm).ratio()
        return ratio >= threshold
