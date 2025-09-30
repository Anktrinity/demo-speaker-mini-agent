export interface TemplateTask {
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  category: string;
  estimatedHours?: number;
}

export interface Template {
  id: string;
  name: string;
  emoji: string;
  description: string;
  tasks: TemplateTask[];
  color: string;
  estimatedDays: number;
}

export const templates: Template[] = [
  {
    id: "fitness",
    name: "30-Day #fit4events™ Challenge",
    emoji: "💪",
    description: "Build strength, discipline, and wellness with daily fitness tasks",
    color: "bg-green-500",
    estimatedDays: 30,
    tasks: [
      {
        title: "Create workout schedule",
        description: "Plan 4×/week, 45-min upper/lower split sessions.",
        priority: "high",
        category: "planning",
        estimatedHours: 2
      },
      {
        title: "Set up nutrition tracking",
        description: "Track macros: Protein = 1.2× bodyweight (lbs), Carbs = 1× bodyweight (lbs), Fat = bodyweight ÷ 3 (g). Use MyFitnessPal.",
        priority: "high", 
        category: "setup",
        estimatedHours: 1
      },
      {
        title: "Walk 10K steps daily",
        description: "Track and complete 10,000 steps/day.",
        priority: "medium",
        category: "workout",
        estimatedHours: 1
      },
      {
        title: "3 walking sessions weekly",
        description: "Add 3×30-min steady walks each week.",
        priority: "medium",
        category: "workout", 
        estimatedHours: 1.5
      },
      {
        title: "Strength training session (4×/week)",
        description: "Complete 45-min workout focusing on compound lifts.",
        priority: "high",
        category: "workout",
        estimatedHours: 1
      },
      {
        title: "Progressive overload",
        description: "Increase weight/reps weekly. Plan deload after 4 weeks.",
        priority: "high",
        category: "workout",
        estimatedHours: 0.5
      },
      {
        title: "Track water intake",
        description: "Drink 8–10 glasses/day.",
        priority: "low",
        category: "nutrition",
        estimatedHours: 0.5
      },
      {
        title: "Track sleep",
        description: "Log bedtime/wake-up. Aim for 7–8 hrs.",
        priority: "high",
        category: "recovery",
        estimatedHours: 0.5
      },
      {
        title: "Active rest day",
        description: "One day/week of light activity.",
        priority: "high",
        category: "recovery",
        estimatedHours: 1
      },
      {
        title: "Post-workout mobility",
        description: "Stretch or foam roll 10–15 min after workouts.",
        priority: "medium",
        category: "recovery",
        estimatedHours: 0.5
      },
      {
        title: "Mindset journaling",
        description: "Write 3 daily sentences: energy, win, challenge.",
        priority: "low",
        category: "mindset",
        estimatedHours: 0.5
      },
      {
        title: "Weekly progress photos",
        description: "Take photos every Sunday in same lighting/angle.",
        priority: "medium",
        category: "tracking",
        estimatedHours: 1
      },
      {
        title: "Weekly check-in",
        description: "Review photos, sleep, and macros. Adjust plan.",
        priority: "high",
        category: "tracking",
        estimatedHours: 1
      }
    ]
  },
  {
    id: "business",
    name: "Side Hustle Launch", 
    emoji: "💼",
    description: "Launch your side business from idea to first customers with structured milestones",
    color: "bg-blue-500",
    estimatedDays: 90,
    tasks: [
      {
        title: "Define niche & value proposition",
        description: "Clarify your idea, audience, and value proposition.",
        priority: "critical",
        category: "research",
        estimatedHours: 4
      },
      {
        title: "Customer discovery interviews",
        description: "Talk to 5–10 potential customers.",
        priority: "critical",
        category: "research",
        estimatedHours: 6
      },
      {
        title: "Market research & validation",
        description: "Study competitors and confirm demand.",
        priority: "high",
        category: "research",
        estimatedHours: 8
      },
      {
        title: "Create lean business plan",
        description: "Outline strategy, financials, and marketing.",
        priority: "high",
        category: "planning",
        estimatedHours: 12
      },
      {
        title: "Set up financial foundation",
        description: "Build a simple budget and cashflow forecast.",
        priority: "high",
        category: "finance",
        estimatedHours: 4
      },
      {
        title: "Register legal structure",
        description: "Entity setup, EIN, bank account, bookkeeping.",
        priority: "high",
        category: "legal",
        estimatedHours: 6
      },
      {
        title: "Design brand identity",
        description: "Logo, colors, brand basics.",
        priority: "medium",
        category: "branding",
        estimatedHours: 10
      },
      {
        title: "Build MVP",
        description: "Develop basic product or service.",
        priority: "critical",
        category: "development",
        estimatedHours: 30
      },
      {
        title: "Test MVP with users",
        description: "Get feedback from 5–10 early users.",
        priority: "critical",
        category: "development",
        estimatedHours: 10
      },
      {
        title: "Set pricing",
        description: "Research competitors, set starting prices.",
        priority: "high",
        category: "strategy",
        estimatedHours: 4
      },
      {
        title: "Launch marketing campaign",
        description: "Promote via chosen channels.",
        priority: "high",
        category: "marketing",
        estimatedHours: 14
      },
      {
        title: "Get first 10 customers",
        description: "Focus on early sales and delivery.",
        priority: "critical",
        category: "sales",
        estimatedHours: 20
      }
    ]
  },
  {
    id: "learning",
    name: "Marketing Campaign Planner",
    emoji: "📢",
    description: "Plan, launch, and optimize a full marketing campaign from strategy to results",
    color: "bg-purple-500", 
    estimatedDays: 30,
    tasks: [
      {
        title: "Define goals & audience",
        description: "Set measurable objectives and target audience.",
        priority: "critical",
        category: "planning",
        estimatedHours: 4
      },
      {
        title: "Develop campaign strategy",
        description: "Outline type, key messages, and channels.",
        priority: "high",
        category: "strategy", 
        estimatedHours: 8
      },
      {
        title: "Create campaign budget",
        description: "Allocate spend across creative, ads, and tools.",
        priority: "high",
        category: "finance",
        estimatedHours: 4
      },
      {
        title: "Research competitors",
        description: "Review competitor messaging and benchmarks.",
        priority: "high",
        category: "research",
        estimatedHours: 6
      },
      {
        title: "Build creative assets",
        description: "Design graphics, videos, copy, and landing pages.",
        priority: "critical",
        category: "creative",
        estimatedHours: 25
      },
      {
        title: "Set up tools & tracking",
        description: "Configure ad platforms, analytics, and UTM links.",
        priority: "high",
        category: "tech setup",
        estimatedHours: 8
      },
      {
        title: "Launch campaign",
        description: "Deploy across chosen channels.",
        priority: "critical",
        category: "execution", 
        estimatedHours: 10
      },
      {
        title: "Monitor & optimize",
        description: "Review analytics weekly and adjust targeting.",
        priority: "high",
        category: "optimization",
        estimatedHours: 30
      },
      {
        title: "Engage with audience",
        description: "Respond to comments, emails, and messages.",
        priority: "medium",
        category: "community",
        estimatedHours: 15
      },
      {
        title: "Post-campaign review",
        description: "Analyze KPIs and document lessons learned.",
        priority: "high",
        category: "evaluation",
        estimatedHours: 10
      }
    ]
  },
  {
    id: "home",
    name: "Learn a New Skill",
    emoji: "📚", 
    description: "Master a new skill through structured learning and practice",
    color: "bg-orange-500",
    estimatedDays: 15,
    tasks: [
      {
        title: "Choose skill & set goals",
        description: "Define the skill and 2–3 measurable outcomes.",
        priority: "critical",
        category: "planning",
        estimatedHours: 2
      },
      {
        title: "Baseline assessment",
        description: "Complete a simple task to benchmark current ability.",
        priority: "high",
        category: "tracking",
        estimatedHours: 2
      },
      {
        title: "Research learning resources",
        description: "Find 1–2 main courses, books, or mentors.",
        priority: "high",
        category: "research",
        estimatedHours: 4
      },
      {
        title: "Create learning schedule",
        description: "Block study/practice time weekly.", 
        priority: "high",
        category: "planning",
        estimatedHours: 1
      },
      {
        title: "Complete foundation course",
        description: "Finish beginner-level course or tutorial.",
        priority: "critical",
        category: "learning",
        estimatedHours: 20
      },
      {
        title: "Practice small projects",
        description: "Do 3–4 mini-projects with reflection.",
        priority: "high",
        category: "practice",
        estimatedHours: 18
      },
      {
        title: "Join learning community",
        description: "Engage in forums or groups for support.",
        priority: "medium",
        category: "networking",
        estimatedHours: 2
      },
      {
        title: "Complete intermediate course",
        description: "Advance to mid-level content.",
        priority: "high",
        category: "learning",
        estimatedHours: 24
      },
      {
        title: "Build capstone project",
        description: "Create a substantial project.",
        priority: "critical",
        category: "project",
        estimatedHours: 25
      },
      {
        title: "Get feedback",
        description: "Present capstone to peers/mentors.",
        priority: "high",
        category: "feedback",
        estimatedHours: 4
      },
      {
        title: "Share knowledge",
        description: "Teach or publish what you've learned.",
        priority: "medium",
        category: "sharing",
        estimatedHours: 6
      },
      {
        title: "Final review & iteration",
        description: "Revisit baseline and measure growth.",
        priority: "high",
        category: "tracking",
        estimatedHours: 4
      }
    ]
  },
  {
    id: "creative",
    name: "Creative Project (AI-Driven)",
    emoji: "🎨",
    description: "Bring your creative vision to life with AI-powered tools and structured production",
    color: "bg-pink-500",
    estimatedDays: 30,
    tasks: [
      {
        title: "Define creative vision",
        description: "Clarify concept, style, and outcome.",
        priority: "critical",
        category: "planning",
        estimatedHours: 3
      },
      {
        title: "Research inspiration & techniques",
        description: "Use ChatGPT or NotebookLM to study artists, styles, and references.",
        priority: "high",
        category: "research",
        estimatedHours: 6
      },
      {
        title: "Gather materials & tools",
        description: "Set up creative apps, AI tools, and required hardware/software.",
        priority: "high",
        category: "preparation",
        estimatedHours: 3
      },
      {
        title: "Create sketches/concepts",
        description: "Generate 3–5 variations using Nano Banana or similar sketch tools.",
        priority: "high",
        category: "ideation",
        estimatedHours: 8
      },
      {
        title: "Develop technical skills",
        description: "Learn MidJourney prompts or Adobe Creative Cloud apps through practice drills.",
        priority: "medium",
        category: "skill-building",
        estimatedHours: 10
      },
      {
        title: "Create first draft",
        description: "Produce an initial version using Google AI Studio or preferred design workflow.",
        priority: "critical",
        category: "creation",
        estimatedHours: 12
      },
      {
        title: "Midpoint reflection",
        description: "Review draft, note strengths and gaps.",
        priority: "high",
        category: "tracking",
        estimatedHours: 2
      },
      {
        title: "Gather feedback",
        description: "Share draft with peers or mentors. Collect structured notes.",
        priority: "medium",
        category: "feedback",
        estimatedHours: 3
      },
      {
        title: "Refine & polish",
        description: "Incorporate feedback and finalize with Adobe Creative Cloud or MidJourney refinements.",
        priority: "high",
        category: "refinement",
        estimatedHours: 10
      },
      {
        title: "Final review",
        description: "Compare against original vision and adjust.",
        priority: "high",
        category: "tracking",
        estimatedHours: 2
      },
      {
        title: "Present project",
        description: "Publish or share final work via digital or physical showcase.",
        priority: "medium",
        category: "sharing",
        estimatedHours: 3
      }
    ]
  },
  {
    id: "app",
    name: "Micro Event / Mini Retreat",
    emoji: "📅",
    description: "Plan and host a small retreat or event from concept to review",
    color: "bg-indigo-500",
    estimatedDays: 60,
    tasks: [
      {
        title: "Define event purpose & vision",
        description: "Clarify goals, theme, and audience.",
        priority: "critical",
        category: "planning",
        estimatedHours: 4
      },
      {
        title: "Create event budget",
        description: "Estimate costs and track spend.",
        priority: "high",
        category: "finance",
        estimatedHours: 6
      },
      {
        title: "Secure sponsors & partners",
        description: "Build sponsor package and confirm partners.",
        priority: "high",
        category: "partnerships",
        estimatedHours: 12
      },
      {
        title: "Select venue/location",
        description: "Research, compare, and book space.",
        priority: "high",
        category: "logistics",
        estimatedHours: 10
      },
      {
        title: "Design event agenda",
        description: "Draft sessions, activities, and breaks.",
        priority: "high",
        category: "program",
        estimatedHours: 8
      },
      {
        title: "Book vendors/facilitators",
        description: "Secure catering, AV, or activity leads.",
        priority: "high",
        category: "vendors",
        estimatedHours: 10
      },
      {
        title: "Build registration system",
        description: "Set up ticketing or RSVP page.",
        priority: "high",
        category: "tech setup",
        estimatedHours: 6
      },
      {
        title: "Launch marketing plan",
        description: "Promote through email, socials, and partners.",
        priority: "high",
        category: "marketing",
        estimatedHours: 18
      },
      {
        title: "Manage attendee comms",
        description: "Send confirmations and updates.",
        priority: "medium",
        category: "communication",
        estimatedHours: 6
      },
      {
        title: "Prepare event materials",
        description: "Design signage, handouts, or kits.",
        priority: "high",
        category: "production",
        estimatedHours: 8
      },
      {
        title: "Execute event on-site",
        description: "Run setup, flow, and experience.",
        priority: "critical",
        category: "execution",
        estimatedHours: 25
      },
      {
        title: "Post-event review",
        description: "Collect feedback and analyze results.",
        priority: "high",
        category: "evaluation",
        estimatedHours: 7
      }
    ]
  }
];