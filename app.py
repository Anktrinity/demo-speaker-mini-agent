"""Flask web application for Mini AI Speaker Agent"""

from flask import Flask, render_template, request, redirect, url_for, flash, send_file
import os
from werkzeug.utils import secure_filename
from datetime import datetime
from dotenv import load_dotenv

import config
import utils
from processor import SpeakerContentProcessor
from quality_control import QualityChecker
from excel_export import ExcelExporter

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['MAX_CONTENT_LENGTH'] = config.MAX_FILE_SIZE

# Ensure necessary directories exist
utils.ensure_directories()


@app.route('/')
def index():
    """Homepage with upload form."""
    return render_template('index.html')


@app.route('/process', methods=['POST'])
def process_speakers():
    """Process uploaded speaker data."""
    try:
        # Initialize processor and checker
        processor = SpeakerContentProcessor()
        qc_checker = QualityChecker()

        speakers_data = []

        # Get form data - check if it's a single speaker or batch
        processing_mode = request.form.get('processing_mode', 'single')

        if processing_mode == 'single':
            speakers_data.append(_process_single_speaker(request, processor, qc_checker))
        else:
            # Batch processing - handle multiple speakers
            speaker_count = int(request.form.get('speaker_count', 1))
            for i in range(speaker_count):
                speaker_data = _process_speaker_index(request, i, processor, qc_checker)
                if speaker_data:
                    speakers_data.append(speaker_data)

        if not speakers_data:
            flash('No valid speaker data to process', 'error')
            return redirect(url_for('index'))

        # Generate Excel export
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_filename = f"speaker_content_{timestamp}.xlsx"
        output_path = os.path.join(config.OUTPUT_FOLDER, output_filename)

        exporter = ExcelExporter()

        # Add metadata
        metadata = {
            'total_speakers': len(speakers_data),
            'speakers_with_issues': sum(1 for s in speakers_data if not s['quality_control']['passed']),
            'speakers_with_warnings': sum(1 for s in speakers_data if s['quality_control']['warnings'])
        }
        exporter.add_metadata_sheet(metadata)

        # Export data
        exporter.export(speakers_data, output_path)

        flash(f'Successfully processed {len(speakers_data)} speaker(s)!', 'success')
        return send_file(output_path, as_attachment=True, download_name=output_filename)

    except Exception as e:
        flash(f'Error processing speakers: {str(e)}', 'error')
        return redirect(url_for('index'))


def _process_single_speaker(request, processor, qc_checker):
    """Process a single speaker from form data."""
    speaker_data = {
        'name': request.form.get('speaker_name', '').strip(),
        'bio': request.form.get('bio', '').strip(),
        'session_title': request.form.get('session_title', '').strip(),
        'session_description': request.form.get('session_description', '').strip(),
        'tech_requirements': request.form.get('tech_requirements', '').strip(),
        'headshot_path': None
    }

    # Handle headshot upload
    if 'headshot' in request.files:
        headshot = request.files['headshot']
        if headshot and headshot.filename:
            filename = secure_filename(headshot.filename)
            filepath = os.path.join(config.UPLOAD_FOLDER, filename)
            headshot.save(filepath)
            speaker_data['headshot_path'] = filepath

    # Process with Claude
    processed_bio = processor.process_bio(speaker_data['bio'], speaker_data['name'])
    processed_session = processor.process_session(
        speaker_data['session_title'],
        speaker_data['session_description']
    )
    alt_text = processor.generate_alt_text(speaker_data['name'], speaker_data['bio'])

    speaker_data['processed'] = {
        'bio': processed_bio,
        'session': processed_session,
        'alt_text': alt_text
    }

    # Run quality control
    qc_results = qc_checker.check_all(speaker_data)
    speaker_data['quality_control'] = qc_results

    return speaker_data


def _process_speaker_index(request, index, processor, qc_checker):
    """Process a speaker at a specific index in batch mode."""
    prefix = f'speaker_{index}_'

    speaker_data = {
        'name': request.form.get(f'{prefix}name', '').strip(),
        'bio': request.form.get(f'{prefix}bio', '').strip(),
        'session_title': request.form.get(f'{prefix}session_title', '').strip(),
        'session_description': request.form.get(f'{prefix}session_description', '').strip(),
        'tech_requirements': request.form.get(f'{prefix}tech_requirements', '').strip(),
        'headshot_path': None
    }

    # Skip empty entries
    if not speaker_data['name'] and not speaker_data['bio']:
        return None

    # Handle headshot upload
    if f'{prefix}headshot' in request.files:
        headshot = request.files[f'{prefix}headshot']
        if headshot and headshot.filename:
            filename = secure_filename(headshot.filename)
            filepath = os.path.join(config.UPLOAD_FOLDER, filename)
            headshot.save(filepath)
            speaker_data['headshot_path'] = filepath

    # Process with Claude
    processed_bio = processor.process_bio(speaker_data['bio'], speaker_data['name'])
    processed_session = processor.process_session(
        speaker_data['session_title'],
        speaker_data['session_description']
    )
    alt_text = processor.generate_alt_text(speaker_data['name'], speaker_data['bio'])

    speaker_data['processed'] = {
        'bio': processed_bio,
        'session': processed_session,
        'alt_text': alt_text
    }

    # Run quality control
    qc_results = qc_checker.check_all(speaker_data)
    speaker_data['quality_control'] = qc_results

    return speaker_data


@app.route('/about')
def about():
    """About page with instructions."""
    return render_template('about.html', config=config)


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
