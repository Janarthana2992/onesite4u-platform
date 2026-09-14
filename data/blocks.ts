/**
 * Block registry. Every block on a page is an instance of one of these types.
 * Simple blocks keep their content in `props`; collection blocks read from the
 * shared content store (services, reviews…) and can appear once per page.
 */

export type Category = "Basics" | "About" | "Offerings" | "Trust" | "Media" | "Engage" | "Layout";

export type Field =
  | { key: string; label: string; type: "text" | "textarea" | "url" | "number"; placeholder?: string; hint?: string }
  | { key: string; label: string; type: "select"; options: { value: string; label: string }[] }
  | { key: string; label: string; type: "toggle" }
  | { key: string; label: string; type: "items"; itemLabel: string; fields: Field[]; max?: number };

export type CollectionKey =
  | "links"
  | "services"
  | "gallery"
  | "events"
  | "jobs"
  | "experience"
  | "reviews"
  | "clients"
  | "knowledge"
  | "milestones";

export type BlockDef = {
  type: string;
  label: string;
  desc: string;
  category: Category;
  /** Whether more than one instance may exist on a page. */
  multi: boolean;
  /** Data lives in the content store rather than in block props. */
  collection?: CollectionKey;
  /** Special singleton blocks whose data is a config object in the store. */
  special?: "profile" | "grievance" | "assistant" | "newsletter";
  /** Props every new instance starts with. `title` / `subtitle` are universal. */
  defaults: Record<string, unknown>;
  fields: Field[];
  /** Which prop, when empty, should hide the block on the live page. */
  contentKey?: string;
  /** Hide the standard heading (the block renders its own or none). */
  noHeader?: boolean;
};

export type Block = {
  id: string;
  type: string;
  visible: boolean;
  props: Record<string, unknown>;
};

const align = { key: "align", label: "Alignment", type: "select" as const, options: [
  { value: "left", label: "Left" }, { value: "center", label: "Center" },
] };

export const BLOCK_DEFS: BlockDef[] = [
  /* ---------------- Basics ---------------- */
  {
    type: "quickInfo", label: "Contact info", desc: "Phone, email, website, address and map",
    category: "Basics", multi: false, special: "profile",
    defaults: { title: "Quick Info", subtitle: "Reach out directly", showMap: true },
    fields: [{ key: "showMap", label: "Show map", type: "toggle" }],
  },
  {
    type: "links", label: "Link buttons", desc: "Portfolio, social, payment, files",
    category: "Basics", multi: false, collection: "links",
    defaults: { title: "Links", subtitle: "Everything in one place" },
    fields: [],
  },
  {
    type: "socials", label: "Social icons", desc: "A row of social profile icons",
    category: "Basics", multi: true, contentKey: "items",
    defaults: {
      title: "Follow along", subtitle: "",
      items: [
        { platform: "instagram", handle: "@onesite4u" },
        { platform: "linkedin", handle: "onesite4u" },
        { platform: "youtube", handle: "@onesite4u" },
        { platform: "x", handle: "@onesite4u" },
      ],
    },
    fields: [{
      key: "items", label: "Profiles", type: "items", itemLabel: "profile", max: 8,
      fields: [
        { key: "platform", label: "Platform", type: "select", options: [
          "instagram", "linkedin", "youtube", "x", "facebook", "whatsapp", "telegram", "website", "github", "email",
        ].map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) })) },
        { key: "handle", label: "Handle or URL", type: "text" },
      ],
    }],
  },
  {
    type: "hours", label: "Opening hours", desc: "Weekly schedule with an open-now badge",
    category: "Basics", multi: false, contentKey: "items",
    defaults: {
      title: "Opening hours", subtitle: "", note: "Closed on public holidays",
      items: [
        { day: "Mon – Fri", time: "9:30 AM – 6:00 PM" },
        { day: "Saturday", time: "10:00 AM – 2:00 PM" },
        { day: "Sunday", time: "Closed" },
      ],
    },
    fields: [
      { key: "items", label: "Rows", type: "items", itemLabel: "row", fields: [
        { key: "day", label: "Day(s)", type: "text" }, { key: "time", label: "Hours", type: "text" },
      ] },
      { key: "note", label: "Note", type: "text" },
    ],
  },
  {
    type: "map", label: "Location map", desc: "Map placeholder with address and directions",
    category: "Basics", multi: true, contentKey: "address",
    defaults: { title: "Find us", subtitle: "", address: "T. Nagar, Chennai, Tamil Nadu", label: "Head office" },
    fields: [
      { key: "label", label: "Pin label", type: "text" },
      { key: "address", label: "Address", type: "textarea" },
    ],
  },
  {
    type: "contactForm", label: "Contact form", desc: "Name, email, message with a success state",
    category: "Basics", multi: true,
    defaults: {
      title: "Send a message", subtitle: "I usually reply within a day",
      askPhone: true, askSubject: false, buttonLabel: "Send message",
    },
    fields: [
      { key: "askPhone", label: "Ask for phone", type: "toggle" },
      { key: "askSubject", label: "Ask for subject", type: "toggle" },
      { key: "buttonLabel", label: "Button label", type: "text" },
    ],
  },

  /* ---------------- About ---------------- */
  {
    type: "text", label: "Text", desc: "A paragraph or two of rich text",
    category: "About", multi: true, contentKey: "body",
    defaults: {
      title: "About", subtitle: "",
      body: "Write a short introduction here. Two or three sentences about who you are, who you help and what makes your work different.\n\nA second paragraph can cover how to work with you.",
      align: "left",
    },
    fields: [{ key: "body", label: "Text", type: "textarea", hint: "Blank line starts a new paragraph" }, align],
  },
  {
    type: "heading", label: "Heading", desc: "A standalone headline to introduce a part of the page",
    category: "About", multi: true, noHeader: true, contentKey: "text",
    defaults: { text: "Let's build something together", size: "lg", align: "left", eyebrow: "" },
    fields: [
      { key: "eyebrow", label: "Small label above", type: "text" },
      { key: "text", label: "Headline", type: "text" },
      { key: "size", label: "Size", type: "select", options: [
        { value: "md", label: "Medium" }, { value: "lg", label: "Large" }, { value: "xl", label: "Extra large" },
      ] },
      align,
    ],
  },
  {
    type: "imageText", label: "Image + text", desc: "A picture beside a paragraph",
    category: "About", multi: true, contentKey: "body",
    defaults: {
      title: "", subtitle: "",
      image: "https://picsum.photos/seed/os4u-it/800/600",
      heading: "Why I do this work",
      body: "A short story about your motivation, your approach or a result you are proud of.",
      side: "left",
    },
    fields: [
      { key: "image", label: "Image URL", type: "url" },
      { key: "heading", label: "Heading", type: "text" },
      { key: "body", label: "Text", type: "textarea" },
      { key: "side", label: "Image side", type: "select", options: [
        { value: "left", label: "Left" }, { value: "right", label: "Right" },
      ] },
    ],
  },
  {
    type: "quote", label: "Quote", desc: "A pull quote or personal motto",
    category: "About", multi: true, noHeader: true, contentKey: "text",
    defaults: { text: "Clarity first. Then discipline. Then compounding.", author: "", role: "" },
    fields: [
      { key: "text", label: "Quote", type: "textarea" },
      { key: "author", label: "Attributed to", type: "text" },
      { key: "role", label: "Role", type: "text" },
    ],
  },
  {
    type: "experience", label: "Experience", desc: "Career timeline",
    category: "About", multi: false, collection: "experience",
    defaults: { title: "Experience", subtitle: "Career and company timeline" },
    fields: [],
  },
  {
    type: "education", label: "Education", desc: "Degrees and courses",
    category: "About", multi: false, contentKey: "items",
    defaults: {
      title: "Education", subtitle: "",
      items: [
        { degree: "MBA, Finance", school: "IIM Bangalore", year: "2006", note: "Gold medallist" },
        { degree: "B.Com", school: "Loyola College, Chennai", year: "2003", note: "" },
      ],
    },
    fields: [{ key: "items", label: "Entries", type: "items", itemLabel: "entry", fields: [
      { key: "degree", label: "Degree / course", type: "text" }, { key: "school", label: "Institution", type: "text" },
      { key: "year", label: "Year", type: "text" }, { key: "note", label: "Note", type: "text" },
    ] }],
  },
  {
    type: "skills", label: "Skills", desc: "Tags with proficiency levels",
    category: "About", multi: true, contentKey: "items",
    defaults: {
      title: "Skills", subtitle: "", showLevels: true,
      items: [
        { name: "Portfolio strategy", level: 95 }, { name: "Tax planning", level: 85 },
        { name: "Retirement modelling", level: 90 }, { name: "Estate planning", level: 70 },
        { name: "Public speaking", level: 80 },
      ],
    },
    fields: [
      { key: "showLevels", label: "Show level bars", type: "toggle" },
      { key: "items", label: "Skills", type: "items", itemLabel: "skill", fields: [
        { key: "name", label: "Skill", type: "text" }, { key: "level", label: "Level (0–100)", type: "number" },
      ] },
    ],
  },
  {
    type: "awards", label: "Awards", desc: "Recognition and honours",
    category: "About", multi: true, contentKey: "items",
    defaults: {
      title: "Awards & recognition", subtitle: "",
      items: [
        { title: "Advisor of the Year", issuer: "South India Wealth Forum", year: "2025" },
        { title: "Top 40 under 40", issuer: "Business Today", year: "2019" },
      ],
    },
    fields: [{ key: "items", label: "Awards", type: "items", itemLabel: "award", fields: [
      { key: "title", label: "Award", type: "text" }, { key: "issuer", label: "Issued by", type: "text" },
      { key: "year", label: "Year", type: "text" },
    ] }],
  },
  {
    type: "certifications", label: "Certifications", desc: "Licences and credentials",
    category: "About", multi: true, contentKey: "items",
    defaults: {
      title: "Certifications", subtitle: "",
      items: [
        { name: "SEBI Registered Investment Adviser", org: "SEBI", year: "2014", ref: "INA000001234" },
        { name: "Certified Financial Planner", org: "FPSB", year: "2010", ref: "" },
      ],
    },
    fields: [{ key: "items", label: "Credentials", type: "items", itemLabel: "credential", fields: [
      { key: "name", label: "Name", type: "text" }, { key: "org", label: "Issuing body", type: "text" },
      { key: "year", label: "Year", type: "text" }, { key: "ref", label: "Reference no.", type: "text" },
    ] }],
  },
  {
    type: "team", label: "Team", desc: "People with photos and roles",
    category: "About", multi: true, contentKey: "items",
    defaults: {
      title: "The team", subtitle: "",
      items: [
        { name: "Karthik Iyer", role: "Research Analyst", avatar: "https://i.pravatar.cc/160?img=12" },
        { name: "Meera Nair", role: "Client Success", avatar: "https://i.pravatar.cc/160?img=38" },
        { name: "Arun Kumar", role: "Operations", avatar: "https://i.pravatar.cc/160?img=60" },
      ],
    },
    fields: [{ key: "items", label: "Members", type: "items", itemLabel: "member", fields: [
      { key: "name", label: "Name", type: "text" }, { key: "role", label: "Role", type: "text" },
      { key: "avatar", label: "Photo URL", type: "url" },
    ] }],
  },
  {
    type: "stats", label: "Numbers", desc: "Big figures that build trust",
    category: "About", multi: true, contentKey: "items",
    defaults: {
      title: "", subtitle: "",
      items: [
        { value: "350+", label: "Families served" }, { value: "₹180 Cr", label: "Assets advised" },
        { value: "12 yrs", label: "Experience" }, { value: "4.9", label: "Average rating" },
      ],
    },
    fields: [{ key: "items", label: "Figures", type: "items", itemLabel: "figure", max: 6, fields: [
      { key: "value", label: "Value", type: "text" }, { key: "label", label: "Label", type: "text" },
    ] }],
  },

  /* ---------------- Offerings ---------------- */
  {
    type: "services", label: "Services", desc: "Bookable offerings with prices",
    category: "Offerings", multi: false, collection: "services",
    defaults: { title: "Services", subtitle: "Book a session that fits your goals" },
    fields: [],
  },
  {
    type: "pricing", label: "Pricing table", desc: "Plans side by side with a highlighted pick",
    category: "Offerings", multi: true, contentKey: "items",
    defaults: {
      title: "Plans", subtitle: "Simple, transparent pricing",
      items: [
        { name: "Starter", price: "₹2,500", period: "one-time", features: "60 min call\nWritten summary\nEmail follow-up", highlight: false, cta: "Choose" },
        { name: "Growth", price: "₹9,000", period: "per quarter", features: "Monthly review\nPortfolio rebalancing\nPriority WhatsApp\nTax planning", highlight: true, cta: "Most popular" },
        { name: "Family", price: "₹25,000", period: "per year", features: "Everything in Growth\nUp to 4 members\nEstate planning\nAnnual workshop seat", highlight: false, cta: "Choose" },
      ],
    },
    fields: [{ key: "items", label: "Plans", type: "items", itemLabel: "plan", max: 4, fields: [
      { key: "name", label: "Plan name", type: "text" }, { key: "price", label: "Price", type: "text" },
      { key: "period", label: "Period", type: "text" }, { key: "features", label: "Features", type: "textarea", hint: "One per line" },
      { key: "cta", label: "Button label", type: "text" }, { key: "highlight", label: "Highlight this plan", type: "toggle" },
    ] }],
  },
  {
    type: "products", label: "Products", desc: "A small shop grid",
    category: "Offerings", multi: true, contentKey: "items",
    defaults: {
      title: "Shop", subtitle: "Books and tools",
      items: [
        { name: "Wealth Habits (Book)", price: "₹499", image: "https://picsum.photos/seed/os4u-pr1/600/600", tag: "Bestseller" },
        { name: "Budget Planner PDF", price: "₹199", image: "https://picsum.photos/seed/os4u-pr2/600/600", tag: "" },
        { name: "Retirement Calculator", price: "₹299", image: "https://picsum.photos/seed/os4u-pr3/600/600", tag: "New" },
        { name: "Workshop Recording", price: "₹999", image: "https://picsum.photos/seed/os4u-pr4/600/600", tag: "" },
      ],
    },
    fields: [{ key: "items", label: "Products", type: "items", itemLabel: "product", fields: [
      { key: "name", label: "Name", type: "text" }, { key: "price", label: "Price", type: "text" },
      { key: "image", label: "Image URL", type: "url" }, { key: "tag", label: "Tag", type: "text" },
    ] }],
  },
  {
    type: "menu", label: "Menu / price list", desc: "Items grouped with prices",
    category: "Offerings", multi: true, contentKey: "items",
    defaults: {
      title: "Menu", subtitle: "",
      items: [
        { name: "Filter coffee", description: "Traditional South Indian brew", price: "₹60", group: "Drinks" },
        { name: "Masala chai", description: "", price: "₹40", group: "Drinks" },
        { name: "Ghee podi idli", description: "Six pieces", price: "₹120", group: "Breakfast" },
        { name: "Mysore bonda", description: "Four pieces with chutney", price: "₹90", group: "Breakfast" },
      ],
    },
    fields: [{ key: "items", label: "Items", type: "items", itemLabel: "item", fields: [
      { key: "group", label: "Group", type: "text" }, { key: "name", label: "Name", type: "text" },
      { key: "description", label: "Description", type: "text" }, { key: "price", label: "Price", type: "text" },
    ] }],
  },
  {
    type: "downloads", label: "Downloads", desc: "Brochures, PDFs and forms",
    category: "Offerings", multi: true, contentKey: "items",
    defaults: {
      title: "Downloads", subtitle: "",
      items: [
        { title: "Company brochure", size: "PDF · 2.4 MB", url: "#" },
        { title: "Fee schedule 2026", size: "PDF · 320 KB", url: "#" },
        { title: "Onboarding checklist", size: "PDF · 180 KB", url: "#" },
      ],
    },
    fields: [{ key: "items", label: "Files", type: "items", itemLabel: "file", fields: [
      { key: "title", label: "Title", type: "text" }, { key: "size", label: "Type · size", type: "text" },
      { key: "url", label: "URL", type: "url" },
    ] }],
  },
  {
    type: "schedule", label: "Schedule", desc: "Timetable for a day or an event",
    category: "Offerings", multi: true, contentKey: "items",
    defaults: {
      title: "Schedule", subtitle: "",
      items: [
        { time: "10:00", title: "Registration & coffee", note: "" },
        { time: "10:30", title: "Building a resilient portfolio", note: "Keynote" },
        { time: "11:30", title: "Tax-smart investing", note: "Workshop" },
        { time: "12:30", title: "Q&A and networking", note: "" },
      ],
    },
    fields: [{ key: "items", label: "Slots", type: "items", itemLabel: "slot", fields: [
      { key: "time", label: "Time", type: "text" }, { key: "title", label: "Title", type: "text" },
      { key: "note", label: "Note", type: "text" },
    ] }],
  },
  {
    type: "milestones", label: "Progress tracker", desc: "Promises, roadmap or track record",
    category: "Offerings", multi: false, collection: "milestones",
    defaults: { title: "Progress tracker", subtitle: "What was promised and where it stands" },
    fields: [],
  },

  /* ---------------- Trust ---------------- */
  {
    type: "reviews", label: "Reviews", desc: "Testimonials with ratings",
    category: "Trust", multi: false, collection: "reviews",
    defaults: { title: "Reviews", subtitle: "" },
    fields: [],
  },
  {
    type: "clients", label: "Logo wall", desc: "Clients, partners or affiliations",
    category: "Trust", multi: false, collection: "clients",
    defaults: { title: "Clients", subtitle: "Who I work with" },
    fields: [],
  },

  /* ---------------- Media ---------------- */
  {
    type: "gallery", label: "Photo gallery", desc: "Image grid with lightbox",
    category: "Media", multi: false, collection: "gallery",
    defaults: { title: "Media Gallery", subtitle: "Moments and highlights" },
    fields: [],
  },
  {
    type: "video", label: "Video", desc: "Featured video with a caption",
    category: "Media", multi: true, contentKey: "url",
    defaults: {
      title: "Watch", subtitle: "",
      url: "https://youtu.be/example", caption: "3 minutes on how I build a plan", duration: "3:12",
      thumbnail: "https://picsum.photos/seed/os4u-video/1200/675",
    },
    fields: [
      { key: "url", label: "Video URL", type: "url" },
      { key: "thumbnail", label: "Thumbnail URL", type: "url" },
      { key: "caption", label: "Caption", type: "text" },
      { key: "duration", label: "Duration", type: "text" },
    ],
  },
  {
    type: "embed", label: "Link preview", desc: "A rich card for any external link",
    category: "Media", multi: true, contentKey: "url",
    defaults: {
      title: "", subtitle: "",
      url: "https://octogonmitra.com/blog/compounding", heading: "The quiet maths of compounding",
      description: "Why the boring decade matters more than the exciting year.", image: "https://picsum.photos/seed/os4u-embed/800/500", source: "octogonmitra.com",
    },
    fields: [
      { key: "url", label: "URL", type: "url" }, { key: "heading", label: "Heading", type: "text" },
      { key: "description", label: "Description", type: "textarea" }, { key: "image", label: "Image URL", type: "url" },
      { key: "source", label: "Source label", type: "text" },
    ],
  },
  {
    type: "announcements", label: "Announcements", desc: "News, notices and updates",
    category: "Media", multi: true, contentKey: "items",
    defaults: {
      title: "Latest updates", subtitle: "",
      items: [
        { date: "Sep 10", title: "New office hours from October", body: "We now open at 9:30 AM on weekdays.", tag: "Notice" },
        { date: "Sep 2", title: "Workshop registrations open", body: "Free seats for the Sept 30 Wealth Growth Workshop.", tag: "Event" },
        { date: "Aug 21", title: "Quarterly market note published", body: "Our take on rates, gold and small caps.", tag: "Insight" },
      ],
    },
    fields: [{ key: "items", label: "Posts", type: "items", itemLabel: "post", fields: [
      { key: "date", label: "Date", type: "text" }, { key: "tag", label: "Tag", type: "text" },
      { key: "title", label: "Title", type: "text" }, { key: "body", label: "Body", type: "textarea" },
    ] }],
  },

  /* ---------------- Engage ---------------- */
  {
    type: "assistant", label: "AI assistant", desc: "Answers from your knowledge base",
    category: "Engage", multi: false, special: "assistant", collection: "knowledge",
    defaults: { title: "", subtitle: "" },
    fields: [],
  },
  {
    type: "grievance", label: "Request desk", desc: "Intake form that issues a reference number",
    category: "Engage", multi: false, special: "grievance",
    defaults: { title: "Raise a request", subtitle: "We respond to every submission" },
    fields: [],
  },
  {
    type: "event", label: "Event", desc: "Upcoming event with RSVP",
    category: "Engage", multi: false, collection: "events",
    defaults: { title: "Upcoming Event", subtitle: "Join the community" },
    fields: [],
  },
  {
    type: "jobs", label: "Openings", desc: "Jobs, volunteering, apprenticeships",
    category: "Engage", multi: false, collection: "jobs",
    defaults: { title: "We're Hiring", subtitle: "Open roles on the team" },
    fields: [],
  },
  {
    type: "newsletter", label: "Newsletter", desc: "Email subscribe block",
    category: "Engage", multi: false, special: "newsletter",
    defaults: { title: "Subscribe for updates", subtitle: "Occasional updates straight to your inbox. No spam, ever." },
    fields: [],
  },
  {
    type: "cta", label: "Call to action", desc: "A bold banner with one button",
    category: "Engage", multi: true, noHeader: true, contentKey: "heading",
    defaults: {
      heading: "Ready to get started?", body: "Book a free 15 minute intro call and see if we are a fit.",
      buttonLabel: "Book a call", action: "book", url: "",
    },
    fields: [
      { key: "heading", label: "Heading", type: "text" }, { key: "body", label: "Text", type: "textarea" },
      { key: "buttonLabel", label: "Button label", type: "text" },
      { key: "action", label: "Button action", type: "select", options: [
        { value: "book", label: "Open booking" }, { value: "contact", label: "Scroll to contact" }, { value: "link", label: "Open a link" },
      ] },
      { key: "url", label: "Link URL (if action is link)", type: "url" },
    ],
  },
  {
    type: "poll", label: "Poll", desc: "One question, instant results",
    category: "Engage", multi: true, contentKey: "question",
    defaults: {
      title: "Quick poll", subtitle: "", question: "What should the next workshop cover?",
      items: [{ label: "Tax planning", votes: 42 }, { label: "Retirement", votes: 31 }, { label: "Mutual funds 101", votes: 58 }, { label: "Real estate", votes: 19 }],
    },
    fields: [
      { key: "question", label: "Question", type: "text" },
      { key: "items", label: "Options", type: "items", itemLabel: "option", max: 6, fields: [
        { key: "label", label: "Option", type: "text" }, { key: "votes", label: "Starting votes", type: "number" },
      ] },
    ],
  },
  {
    type: "support", label: "Support / tip", desc: "Preset amounts with a thank-you (demo, no payment)",
    category: "Engage", multi: true,
    defaults: {
      title: "Support this work", subtitle: "Every contribution keeps the free workshops running",
      items: [{ value: "₹100" }, { value: "₹250" }, { value: "₹500" }, { value: "₹1,000" }],
      buttonLabel: "Contribute",
    },
    fields: [
      { key: "items", label: "Amounts", type: "items", itemLabel: "amount", max: 6, fields: [{ key: "value", label: "Amount", type: "text" }] },
      { key: "buttonLabel", label: "Button label", type: "text" },
    ],
  },
  {
    type: "countdown", label: "Countdown", desc: "Live timer to a date",
    category: "Engage", multi: true, contentKey: "date",
    defaults: { title: "Workshop starts in", subtitle: "", date: "2026-09-30T10:00:00", label: "Wealth Growth Workshop · Sept 30" },
    fields: [
      { key: "date", label: "Date & time", type: "text", hint: "YYYY-MM-DDTHH:MM" },
      { key: "label", label: "Caption", type: "text" },
    ],
  },
  {
    type: "faq", label: "FAQ", desc: "Expandable questions and answers",
    category: "Engage", multi: true, contentKey: "items",
    defaults: {
      title: "Frequently asked", subtitle: "",
      items: [
        { q: "Do I need a minimum portfolio size?", a: "No. Consultations are open to everyone; the plan is sized to your situation." },
        { q: "Do you earn commissions on products?", a: "Never. Fees are advisory only and disclosed upfront." },
        { q: "Can we meet online?", a: "Yes, every session is available over Google Meet." },
      ],
    },
    fields: [{ key: "items", label: "Questions", type: "items", itemLabel: "question", fields: [
      { key: "q", label: "Question", type: "text" }, { key: "a", label: "Answer", type: "textarea" },
    ] }],
  },

  /* ---------------- Layout ---------------- */
  {
    type: "divider", label: "Divider", desc: "A line, dots or breathing space",
    category: "Layout", multi: true, noHeader: true,
    defaults: { style: "line", label: "" },
    fields: [
      { key: "style", label: "Style", type: "select", options: [
        { value: "line", label: "Line" }, { value: "dots", label: "Dots" }, { value: "space", label: "Space only" },
      ] },
      { key: "label", label: "Label on the line", type: "text" },
    ],
  },
];

export const CATEGORIES: Category[] = ["Basics", "About", "Offerings", "Trust", "Media", "Engage", "Layout"];

export const defById = new Map(BLOCK_DEFS.map((d) => [d.type, d]));
export const getDef = (type: string) => defById.get(type);

let seq = 0;
export const newBlockId = (type: string) =>
  `${type}-${Date.now().toString(36)}-${(seq++).toString(36)}${Math.random().toString(36).slice(2, 5)}`;

export function createBlock(type: string, props: Record<string, unknown> = {}, id?: string): Block {
  const def = getDef(type);
  return {
    // Seed data passes a stable id so server and client render the same markup.
    id: id ?? newBlockId(type),
    type,
    visible: true,
    props: { ...(def?.defaults ?? {}), ...props },
  };
}
