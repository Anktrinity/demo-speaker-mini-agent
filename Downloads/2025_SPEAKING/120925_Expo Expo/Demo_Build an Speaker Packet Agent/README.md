# 🎤 Speaker Packet Processor v2.1

**Transform messy speaker content into professional, standardized formats with AI-powered automation.**

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-2.0+-green.svg)](https://flask.palletsprojects.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Demo](https://img.shields.io/badge/Demo-Live-success.svg)](http://localhost:5000)

## ✨ What's New in v2.1

### 🧠 **Intelligent Content Generation**
- **Smart placeholder detection**: Automatically identifies "TBD", "[working title]", "something cool"
- **Contextual title generation**: Creates professional session titles based on speaker expertise
- **Domain-specific intelligence**: Specialized knowledge for AI, cybersecurity, customer experience, leadership
- **Missing content suggestions**: Auto-generates tech requirements and enhanced descriptions

### 📁 **Smart File Management**
- **Speaker-named files**: `speaker_dr_olivia_thorne_20251122.xlsx`
- **Multi-speaker batches**: `speakers_jane_smith_raj_patel_and_others_20251122.xlsx`
- **Intelligent headshot detection**: Automatically finds and references speaker photos
- **Multi-directory search**: Searches upload folders and project directories

### 🎨 **Enhanced User Experience**
- **Persistent download access**: Download links remain available throughout workflow
- **Professional alt text generation**: WCAG-compliant image descriptions
- **Real-time quality reporting**: Comprehensive analysis with actionable feedback
- **Improved error handling**: User-friendly validation and guidance

## 🚀 Core Features

### 📁 **Multi-Format File Processing**
- **Text files** (.txt) - Standard speaker packet format
- **Word documents** (.docx) - Microsoft Word submissions
- **PDF files** (.pdf) - PDF speaker packets with text extraction
- **CSV files** (.csv) - Bulk speaker data imports

### 🎯 **AI-Powered Content Enhancement**
- **3 Bio Formats**: 50-word (program book), 100-word (website), 1-sentence (emcee intro)
- **Session Content**: Professional abstracts with specific takeaways
- **Quality Control**: Automated checks for missing info and consistency issues
- **Buzzword Cleaning**: Removes corporate jargon and replaces with concrete language
- **Placeholder Intelligence**: Transforms vague titles into professional alternatives

### 📱 **LinkedIn Social Media Generator**
- **4 Post Types** per speaker:
  - Speaker Announcement
  - Session Preview with takeaways
  - Expert Highlight
  - Call-to-Action with registration drive
- **One-click copy-paste** functionality
- **Professional hashtags** included
- **Multi-speaker tab interface**

### 🌐 **Web Interface**
- **Drag & drop file upload**
- **Directory path processing**
- **Real-time progress tracking**
- **Instant Excel download**
- **Mobile-responsive design**

### 📊 **Export Options**
- **Excel spreadsheets** ready for event platforms (Cvent, Swoogo, Stova, Whova)
- **Formatted tables** with all processed content
- **Quality flags** highlighting issues needing attention

## 🏁 Quick Start

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd Demo_Build an Speaker Packet Agent
```

2. **Install dependencies:**
```bash
pip install flask pandas openpyxl python-docx PyPDF2 pdfplumber
```

3. **Run the application:**
```bash
python app.py
```

4. **Open your browser:**
```
http://localhost:5000
```

## 📖 Usage Guide

### 🌐 Web Interface (Recommended)

1. **Access the web interface** at `http://localhost:5000`

2. **Choose your input method:**
   - **Directory Path**: Enter full path to folder with speaker files
   - **File Upload**: Drag & drop speaker packet files

3. **Process files** by clicking the appropriate button

4. **Download Excel file** with standardized content

5. **Generate LinkedIn posts** by clicking "Generate LinkedIn Posts"

6. **Copy individual posts** using the copy buttons

### 💻 Command Line Usage

```bash
# Process all speaker packets in current directory
python speaker_packet_processor.py

# Process specific directory
python -c "
from speaker_packet_processor import SpeakerPacketProcessor
processor = SpeakerPacketProcessor()
results = processor.process_directory('/path/to/speaker/files')
processor.export_to_excel(results, 'output.xlsx')
"
```

## 📁 File Naming Conventions

Speaker packet files should be named with the pattern:
- `speaker_packet_[name].[extension]`
- `speaker_[name].[extension]`

**Examples:**
- `speaker_packet_jane_smith.txt`
- `speaker_packet_mike_chen.docx`
- `speaker_john_doe.pdf`

## 🔧 Configuration

### Input File Structure

The processor expects speaker packet files to contain:

```
SPEAKER NAME: [Full Name]

BIO:
[Speaker biography content]

SESSION TITLE:
[Session title]

SESSION DESCRIPTION:
[Session description]

TECH/AV REQUIREMENTS:
[Technical requirements]

HEADSHOT:
[Reference to headshot file]
```

### Quality Control Checks

The system automatically flags:
- ✅ Missing headshots
- ✅ Unspecified tech requirements
- ✅ Vague session descriptions
- ✅ Bio length issues (too long/short)
- ✅ Name inconsistencies
- ✅ File naming mismatches

## 📊 Output Formats

### Excel Export Columns
| Column | Description |
|--------|-------------|
| Speaker Name | Full speaker name |
| 50-word Bio | Condensed bio for program books |
| 100-word Bio | Extended bio for websites |
| 1-sentence Intro | Emcee introduction script |
| Session Title | Session name |
| Session Abstract | 75-word attendee-focused description |
| Key Takeaway 1-3 | Specific learner outcomes |
| Alt Text | WCAG-compliant headshot description |
| Tech Requirements | AV and technical needs |
| Quality Flags | Issues requiring attention |

### LinkedIn Post Types

1. **Speaker Announcement**
   - Professional introduction
   - Bio highlight
   - Event promotion

2. **Session Preview**
   - Key takeaways focus
   - Learning outcomes
   - Professional development angle

3. **Expert Highlight**
   - Credibility emphasis
   - Value proposition
   - Registration encouragement

4. **Call to Action**
   - Benefits summary
   - Urgency messaging
   - Clear next steps

## 🔧 Advanced Features

### Buzzword Detection & Cleaning

The processor automatically removes and replaces:
- Corporate jargon ("synergy", "leverage", "disruptive")
- Overused terms ("thought leader", "game-changing")
- Vague language ("explore", "dive into", "unpack")

### Content Standardization Rules

- **Active voice only**: "You'll learn" vs "Attendees will be shown"
- **Attendee-centric language**: Focus on takeaways, not speaker sharing
- **Concrete specificity**: Replace vague concepts with actionable items
- **Professional tone**: Business appropriate but approachable

## 🛠️ Technical Architecture

### Core Components

1. **SpeakerPacketProcessor**: Main processing engine
2. **File Format Handlers**: PDF, Word, CSV, TXT extractors
3. **Content Generators**: Bio, abstract, and social post creators
4. **Quality Controller**: Consistency and completeness checker
5. **Web Interface**: Flask-based UI with AJAX processing

### Dependencies

```
flask>=2.0.0
pandas>=1.3.0
openpyxl>=3.0.0
python-docx>=0.8.11
PyPDF2>=3.0.0
pdfplumber>=0.7.0
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Use Cases

### Event Organizers
- **Conference management**: Standardize 100+ speaker packets in minutes
- **Marketing preparation**: Generate social media content campaigns
- **Platform integration**: Export directly to event management systems
- **Quality assurance**: Catch missing information before publication

### Marketing Teams
- **Social media campaigns**: Ready-to-post LinkedIn content
- **Content consistency**: Uniform speaker presentation across channels
- **Brand compliance**: Professional language standards enforcement
- **Asset management**: Organized headshots and bio variations

### Event Technology Companies
- **Data preprocessing**: Clean speaker data before platform import
- **Client deliverables**: Professional content packages for events
- **Workflow automation**: Reduce manual content creation tasks
- **Quality standards**: Consistent output regardless of input quality

## 🔍 Real-World Transformation Examples

### Content Intelligence in Action

#### Placeholder Title Enhancement
**Input:** `"TBD but something cool"`
**Output:** `"Immersive Experiences: When Spaces Become Performers"`

**Input:** `"[working title: Rewriting the Engagement Playbook?]"`
**Output:** `"AI-Powered Innovation: Transforming Leadership for the Future"`

#### Missing Tech Requirements Generation
**Input:** `[No tech requirements specified]`
**Output:**
```
- Projector with HDMI connection
- Wireless lavalier microphone
- Screen for presentation slides
- Power outlet for laptop
```

#### Smart File Naming
**Single Speaker:** `speaker_dr_olivia_thorne_20251122_104256.xlsx`
**Multiple Speakers:** `speakers_raj_just_raj_jane_smith_20251122_103813.xlsx`
**Large Batch:** `speakers_jane_smith_raj_patel_and_others_20251122_143502.xlsx`

### Complete Speaker Transformation

#### Input (Raw Speaker Packet):
```
SPEAKER NAME: Raj (just Raj)

BIO:
Raj is a unique voice in the world of... let's just say experiences. A mix of
creative technologist, accidental producer, and self-described "event alchemist,"
Raj's journey defies a clean CV. Roles? Fluid. Brands? Some big ones.

SESSION TITLE: TBD but something cool

SESSION DESCRIPTION:
It's a vibe. Imagine walking into a room where the space talks back. Where the
participant is not passive but gets pulled into a shared performance.

TECH/AV REQUIREMENTS:
- Sound is critical
- Projection mapping?
- Will bring custom gear
```

#### Output (AI-Enhanced):
```
Speaker Name: Raj (just Raj)
50-word Bio: Raj is a unique voice in experiential technology. A creative technologist,
producer, and self-described "event alchemist," Raj's journey defies traditional categories.
He once built a 7-minute immersive experience for a launch party that broke Twitter for 11 minutes.

Session Title: Immersive Experiences: When Spaces Become Performers
Session Abstract: In this session, you'll learn how to create spaces where participants
become performers rather than passive observers. Raj will demonstrate techniques for
transforming physical environments into interactive experiences that respond to human presence.

Key Takeaways:
✅ Techniques for creating responsive physical environments
✅ Methods for converting passive attendees into active participants
✅ Framework for designing immersive shared performances

Alt Text: Professional headshot of Raj, business attire, smiling, neutral background
Quality Flags: Headshot: Yes | Tech: Specified | Session: Enhanced | Bio: Appropriate length
AI Suggestions: Alt Title: Beyond Passive Attendance: Creating Interactive Event Environments

LinkedIn Post: 🎤 Excited to announce Raj (just Raj) as our featured speaker!
Raj will be presenting "Immersive Experiences: When Spaces Become Performers" at our upcoming event.
Raj is a unique voice in experiential technology who transforms spaces into interactive performances.
Don't miss this incredible session!
#EventSpeaker #Conference #ImmersiveTech #ExperientialDesign
```

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Documentation**: This README and inline code comments
- **Examples**: Sample files included in `/examples` directory

---

**Built with ❤️ for event professionals who value quality content and efficient workflows.**