"""Utility functions for the Mini AI Speaker Agent"""

import os
from PIL import Image
from pathlib import Path
import config


def validate_image(file_path):
    """
    Validate that a file exists and is a valid image.

    Args:
        file_path: Path to the image file

    Returns:
        dict: {
            'valid': bool,
            'error': str or None,
            'format': str or None,
            'size': tuple or None (width, height)
        }
    """
    result = {
        'valid': False,
        'error': None,
        'format': None,
        'size': None
    }

    # Check if file exists
    if not os.path.exists(file_path):
        result['error'] = "File does not exist"
        return result

    # Check file extension
    ext = Path(file_path).suffix.lower()
    if ext not in config.SUPPORTED_IMAGE_FORMATS:
        result['error'] = f"Unsupported image format: {ext}. Supported: {', '.join(config.SUPPORTED_IMAGE_FORMATS)}"
        return result

    # Try to open and validate the image
    try:
        with Image.open(file_path) as img:
            result['valid'] = True
            result['format'] = img.format
            result['size'] = img.size
            return result
    except Exception as e:
        result['error'] = f"Invalid image file: {str(e)}"
        return result


def extract_filename_name(file_path):
    """
    Extract the speaker name from a filename.

    Args:
        file_path: Path to the file

    Returns:
        str: Cleaned name from filename
    """
    filename = Path(file_path).stem
    # Remove common patterns like numbers, underscores, hyphens
    cleaned = filename.replace('_', ' ').replace('-', ' ')
    # Remove extra spaces
    cleaned = ' '.join(cleaned.split())
    return cleaned


def count_words(text):
    """
    Count words in a text string.

    Args:
        text: Text string to count

    Returns:
        int: Word count
    """
    if not text:
        return 0
    return len(text.split())


def check_buzzwords(text):
    """
    Check if text contains forbidden buzzwords.

    Args:
        text: Text to check

    Returns:
        list: List of found buzzwords
    """
    if not text:
        return []

    text_lower = text.lower()
    found_buzzwords = []

    for buzzword in config.FORBIDDEN_BUZZWORDS:
        if buzzword.lower() in text_lower:
            found_buzzwords.append(buzzword)

    return found_buzzwords


def allowed_file(filename, file_type='image'):
    """
    Check if a filename has an allowed extension.

    Args:
        filename: Name of the file
        file_type: Type of file ('image' or 'bio')

    Returns:
        bool: True if allowed, False otherwise
    """
    if '.' not in filename:
        return False

    ext = '.' + filename.rsplit('.', 1)[1].lower()

    if file_type == 'image':
        return ext in config.SUPPORTED_IMAGE_FORMATS
    elif file_type == 'bio':
        return ext in config.SUPPORTED_BIO_FORMATS

    return False


def ensure_directories():
    """Create necessary directories if they don't exist."""
    os.makedirs(config.UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(config.OUTPUT_FOLDER, exist_ok=True)
