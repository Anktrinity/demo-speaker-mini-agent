# 🎤 Mini AI Speaker Agent - Content Processor v1

Transform messy, inconsistent speaker packets (bios, headshots, session descriptions, tech requirements) into standardized, professional outputs ready for event registration systems, mobile apps, and marketing materials.

## 🎯 What It Does

The Mini AI Speaker Agent automates the tedious work of standardizing speaker content for events. Upload raw speaker materials and get back:

- **Three Bio Formats**: 50-word (program book), 100-word (website), 1-sentence (emcee intro)
- **Session Content**: 75-word abstract + 3 attendee-focused key takeaways
- **Accessibility**: WCAG-compliant alt text for headshots
- **Quality Control**: Automated checks for missing info, buzzwords, and inconsistencies
- **Excel Export**: Copy-paste ready tables compatible with Cvent, Swoogo, Stova, Whova, Google Sheets

## ✨ Features

### Content Processing
- Converts any bio length/format into professional, concise versions
- Creates attendee-focused session abstracts (no corporate jargon)
- Generates accessible alt text for speaker photos
- Enforces professional tone and active voice

### Quality Control
Automatic checks for:
- ✅ Headshot presence and validity
- ✅ Tech requirements completeness
- ✅ Vague or generic session descriptions
- ✅ Bio word count limits
- ✅ Name mismatches between filename and bio
- ✅ Forbidden buzzwords ("synergy," "thought leader," "rockstar," etc.)

### Edge Case Handling
- Multiple speakers in one batch
- Bios that are 3 pages long or just 2 sentences
- Generic session descriptions ("inspiring talk on leadership")
- Missing tech requirements
- Non-English characters in names
- Headshot filenames that don't match speaker names

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- Anthropic API key ([get one here](https://console.anthropic.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd demo-speaker-mini-agent
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your API key:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```

### Running the Application

```bash
python app.py
```

The application will start on `http://localhost:5000`

Open your browser and navigate to the URL to start processing speaker content!

## 📖 Usage Guide

### Single Speaker Mode

1. Click on "Single Speaker" (default mode)
2. Fill in the form:
   - **Speaker Name**: Full name of the speaker
   - **Bio**: Paste the raw bio (any length, any format)
   - **Headshot**: Upload a photo (JPG, PNG, HEIC, etc.)
   - **Session Title**: The name of their talk/session
   - **Session Description**: Raw description (the AI will clean it up)
   - **Tech Requirements**: Optional AV/tech needs
3. Click "Process Speaker Content"
4. Download the Excel file with formatted content

### Batch Processing Mode

1. Click on "Batch Processing"
2. Fill in details for the first speaker
3. Click "+ Add Another Speaker" for additional speakers
4. Repeat as needed
5. Click "Process Speaker Content"
6. Download the Excel file with all speakers' formatted content

### Understanding the Excel Output

The generated Excel file contains three sheets:

1. **Processing Info**: Summary of the processing run
   - Total speakers processed
   - Speakers with issues
   - Speakers with warnings

2. **Speaker Content**: All formatted content
   - Three bio formats
   - Session abstract and takeaways
   - Alt text for headshots
   - Tech requirements
   - Ready to copy/paste into your event platform

3. **Quality Control**: Detailed checklist
   - Headshot validation status
   - Missing tech requirements
   - Vague language detection
   - Buzzword alerts
   - Name mismatch warnings
   - Color-coded issues (red) and warnings (yellow)

## ⚙️ Configuration

Edit `config.py` to customize:

### Word Limits
```python
BIO_LIMITS = {
    "short": 50,        # Program book
    "medium": 100,      # Website
    "intro": 1          # Emcee intro (sentences)
}

SESSION_LIMITS = {
    "abstract": 75,     # Session abstract
    "takeaways": 3      # Number of key takeaways
}

MAX_BIO_WORDS = 500  # Flag bios longer than this
```

### Buzzword List
Add or remove forbidden words:
```python
FORBIDDEN_BUZZWORDS = [
    "synergy",
    "thought leader",
    "rockstar",
    # Add your own...
]
```

### File Upload Settings
```python
SUPPORTED_IMAGE_FORMATS = ['.jpg', '.jpeg', '.png', '.heic', '.webp', '.gif']
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
```

## 🛠️ Project Structure

```
demo-speaker-mini-agent/
├── app.py                 # Flask web application
├── config.py              # Configuration settings
├── processor.py           # Claude API integration
├── quality_control.py     # QC checker
├── excel_export.py        # Excel generation
├── utils.py               # Utility functions
├── requirements.txt       # Python dependencies
├── .env.example          # Environment template
├── .gitignore            # Git ignore rules
├── templates/            # HTML templates
│   ├── base.html
│   ├── index.html
│   └── about.html
├── uploads/              # Uploaded files (auto-created)
└── outputs/              # Generated Excel files (auto-created)
```

## 🎨 Tone & Style Enforcement

The AI enforces these rules automatically:

✅ **Encouraged**:
- Professional but approachable
- Active voice
- Attendee-centric language
- Clear and concise
- Specific and actionable

❌ **Discouraged**:
- Corporate jargon
- Passive voice
- Speaker-centric language ("I will share...")
- Vague phrases ("deep dive," "best practices")
- Buzzwords (see config for full list)

## 🔧 Technical Details

- **Framework**: Flask (Python)
- **AI Model**: Claude Sonnet 4.5 (latest)
- **Image Processing**: Pillow
- **Excel Generation**: openpyxl
- **Supported Image Formats**: JPG, PNG, HEIC, WebP, GIF
- **Max Upload Size**: 10MB per file

## 🐛 Troubleshooting

### "ANTHROPIC_API_KEY not found"
- Make sure you created a `.env` file
- Verify your API key is correctly set in `.env`
- Restart the application after adding the key

### "Invalid image file"
- Check that the file is actually an image
- Try converting to JPG or PNG
- Ensure the file isn't corrupted

### Excel file won't open
- Make sure you have Excel or compatible software
- Try opening with Google Sheets or LibreOffice
- Check that the file finished downloading completely

### Processing takes a long time
- Normal for batch processing multiple speakers
- Claude API calls take a few seconds each
- Be patient - quality takes time!

## 📝 Example Workflow

1. Event organizer receives 10 speaker packets via email
2. Some bios are 3 paragraphs, some are 1 sentence
3. Session descriptions are vague ("engaging talk on innovation")
4. Headshot filenames don't match speaker names
5. Tech requirements are missing or incomplete

**After processing**:
1. All bios standardized to 50, 100, and 1-sentence versions
2. Session abstracts are clear, attendee-focused, and professional
3. Quality control sheet flags all issues and missing items
4. Content is ready to copy/paste into event registration system
5. Time saved: Hours of manual editing!

## 🔒 Privacy & Security

- Uploaded files are stored locally in the `uploads/` folder
- Files are not sent anywhere except to Claude API for processing
- No data is stored permanently (you can delete uploads after processing)
- Add `uploads/` and `outputs/` to `.gitignore` to avoid committing sensitive data

## 📄 License

This project is provided as-is for event management and content processing purposes.

## 🤝 Contributing

This is a demo project. Feel free to fork and customize for your needs!

## 💡 Tips for Best Results

1. **Be thorough**: Provide as much context as possible
2. **Upload good headshots**: Clear, professional photos work best
3. **Spell-check names**: The AI can't fix typos in names
4. **Use batch mode wisely**: Process related speakers together
5. **Review QC sheet**: Always check the quality control tab before finalizing
6. **Keep original files**: Save a copy before processing in case you need to revert

## 🎯 Coming Soon (Maybe!)

- PDF bio upload support
- Multiple session tracks per speaker
- Custom branding/templates
- Direct integration with event platforms
- Speaker photo editing/cropping
- Bulk email generation

---

**Built with ❤️ using Claude AI** | Version 1.0
