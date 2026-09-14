export type Service = {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
  popular?: boolean;
  bookings: number;
};

export type LinkIcon = "portfolio" | "linkedin" | "payment" | "youtube" | "brochure" | "instagram";

export type LinkItem = {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  icon: LinkIcon;
  clicks: number;
  visible: boolean;
};

export type Job = {
  id: string;
  title: string;
  type: string;
  location: string;
  pay: string;
  tags: string[];
  posted: string;
  applicants: number;
  open: boolean;
};

export type EventItem = {
  id: string;
  title: string;
  date: string;
  day: string;
  month: string;
  time: string;
  venue: string;
  attendees: number;
  price: string;
  description: string;
  cover: string;
};

export type Subscriber = {
  id: string;
  name: string;
  email: string;
  date: string;
  source: string;
};

export type Booking = {
  id: string;
  client: string;
  service: string;
  date: string;
  time: string;
  status: "Confirmed" | "Pending" | "Completed";
};

export type Profile = {
  name: string;
  title: string;
  tagline: string;
  avatar: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  location: string;
  city: string;
  handle: string;
  url: string;
  /** The org / party / hospital row under the headline. */
  org: { name: string; note: string; initials: string };
  stats: { a: string; b: string; c: string };
  statLabels: { a: string; b: string; c: string };
  /** Replaces "Replies in ~2 hrs" in the header chip. */
  responseNote: string;
};

export const profile: Profile = {
  name: "Sheela Bhaskaran",
  title: "CEO, Octogon Mitra Investments",
  tagline:
    "Helping families and founders build generational wealth with clarity, discipline and heart.",
  avatar: "https://i.pravatar.cc/300?img=47",
  phone: "+91 98400 12345",
  whatsapp: "919840012345",
  email: "sheela@octogonmitra.com",
  website: "octogonmitra.com",
  location: "T. Nagar, Chennai, Tamil Nadu",
  city: "Chennai, India",
  handle: "sheela",
  url: "https://onesite4u.com/sheela",
  org: { name: "Octogon Mitra Investments", note: "SEBI registered · Est. 2014", initials: "OM" },
  stats: { a: "350+", b: "4.9", c: "12 yrs" },
  statLabels: { a: "Clients", b: "Rating", c: "Experience" },
  responseNote: "Replies in ~2 hrs",
};

export const links: LinkItem[] = [
  {
    id: "l1",
    title: "Portfolio & Case Studies",
    subtitle: "octogonmitra.com/portfolio",
    url: "https://octogonmitra.com/portfolio",
    icon: "portfolio",
    clicks: 128,
    visible: true,
  },
  {
    id: "l2",
    title: "LinkedIn",
    subtitle: "Connect with me professionally",
    url: "https://linkedin.com/in/sheela-bhaskaran",
    icon: "linkedin",
    clicks: 96,
    visible: true,
  },
  {
    id: "l3",
    title: "Pay via UPI",
    subtitle: "sheela@okaxis · Secure payments",
    url: "upi://pay?pa=sheela@okaxis",
    icon: "payment",
    clicks: 54,
    visible: true,
  },
  {
    id: "l4",
    title: "YouTube Channel",
    subtitle: "Weekly market insights",
    url: "https://youtube.com/@octogonmitra",
    icon: "youtube",
    clicks: 31,
    visible: true,
  },
  {
    id: "l5",
    title: "Company Brochure",
    subtitle: "Download PDF · 2.4 MB",
    url: "https://octogonmitra.com/brochure.pdf",
    icon: "brochure",
    clicks: 11,
    visible: true,
  },
];

export const services: Service[] = [
  {
    id: "s1",
    name: "Financial Consulting",
    price: 5000,
    duration: "60 min",
    description: "A focused one-on-one review of your income, expenses, goals and gaps.",
    bookings: 14,
  },
  {
    id: "s2",
    name: "Investment Planning",
    price: 10000,
    duration: "90 min",
    description: "A personalised portfolio strategy across equity, debt, gold and real estate.",
    popular: true,
    bookings: 9,
  },
  {
    id: "s3",
    name: "Retirement Roadmap",
    price: 7500,
    duration: "60 min",
    description: "Map your retirement corpus, withdrawal plan and tax-efficient structure.",
    bookings: 2,
  },
];

export const gallery = [
  { id: "g1", src: "https://picsum.photos/seed/os4u-11/800/800", caption: "Wealth workshop, Chennai" },
  { id: "g2", src: "https://picsum.photos/seed/os4u-22/600/600", caption: "Client appreciation night" },
  { id: "g3", src: "https://picsum.photos/seed/os4u-33/600/600", caption: "Panel at FinTech Summit" },
  { id: "g4", src: "https://picsum.photos/seed/os4u-44/600/600", caption: "Team offsite 2026" },
  { id: "g5", src: "https://picsum.photos/seed/os4u-55/600/600", caption: "Founders' roundtable" },
  { id: "g6", src: "https://picsum.photos/seed/os4u-66/600/600", caption: "Office, T. Nagar" },
];

export const events: EventItem[] = [
  {
    id: "e1",
    title: "Wealth Growth Workshop",
    date: "Sept 30, 2026",
    day: "30",
    month: "Sep",
    time: "10:00 AM – 1:00 PM",
    venue: "Hotel Savera, Chennai",
    attendees: 42,
    price: "Free entry",
    description:
      "A hands-on morning on building a resilient portfolio, tax-smart investing and long-term compounding.",
    cover: "https://picsum.photos/seed/os4u-event/900/500",
  },
];

export const event = events[0];

export const jobs: Job[] = [
  {
    id: "j1",
    title: "Financial Analyst Intern",
    type: "Internship · 6 months",
    location: "Chennai (Hybrid)",
    pay: "₹15,000 / month",
    tags: ["Excel", "Equity Research", "Fresher friendly"],
    posted: "3 days ago",
    applicants: 18,
    open: true,
  },
  {
    id: "j2",
    title: "Sales Executive",
    type: "Full-time",
    location: "Chennai",
    pay: "₹4 – 6 LPA + incentives",
    tags: ["B2C Sales", "Tamil & English", "2+ yrs"],
    posted: "1 week ago",
    applicants: 27,
    open: true,
  },
];

export const slots = ["09:30 AM", "10:30 AM", "11:30 AM", "02:00 PM", "03:30 PM", "05:00 PM"];

export const stats = {
  views: 1200,
  clicks: 320,
  bookings: 25,
  subscribers: 80,
};

export const weeklyViews = [
  { day: "Mon", value: 140 },
  { day: "Tue", value: 165 },
  { day: "Wed", value: 120 },
  { day: "Thu", value: 190 },
  { day: "Fri", value: 210 },
  { day: "Sat", value: 175 },
  { day: "Sun", value: 200 },
];

export const subscribers: Subscriber[] = [
  { id: "u1", name: "Arjun Menon", email: "arjun.menon@gmail.com", date: "Today", source: "Profile" },
  { id: "u2", name: "Priya Raghavan", email: "priya.r@outlook.com", date: "Today", source: "Event" },
  { id: "u3", name: "Karthik S", email: "karthik.s@yahoo.in", date: "Yesterday", source: "Profile" },
  { id: "u4", name: "Divya Krishnan", email: "divya.k@gmail.com", date: "Yesterday", source: "Workshop" },
  { id: "u5", name: "Rahul Verma", email: "rahul.verma@company.io", date: "2 days ago", source: "Profile" },
  { id: "u6", name: "Meera Iyer", email: "meera.iyer@gmail.com", date: "3 days ago", source: "QR scan" },
  { id: "u7", name: "Suresh Babu", email: "suresh.b@hotmail.com", date: "4 days ago", source: "Profile" },
  { id: "u8", name: "Anitha Rajan", email: "anitha.rajan@gmail.com", date: "5 days ago", source: "Event" },
];

export const bookings: Booking[] = [
  { id: "b1", client: "Arjun Menon", service: "Investment Planning", date: "Sep 12", time: "10:30 AM", status: "Confirmed" },
  { id: "b2", client: "Priya Raghavan", service: "Financial Consulting", date: "Sep 12", time: "02:00 PM", status: "Confirmed" },
  { id: "b3", client: "Karthik S", service: "Retirement Roadmap", date: "Sep 14", time: "11:30 AM", status: "Pending" },
  { id: "b4", client: "Divya Krishnan", service: "Financial Consulting", date: "Sep 15", time: "09:30 AM", status: "Confirmed" },
  { id: "b5", client: "Rahul Verma", service: "Investment Planning", date: "Sep 10", time: "03:30 PM", status: "Completed" },
];

/* ---------------- Experience ---------------- */

export type ExperienceItem = {
  id: string;
  role: string;
  company: string;
  period: string;
  location: string;
  description: string;
  current?: boolean;
};

export const experience: ExperienceItem[] = [
  {
    id: "x1",
    role: "Founder & CEO",
    company: "Octogon Mitra Investments",
    period: "2014 — Present",
    location: "Chennai",
    description:
      "Built a boutique advisory managing ₹180 Cr across 350+ families, with a focus on goal-based planning.",
    current: true,
  },
  {
    id: "x2",
    role: "Vice President, Wealth",
    company: "Meridian Capital",
    period: "2009 — 2014",
    location: "Mumbai",
    description: "Led the South India HNI desk and grew the book from ₹40 Cr to ₹310 Cr in five years.",
  },
  {
    id: "x3",
    role: "Equity Research Analyst",
    company: "Bluestone Securities",
    period: "2006 — 2009",
    location: "Mumbai",
    description: "Covered banking and NBFC stocks, publishing weekly notes for institutional clients.",
  },
];

/* ---------------- Reviews ---------------- */

export type Review = {
  id: string;
  author: string;
  role: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
};

export const reviews: Review[] = [
  {
    id: "r1",
    author: "Arjun Menon",
    role: "Founder, Kettle & Co.",
    avatar: "https://i.pravatar.cc/128?img=15",
    rating: 5,
    text: "Sheela rebuilt our family portfolio from scratch. Clear, unhurried and never sold us a product we did not need.",
    date: "Aug 2026",
  },
  {
    id: "r2",
    author: "Priya Raghavan",
    role: "Director, Vaira Textiles",
    avatar: "https://i.pravatar.cc/128?img=32",
    rating: 5,
    text: "The retirement roadmap session paid for itself many times over. I finally understand where every rupee is going.",
    date: "Jul 2026",
  },
  {
    id: "r3",
    author: "Karthik Subramanian",
    role: "Senior Architect",
    avatar: "https://i.pravatar.cc/128?img=51",
    rating: 4,
    text: "Very practical advice on tax-efficient investing. Follow-ups are prompt and the reviews are genuinely useful.",
    date: "Jun 2026",
  },
  {
    id: "r4",
    author: "Divya Krishnan",
    role: "Consultant Physician",
    avatar: "https://i.pravatar.cc/128?img=45",
    rating: 5,
    text: "I came in anxious about market noise and left with a written plan I could actually follow. Highly recommended.",
    date: "May 2026",
  },
];

/* ---------------- Clients ---------------- */

export type Client = {
  id: string;
  name: string;
  initials: string;
  industry: string;
  since: string;
};

export const clients: Client[] = [
  { id: "c1", name: "Vaira Textiles", initials: "VT", industry: "Manufacturing", since: "2016" },
  { id: "c2", name: "Kettle & Co.", initials: "KC", industry: "F&B", since: "2018" },
  { id: "c3", name: "Nordwind Labs", initials: "NL", industry: "SaaS", since: "2019" },
  { id: "c4", name: "Aruna Hospitals", initials: "AH", industry: "Healthcare", since: "2015" },
  { id: "c5", name: "Sundar Logistics", initials: "SL", industry: "Logistics", since: "2020" },
  { id: "c6", name: "Peridot Studio", initials: "PS", industry: "Design", since: "2021" },
];

/* ---------------- Knowledge base (powers the AI assistant) ---------------- */

export type Knowledge = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  /** Set when the entry came from an uploaded document. */
  source?: string;
};

export const knowledge: Knowledge[] = [
  {
    id: "k1",
    title: "Services and pricing",
    tags: ["pricing", "cost", "fees", "services", "charges", "rate"],
    content:
      "Financial Consulting costs ₹5,000 for a 60 minute one-on-one session covering income, expenses, goals and gaps. Investment Planning costs ₹10,000 for 90 minutes and produces a personalised portfolio strategy across equity, debt, gold and real estate. The Retirement Roadmap is ₹7,500 for 60 minutes and maps your corpus, withdrawal plan and tax structure. All fees are advisory only. I do not earn commission on any product I recommend.",
  },
  {
    id: "k2",
    title: "How booking works",
    tags: ["book", "appointment", "meeting", "slot", "schedule", "reschedule", "cancel"],
    content:
      "Pick a service, choose a date and slot, and you get an instant confirmation by SMS and email with a Google Meet link. Sessions run Monday to Saturday between 9:30 AM and 6:00 PM IST. In-person meetings happen at the T. Nagar office. You can reschedule free of charge up to 24 hours before the session. Cancellations inside 24 hours carry a 50 percent fee.",
  },
  {
    id: "k3",
    title: "Investment philosophy",
    tags: ["philosophy", "approach", "strategy", "risk", "returns", "market", "portfolio"],
    content:
      "I build goal-based portfolios rather than chasing benchmarks. Every plan starts with an emergency fund and term insurance before a single rupee goes into equity. Asset allocation is set by your time horizon, not by market sentiment. I rebalance twice a year and avoid products with lock-ins that you do not understand. Expect realistic long-term returns of 10 to 12 percent on equity heavy portfolios, not guaranteed numbers.",
  },
  {
    id: "k4",
    title: "Background and credentials",
    tags: ["experience", "credentials", "qualification", "sebi", "about", "background", "who"],
    content:
      "I am Sheela Bhaskaran, founder and CEO of Octogon Mitra Investments, a SEBI registered advisory established in 2014. I have twelve years of experience and have worked with more than 350 families. Before founding the firm I was Vice President of Wealth at Meridian Capital and an equity research analyst at Bluestone Securities.",
  },
  {
    id: "k5",
    title: "Who I work with",
    tags: ["clients", "who", "minimum", "eligibility", "nri", "salaried", "business"],
    content:
      "Most clients are salaried professionals, doctors and first generation business owners in Tamil Nadu. There is no minimum portfolio size for a consultation. I also work with NRI clients over video call, though I do not advise on US-domiciled accounts. If your situation needs a chartered accountant or a lawyer I will say so rather than stretch beyond my remit.",
  },
  {
    id: "k6",
    title: "Wealth Growth Workshop",
    tags: ["workshop", "event", "seminar", "rsvp", "september"],
    content:
      "The Wealth Growth Workshop runs on 30 September 2026 from 10:00 AM to 1:00 PM at Hotel Savera, Chennai. Entry is free and 42 people have registered so far. The morning covers building a resilient portfolio, tax-smart investing and the mathematics of long-term compounding. Seats are limited, so RSVP early.",
  },
  {
    id: "k7",
    title: "Careers and hiring",
    tags: ["job", "hiring", "career", "intern", "vacancy", "apply", "salary"],
    content:
      "We are hiring a Financial Analyst Intern for a six month hybrid role in Chennai at ₹15,000 per month, open to freshers comfortable with Excel and equity research. We are also hiring a Sales Executive in Chennai, full time, at ₹4 to 6 lakh per annum plus incentives, requiring two years of B2C sales experience and fluency in Tamil and English. Applications are reviewed within three to five working days.",
  },
  {
    id: "k8",
    title: "Contact and office hours",
    tags: ["contact", "phone", "email", "address", "office", "location", "hours", "reach"],
    content:
      "The office is in T. Nagar, Chennai, Tamil Nadu and is open Monday to Saturday from 9:30 AM to 6:00 PM. You can call or WhatsApp +91 98400 12345 or email sheela@octogonmitra.com. I usually reply within two hours during working days. Sunday is reserved for family.",
  },
];

export type AssistantSettings = {
  enabled: boolean;
  name: string;
  greeting: string;
  suggestions: string[];
};

export const assistant: AssistantSettings = {
  enabled: true,
  name: "Ask Sheela",
  greeting:
    "Hi! I'm Sheela's assistant. Ask me about services, pricing, booking or the upcoming workshop and I'll answer from her knowledge base.",
  suggestions: [
    "How much does investment planning cost?",
    "How do I book a session?",
    "What is your investment philosophy?",
    "Tell me about the workshop",
  ],
};


/* ---------------- Milestones (promises, roadmap, track record) ---------------- */

export type MilestoneStatus = "done" | "progress" | "planned";

export type Milestone = {
  id: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  progress: number;
  meta: string;
};

/* ---------------- Request desk (grievances, enquiries) ---------------- */

export type GrievanceConfig = {
  enabled: boolean;
  categories: string[];
  sla: string;
  note: string;
  askLocation: boolean;
  locationLabel: string;
};

export type RequestItem = {
  id: string;
  ref: string;
  name: string;
  category: string;
  location: string;
  summary: string;
  status: "Open" | "In progress" | "Resolved";
  date: string;
};

export const DISABLED_GRIEVANCE: GrievanceConfig = {
  enabled: false,
  categories: [],
  sla: "",
  note: "",
  askLocation: false,
  locationLabel: "Area",
};
