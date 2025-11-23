#!/usr/bin/env python3
"""
Speaker Packet Processor Web Interface
Simple Flask app for processing speaker packets through a web interface.
"""

import os
import glob
import uuid
from datetime import datetime
from pathlib import Path
from flask import Flask, render_template, request, jsonify, send_file, flash, redirect, url_for
from werkzeug.utils import secure_filename
from speaker_packet_processor import SpeakerPacketProcessor

app = Flask(__name__)
app.secret_key = 'speaker-processor-2024'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Create directories for uploads and outputs
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

processor = SpeakerPacketProcessor()

@app.route('/')
def index():
    """Main page with directory input and file upload options."""
    return render_template('index.html')

@app.route('/process_directory', methods=['POST'])
def process_directory():
    """Process speaker packets from a local directory path."""
    directory_path = request.form.get('directory_path', '').strip()

    if not directory_path:
        return jsonify({'error': 'Please provide a directory path'}), 400

    if not os.path.exists(directory_path):
        return jsonify({'error': f'Directory does not exist: {directory_path}'}), 400

    if not os.path.isdir(directory_path):
        return jsonify({'error': f'Path is not a directory: {directory_path}'}), 400

    try:
        # Find speaker packet files (multiple formats)
        extensions = ['*.txt', '*.docx', '*.pdf', '*.csv']
        files = []
        for ext in extensions:
            files.extend(glob.glob(os.path.join(directory_path, f"speaker_packet_{ext}")))
            files.extend(glob.glob(os.path.join(directory_path, f"speaker_{ext}")))

        files = list(set(files))  # Remove duplicates

        if not files:
            return jsonify({'error': f'No speaker packet files found in {directory_path}. Looking for files matching: speaker_packet_*.txt, speaker_packet_*.docx, speaker_packet_*.pdf, speaker_packet_*.csv'}), 400

        # Process files
        results = []
        for file_path in files:
            try:
                result = processor.process_speaker(file_path)
                results.append(result)
            except Exception as e:
                return jsonify({'error': f'Error processing {os.path.basename(file_path)}: {str(e)}'}), 500

        # Export to Excel (let the processor generate the speaker-named filename)
        full_path = processor.export_to_excel(results)
        output_filename = os.path.basename(full_path)

        return jsonify({
            'success': True,
            'message': f'Successfully processed {len(results)} speaker(s)',
            'speakers': [r['Speaker Name'] for r in results],
            'output_file': output_filename,
            'download_url': f'/download/{output_filename}',
            'results': results
        })

    except Exception as e:
        return jsonify({'error': f'Processing error: {str(e)}'}), 500

@app.route('/upload_files', methods=['POST'])
def upload_files():
    """Handle file uploads and process them."""
    if 'files' not in request.files:
        return jsonify({'error': 'No files selected'}), 400

    files = request.files.getlist('files')
    if not files or all(f.filename == '' for f in files):
        return jsonify({'error': 'No files selected'}), 400

    try:
        # Create unique session folder
        session_id = str(uuid.uuid4())[:8]
        session_folder = os.path.join(UPLOAD_FOLDER, session_id)
        os.makedirs(session_folder, exist_ok=True)

        # Save uploaded files
        saved_files = []
        allowed_extensions = ['.txt', '.docx', '.pdf', '.csv']

        for file in files:
            if file and any(file.filename.lower().endswith(ext) for ext in allowed_extensions):
                filename = secure_filename(file.filename)
                file_path = os.path.join(session_folder, filename)
                file.save(file_path)
                saved_files.append(file_path)

        if not saved_files:
            return jsonify({'error': 'No valid files found. Please upload .txt, .docx, .pdf, or .csv files'}), 400

        # Process files
        results = []
        for file_path in saved_files:
            if 'speaker_packet' in os.path.basename(file_path).lower():
                try:
                    result = processor.process_speaker(file_path)
                    results.append(result)
                except Exception as e:
                    return jsonify({'error': f'Error processing {os.path.basename(file_path)}: {str(e)}'}), 500

        if not results:
            return jsonify({'error': 'No valid speaker packet files found. Files should be named like "speaker_packet_*" with extensions: .txt, .docx, .pdf, .csv'}), 400

        # Export to Excel (let the processor generate the speaker-named filename)
        full_path = processor.export_to_excel(results)
        output_filename = os.path.basename(full_path)

        return jsonify({
            'success': True,
            'message': f'Successfully processed {len(results)} speaker(s)',
            'speakers': [r['Speaker Name'] for r in results],
            'output_file': output_filename,
            'download_url': f'/download/{output_filename}',
            'results': results
        })

    except Exception as e:
        return jsonify({'error': f'Upload processing error: {str(e)}'}), 500

@app.route('/download/<filename>')
def download_file(filename):
    """Download processed Excel file."""
    file_path = os.path.join(OUTPUT_FOLDER, filename)
    if not os.path.exists(file_path):
        return jsonify({'error': 'File not found'}), 404

    return send_file(file_path, as_attachment=True)

@app.route('/list_outputs')
def list_outputs():
    """List all generated output files."""
    files = []
    for filename in os.listdir(OUTPUT_FOLDER):
        if filename.endswith('.xlsx'):
            file_path = os.path.join(OUTPUT_FOLDER, filename)
            stat = os.stat(file_path)
            files.append({
                'name': filename,
                'size': stat.st_size,
                'created': datetime.fromtimestamp(stat.st_ctime).strftime('%Y-%m-%d %H:%M:%S'),
                'download_url': f'/download/{filename}'
            })

    # Sort by creation time (newest first)
    files.sort(key=lambda x: x['created'], reverse=True)
    return jsonify(files)

@app.route('/generate_linkedin_posts', methods=['POST'])
def generate_linkedin_posts():
    """Generate LinkedIn posts for processed speakers."""
    try:
        data = request.get_json()
        if not data or 'speakers' not in data:
            return jsonify({'error': 'No speaker data provided'}), 400

        all_posts = []
        for speaker_data in data['speakers']:
            posts = processor.generate_linkedin_posts(speaker_data)
            all_posts.append({
                'speaker_name': speaker_data.get('Speaker Name', 'Unknown'),
                'posts': posts
            })

        return jsonify({
            'success': True,
            'social_posts': all_posts
        })

    except Exception as e:
        return jsonify({'error': f'Error generating posts: {str(e)}'}), 500

if __name__ == '__main__':
    print("🎤 Speaker Packet Processor Web Interface")
    print("=" * 50)
    print("🌐 Starting server at: http://localhost:5000")
    print("📁 Upload folder:", os.path.abspath(UPLOAD_FOLDER))
    print("📊 Output folder:", os.path.abspath(OUTPUT_FOLDER))
    print("=" * 50)

    app.run(debug=True, host='0.0.0.0', port=5000)