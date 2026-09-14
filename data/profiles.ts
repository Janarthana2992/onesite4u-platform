/**
 * Example profiles. Each is ordinary demo content — the same blocks, arranged
 * and worded differently — so you can see how one page serves very different
 * kinds of work. Loading one replaces the demo data; nothing is locked down.
 */

import { createBlock, type Block } from "@/data/blocks";
import { profileUrl } from "@/lib/site";
import { DEFAULT_SEED, type SeedContent } from "@/data/seed";

/** Per-block props a profile seeds: headings plus whatever that block holds. */
type BlockProps = Record<string, Record<string, unknown>>;

const page = (prefix: string, types: string[], props: BlockProps = {}): Block[] =>
  types.map((t, i) => createBlock(t, props[t] ?? {}, `${prefix}-${t}-${i}`));

export type ExampleProfile = {
  id: string;
  name: string;
  field: string;
  blurb: string;
  /** Blocks this profile shows off, for the picker card. */
  highlights: string[];
  template: string;
  content: SeedContent;
};

/* ======================= 2. Wedding photographer ======================= */

const photographer: ExampleProfile = {
  id: "photographer",
  name: "Aarav Mehta",
  field: "Wedding photographer",
  blurb: "Portfolio-led page with packages, an availability tracker and an enquiry desk.",
  highlights: ["Photo gallery", "Pricing table", "Video", "Progress tracker"],
  template: "editorial",
  content: {
    profile: {
      name: "Aarav Mehta",
      title: "Wedding & Editorial Photographer",
      tagline:
        "Unposed, unhurried photographs of the day you will want to remember exactly as it felt.",
      avatar: "https://i.pravatar.cc/300?img=68",
      phone: "+91 98290 44120",
      whatsapp: "919829044120",
      email: "hello@silverlight.studio",
      website: "silverlight.studio",
      location: "Civil Lines, Jaipur, Rajasthan",
      city: "Jaipur · travels worldwide",
      handle: "aarav",
      url: profileUrl("aarav"),
      org: { name: "Silverlight Studio", note: "Documentary weddings · Est. 2017", initials: "SL" },
      stats: { a: "180+", b: "4.9", c: "9 yrs" },
      statLabels: { a: "Weddings shot", b: "Rating", c: "Experience" },
      responseNote: "Taking 2027 dates",
    },
    links: [
      { id: "ph-l1", title: "Instagram", subtitle: "Daily frames and behind the scenes", url: "https://instagram.com", icon: "instagram", clicks: 642, visible: true },
      { id: "ph-l2", title: "Full client galleries", subtitle: "Password-protected delivery", url: "#", icon: "portfolio", clicks: 288, visible: true },
      { id: "ph-l3", title: "2027 price guide", subtitle: "PDF · 4.1 MB", url: "#", icon: "brochure", clicks: 411, visible: true },
      { id: "ph-l4", title: "Wedding films", subtitle: "Short cuts on Vimeo", url: "#", icon: "youtube", clicks: 176, visible: true },
      { id: "ph-l5", title: "Pay booking advance", subtitle: "UPI · secure", url: "#", icon: "payment", clicks: 94, visible: true },
    ],
    services: [
      { id: "ph-s1", name: "Full wedding coverage", price: 185000, duration: "3 days", description: "Two photographers, all events, 600+ edited frames and a 40-page album.", popular: true, bookings: 22 },
      { id: "ph-s2", name: "Pre-wedding shoot", price: 45000, duration: "6 hours", description: "One location of your choosing, 80 edited frames, outfit and light planning included.", bookings: 31 },
      { id: "ph-s3", name: "Editorial / brand shoot", price: 30000, duration: "4 hours", description: "Portraits and product frames for founders, designers and restaurants.", bookings: 14 },
    ],
    gallery: [
      { id: "ph-g1", src: "https://picsum.photos/seed/os4u-ph1/900/900", caption: "Udaipur, lakeside pheras" },
      { id: "ph-g2", src: "https://picsum.photos/seed/os4u-ph2/700/700", caption: "Haldi, morning light" },
      { id: "ph-g3", src: "https://picsum.photos/seed/os4u-ph3/700/700", caption: "Couple portrait, Amber Fort" },
      { id: "ph-g4", src: "https://picsum.photos/seed/os4u-ph4/700/700", caption: "Baraat, Jaipur old city" },
      { id: "ph-g5", src: "https://picsum.photos/seed/os4u-ph5/700/700", caption: "Mehendi details" },
      { id: "ph-g6", src: "https://picsum.photos/seed/os4u-ph6/700/700", caption: "Reception, first dance" },
    ],
    events: [
      {
        id: "ph-e1",
        title: "Portfolio Open House",
        date: "Oct 12, 2026",
        day: "12",
        month: "Oct",
        time: "5:00 PM – 8:00 PM",
        venue: "Silverlight Studio, Civil Lines",
        attendees: 34,
        price: "Free · RSVP",
        description: "See printed albums in person, meet the team and talk through your dates over chai.",
        cover: "https://picsum.photos/seed/os4u-phevent/900/500",
      },
    ],
    jobs: [
      { id: "ph-j1", title: "Second shooter", type: "Freelance · per wedding", location: "Jaipur / travel", pay: "₹8,000 – 12,000 per day", tags: ["Own kit", "Weekends", "2+ weddings"], posted: "6 days ago", applicants: 23, open: true },
      { id: "ph-j2", title: "Retouching assistant", type: "Part-time · remote", location: "Anywhere", pay: "₹18,000 / month", tags: ["Lightroom", "Capture One", "Colour eye"], posted: "2 weeks ago", applicants: 41, open: true },
    ],
    experience: [
      { id: "ph-x1", role: "Founder & lead photographer", company: "Silverlight Studio", period: "2017 — Present", location: "Jaipur", description: "Built a two-photographer studio shooting 25 weddings a year across India and three abroad.", current: true },
      { id: "ph-x2", role: "Staff photographer", company: "Nomad Quarterly", period: "2014 — 2017", location: "Mumbai", description: "Travel and food features, including eleven cover stories." },
      { id: "ph-x3", role: "Assistant", company: "Studio Kalpa", period: "2012 — 2014", location: "Delhi", description: "Lighting and second camera on editorial and wedding shoots." },
    ],
    reviews: [
      { id: "ph-r1", author: "Nikita & Varun", role: "Married Feb 2026", avatar: "https://i.pravatar.cc/128?img=25", rating: 5, text: "We barely noticed him working, and then the gallery arrived and every single moment we were worried we'd forget was there.", date: "Mar 2026" },
      { id: "ph-r2", author: "Sanjana Rao", role: "Married Dec 2025", avatar: "https://i.pravatar.cc/128?img=49", rating: 5, text: "Calm on a very chaotic morning. He handled two families, three photographers and a delayed baraat without once losing the light.", date: "Jan 2026" },
      { id: "ph-r3", author: "Ishaan Gupta", role: "Founder, Terra Coffee", avatar: "https://i.pravatar.cc/128?img=53", rating: 5, text: "Shot our menu and team in half a day. The images have carried our entire website and packaging since.", date: "Nov 2025" },
      { id: "ph-r4", author: "Priyanka Shah", role: "Married Nov 2025", avatar: "https://i.pravatar.cc/128?img=31", rating: 4, text: "The album took a few weeks longer than quoted, but the print quality made up for the wait.", date: "Feb 2026" },
    ],
    clients: [
      { id: "ph-c1", name: "Rambagh Palace", initials: "RP", industry: "Venue", since: "2019" },
      { id: "ph-c2", name: "The Wedding Co.", initials: "WC", industry: "Planner", since: "2018" },
      { id: "ph-c3", name: "Terra Coffee", initials: "TC", industry: "Brand", since: "2021" },
      { id: "ph-c4", name: "Nomad Quarterly", initials: "NQ", industry: "Publication", since: "2014" },
      { id: "ph-c5", name: "Anantara Resorts", initials: "AR", industry: "Venue", since: "2022" },
      { id: "ph-c6", name: "Bloom & Vine", initials: "BV", industry: "Florist", since: "2020" },
    ],
    milestones: [
      { id: "ph-m1", title: "November 2026", description: "Peak season. Both photographers committed for the month.", status: "done", progress: 100, meta: "Fully booked" },
      { id: "ph-m2", title: "December 2026", description: "Two Saturdays still open, weekdays wide open.", status: "progress", progress: 75, meta: "2 dates left" },
      { id: "ph-m3", title: "January – March 2027", description: "Now accepting enquiries, early-booking rate applies until August.", status: "progress", progress: 30, meta: "Open · early rate" },
      { id: "ph-m4", title: "Destination weddings 2027", description: "Two international dates held per quarter.", status: "planned", progress: 10, meta: "By enquiry" },
    ],
    grievance: {
      enabled: true,
      categories: ["Check a date", "Package & pricing", "Album or reprint", "Gallery access", "Something else"],
      sla: "Every enquiry answered within one day",
      note: "Please include your wedding dates and city so we can check availability in one reply.",
      askLocation: true,
      locationLabel: "Wedding city",
    },
    requests: [
      { id: "ph-q1", ref: "ENQ-3301", name: "Riya & Kabir", category: "Check a date", location: "Udaipur", summary: "Looking for 14–16 Feb 2027, full coverage.", status: "In progress", date: "Today" },
      { id: "ph-q2", ref: "ENQ-3299", name: "Aditya N.", category: "Album or reprint", location: "Jaipur", summary: "Wants two parent albums from the 2025 wedding.", status: "Open", date: "Yesterday" },
      { id: "ph-q3", ref: "ENQ-3294", name: "Meghna S.", category: "Package & pricing", location: "Goa", summary: "Asked for the destination package breakdown.", status: "Resolved", date: "3 days ago" },
    ],
    knowledge: [
      { id: "ph-k1", title: "Packages and what they cost", tags: ["price", "cost", "package", "fee", "rate", "charges"], content: "Full wedding coverage is ₹1,85,000 and includes two photographers across three days, more than 600 edited frames and a 40-page album. A pre-wedding shoot is ₹45,000 for six hours and 80 edited frames. Editorial and brand shoots start at ₹30,000 for four hours. Travel and stay outside Jaipur are billed at actuals." },
      { id: "ph-k2", title: "How booking works", tags: ["book", "booking", "advance", "date", "hold", "confirm", "deposit"], content: "Dates are held for seven days once you enquire. A signed agreement and a forty percent advance confirm the booking, with the balance due a week before the first event. Dates are released after seven days if we have not heard back. We take a limited number of weddings each month so peak-season Saturdays go early." },
      { id: "ph-k3", title: "Delivery timelines", tags: ["delivery", "timeline", "when", "gallery", "edit", "album", "raw"], content: "A preview set of thirty frames reaches you within five days. The full edited gallery is delivered in six to eight weeks, and albums take a further four weeks after you approve the layout. Peak season can add two weeks. We do not hand over unedited RAW files, as the edit is part of the work." },
      { id: "ph-k4", title: "Travel and destination weddings", tags: ["travel", "destination", "outstation", "abroad", "stay", "flight"], content: "We travel anywhere in India and abroad. Outside Jaipur, travel and twin-sharing accommodation are billed at actuals and added to your invoice. For destination weddings we arrive a day early to scout light and locations, and that day is included in the package." },
      { id: "ph-k5", title: "Coverage and the team", tags: ["team", "coverage", "hours", "photographer", "second", "video"], content: "Every wedding is covered by two photographers. Coverage runs from the first event of the day to an hour after the reception begins, typically ten to twelve hours a day. Film-making is handled by a partner team and quoted separately, usually between ₹90,000 and ₹1,50,000." },
      { id: "ph-k6", title: "Albums and prints", tags: ["album", "print", "reprint", "parent", "frame", "size"], content: "The 40-page album is hand-bound in Italian leather at 12 by 12 inches. Parent copies are ₹18,000 each and can be ordered any time. Fine-art prints are available from 8 by 12 inches upwards, priced from ₹1,200." },
    ],
    assistant: {
      enabled: true,
      name: "Studio assistant",
      greeting:
        "Hi! I can tell you about packages, availability, how booking works and delivery timelines. For a specific date, use the enquiry form and Aarav will reply personally.",
      suggestions: ["What does a full wedding cost?", "How do I book a date?", "When do we get our photos?", "Do you travel outside Jaipur?"],
    },
    blocks: page(
      "ph",
      [
        "quickInfo",
        "gallery",
        "services",
        "milestones",
        "video",
        "reviews",
        "assistant",
        "grievance",
        "event",
        "experience",
        "clients",
        "faq",
        "socials",
        "newsletter",
      ],
      {
        quickInfo: { title: "Studio & contact", subtitle: "Jaipur based, travelling year round", nav: "Studio" },
        gallery: { title: "Recent work", subtitle: "Weddings, portraits and the odd brand shoot" },
        services: { title: "Packages", subtitle: "What each one includes", nav: "Packages" },
        milestones: { title: "2026 – 27 availability", subtitle: "Where the calendar stands right now" },
        video: {
          title: "A wedding in three minutes",
          subtitle: "",
          thumbnail: "https://picsum.photos/seed/os4u-phfilm/1200/675",
          caption: "Nikita & Varun · Udaipur, February 2026",
          duration: "3:08",
          url: "https://vimeo.com/silverlight",
        },
        reviews: { title: "Words from couples", subtitle: "" },
        assistant: { title: "Studio assistant", subtitle: "Answers on pricing, booking and delivery" },
        grievance: { title: "Check your date", subtitle: "Tell us when and where and we will reply within a day" },
        event: { title: "Open house", subtitle: "See the albums in person" },
        experience: { title: "Background", subtitle: "Where the work comes from" },
        clients: { title: "Venues & brands", subtitle: "Regular collaborators" },
        faq: {
          title: "Before you ask",
          subtitle: "",
          items: [
            { q: "How far in advance should we book?", a: "Peak-season Saturdays usually go nine to twelve months ahead. Weekdays and the March to September window are far easier, often at two to three months." },
            { q: "Do we get the RAW files?", a: "No. The edit is a large part of the work, so we deliver finished frames. If you need a specific image treated differently, just ask and we will re-edit it." },
            { q: "What happens if you fall ill?", a: "We work as a two-photographer studio and keep a network of trusted shooters on call. You would be told immediately and never left without coverage." },
            { q: "Can we give you a shot list?", a: "Family and group combinations, yes, and we ask for them. Moment-by-moment lists tend to work against documentary coverage, so we keep those light." },
          ],
        },
        socials: {
          title: "Follow the work",
          subtitle: "",
          items: [
            { platform: "instagram", handle: "@silverlight.studio" },
            { platform: "youtube", handle: "Silverlight Films" },
            { platform: "whatsapp", handle: "+91 98290 44120" },
            { platform: "website", handle: "silverlight.studio" },
          ],
        },
        newsletter: { title: "Get the print guide", subtitle: "One email a season, plus early access to dates" },
      },
    ),
  },
};

/* ======================= 3. Yoga studio ======================= */

const yoga: ExampleProfile = {
  id: "yoga",
  name: "Meera Krishnan",
  field: "Yoga & wellness",
  blurb: "Timetable-led page with opening hours, a class price list and a teaching team.",
  highlights: ["Opening hours", "Schedule", "Menu / price list", "Team"],
  template: "forest",
  content: {
    profile: {
      name: "Meera Krishnan",
      title: "Yoga Teacher & Breathwork Coach",
      tagline: "Slow, precise practice for people who sit at a desk all day. Beginners genuinely welcome.",
      avatar: "https://i.pravatar.cc/300?img=45",
      phone: "+91 94470 21188",
      whatsapp: "919447021188",
      email: "hello@anahata.studio",
      website: "anahata.studio",
      location: "Panampilly Nagar, Kochi, Kerala",
      city: "Kochi, Kerala",
      handle: "meera",
      url: profileUrl("meera"),
      org: { name: "Anahata Studio", note: "E-RYT 500 · Est. 2015", initials: "AN" },
      stats: { a: "2,400+", b: "4.9", c: "11 yrs" },
      statLabels: { a: "Students taught", b: "Rating", c: "Teaching" },
      responseNote: "New batch starts Monday",
    },
    links: [
      { id: "yo-l1", title: "This week's timetable", subtitle: "Live class schedule", url: "#", icon: "portfolio", clicks: 512, visible: true },
      { id: "yo-l2", title: "Book a mat", subtitle: "Reserve your spot for the week", url: "#", icon: "payment", clicks: 380, visible: true },
      { id: "yo-l3", title: "Practice videos", subtitle: "20-minute sequences, free", url: "#", icon: "youtube", clicks: 268, visible: true },
      { id: "yo-l4", title: "Studio on Maps", subtitle: "Parking behind the building", url: "#", icon: "instagram", clicks: 141, visible: true },
    ],
    services: [
      { id: "yo-s1", name: "Drop-in class", price: 450, duration: "75 min", description: "Any scheduled class. Mats and props provided.", bookings: 96 },
      { id: "yo-s2", name: "Monthly unlimited", price: 3500, duration: "30 days", description: "Every class on the timetable, plus the Sunday breathwork circle.", popular: true, bookings: 64 },
      { id: "yo-s3", name: "One-to-one therapy session", price: 2000, duration: "60 min", description: "For back, neck or injury-specific work, at the studio or on video.", bookings: 28 },
    ],
    gallery: [
      { id: "yo-g1", src: "https://picsum.photos/seed/os4u-yo1/900/900", caption: "Morning light, main shala" },
      { id: "yo-g2", src: "https://picsum.photos/seed/os4u-yo2/700/700", caption: "Props wall" },
      { id: "yo-g3", src: "https://picsum.photos/seed/os4u-yo3/700/700", caption: "Breathwork circle" },
      { id: "yo-g4", src: "https://picsum.photos/seed/os4u-yo4/700/700", caption: "Beach practice, Cherai" },
      { id: "yo-g5", src: "https://picsum.photos/seed/os4u-yo5/700/700", caption: "Teacher training week" },
      { id: "yo-g6", src: "https://picsum.photos/seed/os4u-yo6/700/700", caption: "Studio entrance" },
    ],
    events: [
      {
        id: "yo-e1",
        title: "Breath & Backs Workshop",
        date: "Oct 5, 2026",
        day: "05",
        month: "Oct",
        time: "7:00 AM – 10:00 AM",
        venue: "Anahata Studio, Panampilly Nagar",
        attendees: 26,
        price: "₹1,200",
        description: "Three hours on desk posture, safe backbends and a breathing practice you can use at work.",
        cover: "https://picsum.photos/seed/os4u-yoevent/900/500",
      },
    ],
    jobs: [
      { id: "yo-j1", title: "Cover teacher", type: "Part-time", location: "Kochi", pay: "₹1,200 per class", tags: ["200hr certified", "Weekday mornings", "Malayalam & English"], posted: "1 week ago", applicants: 9, open: true },
    ],
    experience: [
      { id: "yo-x1", role: "Founder & lead teacher", company: "Anahata Studio", period: "2015 — Present", location: "Kochi", description: "Built a 40-mat studio running 18 classes a week and two teacher trainings a year.", current: true },
      { id: "yo-x2", role: "Senior teacher", company: "Prana Yoga Mysore", period: "2011 — 2015", location: "Mysore", description: "Led the beginners programme and the therapeutic back-care clinic." },
    ],
    reviews: [
      { id: "yo-r1", author: "Deepa Menon", role: "Software engineer", avatar: "https://i.pravatar.cc/128?img=27", rating: 5, text: "Six months in and the shoulder pain I had lived with for years is simply gone. She actually corrects you instead of shouting from the front.", date: "Aug 2026" },
      { id: "yo-r2", author: "Joseph Mathew", role: "Retired, 68", avatar: "https://i.pravatar.cc/128?img=61", rating: 5, text: "I was nervous about being the oldest in the room. Within a week that worry disappeared entirely.", date: "Jul 2026" },
      { id: "yo-r3", author: "Anjali Pillai", role: "Doctor", avatar: "https://i.pravatar.cc/128?img=35", rating: 5, text: "The breathwork sessions are the only thirty minutes of my week that genuinely reset me.", date: "Jun 2026" },
    ],
    clients: [
      { id: "yo-c1", name: "Infopark Wellness", initials: "IW", industry: "Corporate", since: "2019" },
      { id: "yo-c2", name: "Cherai Retreat", initials: "CR", industry: "Retreat", since: "2021" },
      { id: "yo-c3", name: "Lakeside School", initials: "LS", industry: "Education", since: "2022" },
      { id: "yo-c4", name: "Mind & Body Clinic", initials: "MB", industry: "Healthcare", since: "2018" },
    ],
    milestones: [],
    grievance: {
      enabled: true,
      categories: ["Trial class", "Membership & billing", "Injury or modification", "Timings", "Something else"],
      sla: "Answered the same day, before 8 PM",
      note: "If you are recovering from surgery or a recent injury, please mention it so Meera can advise properly before your first class.",
      askLocation: false,
      locationLabel: "Preferred batch",
    },
    requests: [
      { id: "yo-q1", ref: "REQ-8812", name: "Deepa M.", category: "Timings", location: "—", summary: "Wants to move from the 6 AM to the 7 PM batch.", status: "Resolved", date: "Today" },
      { id: "yo-q2", ref: "REQ-8810", name: "Nithin R.", category: "Injury or modification", location: "—", summary: "Recovering from a knee scope, asking what to skip.", status: "In progress", date: "Yesterday" },
      { id: "yo-q3", ref: "REQ-8807", name: "Farah A.", category: "Trial class", location: "—", summary: "First time, wants a beginner-friendly slot.", status: "Open", date: "2 days ago" },
    ],
    knowledge: [
      { id: "yo-k1", title: "Class timings", tags: ["timing", "time", "schedule", "class", "batch", "when", "open"], content: "Classes run Monday to Saturday. Mornings are 6:00 and 7:30 AM, evenings are 6:00 and 7:30 PM. Sunday has a single breathwork circle at 8:00 AM. The studio is closed on the second Sunday of each month. Arrive ten minutes early for your first class." },
      { id: "yo-k2", title: "Pricing and memberships", tags: ["price", "fee", "cost", "membership", "monthly", "pass", "drop"], content: "A drop-in class is ₹450. Monthly unlimited is ₹3,500 and covers every class on the timetable plus the Sunday circle. One-to-one therapy sessions are ₹2,000 for an hour. There is no joining fee and no lock-in; memberships simply lapse if you do not renew." },
      { id: "yo-k3", title: "Complete beginners", tags: ["beginner", "new", "first", "start", "nervous", "flexible"], content: "About half the people in any class started as complete beginners. You do not need to be flexible, and there is no minimum fitness level. The 7:30 AM and 6:00 PM slots are the gentlest places to start. Your first class is free so you can see whether the room suits you." },
      { id: "yo-k4", title: "What to bring", tags: ["bring", "mat", "clothes", "eat", "water", "prop"], content: "Bring water and comfortable clothes you can move in. Mats, blocks, straps and bolsters are all provided. Practise on an empty stomach, ideally two hours after a light meal, and leave your shoes at the entrance." },
      { id: "yo-k5", title: "Injuries and modifications", tags: ["injury", "back", "knee", "pregnant", "surgery", "pain", "modification"], content: "Tell Meera before class about any injury, surgery in the last six months or if you are pregnant. Every posture has a modification and nobody is ever pushed into a shape. For back and neck issues specifically, a one-to-one session first is usually the fastest route." },
      { id: "yo-k6", title: "Corporate and group sessions", tags: ["corporate", "office", "group", "company", "team", "onsite"], content: "Onsite sessions for offices run 45 or 60 minutes and are priced per session for groups up to twenty five. We currently work with Infopark Wellness and a handful of teams in Kakkanad. Email for a quote with your group size and preferred slot." },
    ],
    assistant: {
      enabled: true,
      name: "Studio helper",
      greeting:
        "Namaste! Ask me about class timings, pricing, what to bring or starting as a beginner. For anything about an injury, mention it and Meera will reply herself.",
      suggestions: ["What are the class timings?", "How much is a monthly pass?", "I've never done yoga before", "What should I bring?"],
    },
    blocks: page(
      "yo",
      [
        "quickInfo",
        "hours",
        "services",
        "schedule",
        "assistant",
        "grievance",
        "reviews",
        "team",
        "gallery",
        "event",
        "faq",
        "map",
        "clients",
        "newsletter",
      ],
      {
        quickInfo: { title: "The studio", subtitle: "Where to find us and how to reach us", nav: "Studio" },
        hours: {
          title: "Opening hours",
          subtitle: "Six days a week",
          note: "Closed on the second Sunday of every month",
          items: [
            { day: "Mon – Fri", time: "6:00, 7:30 AM · 6:00, 7:30 PM" },
            { day: "Saturday", time: "7:30 AM · 5:30 PM" },
            { day: "Sunday", time: "8:00 AM breathwork only" },
          ],
        },
        services: { title: "Passes & sessions", subtitle: "No joining fee, no lock-in", nav: "Passes" },
        schedule: {
          title: "A day at the studio",
          subtitle: "Typical weekday timetable",
          items: [
            { time: "6:00", title: "Ashtanga-led primary", note: "Intermediate" },
            { time: "7:30", title: "Slow flow & alignment", note: "Beginner friendly" },
            { time: "11:00", title: "Therapeutic back care", note: "One-to-one slots" },
            { time: "18:00", title: "Desk-body unwind", note: "Beginner friendly" },
            { time: "19:30", title: "Yin & breathwork", note: "All levels" },
          ],
        },
        assistant: { title: "Studio helper", subtitle: "Timings, pricing and getting started" },
        grievance: { title: "Book a trial class", subtitle: "Your first class is free" },
        reviews: { title: "From the mat", subtitle: "What students say" },
        team: {
          title: "Who teaches",
          subtitle: "",
          items: [
            { name: "Meera Krishnan", role: "Lead teacher · E-RYT 500", avatar: "https://i.pravatar.cc/160?img=45" },
            { name: "Ravi Sankar", role: "Ashtanga & mobility", avatar: "https://i.pravatar.cc/160?img=59" },
            { name: "Liya Thomas", role: "Yin & prenatal", avatar: "https://i.pravatar.cc/160?img=23" },
          ],
        },
        gallery: { title: "Inside Anahata", subtitle: "" },
        event: { title: "Workshops", subtitle: "Deeper sessions, once a month" },
        faq: {
          title: "Common questions",
          subtitle: "",
          items: [
            { q: "I am not flexible at all. Can I still come?", a: "Yes, and so did most of the room. Flexibility is a result of practice, not a requirement for starting one." },
            { q: "Do I need my own mat?", a: "No. Mats, blocks, straps and bolsters are all provided and cleaned after every class." },
            { q: "Is there a joining fee or lock-in?", a: "Neither. Monthly passes simply lapse if you do not renew, and you can pause any time." },
            { q: "I have a back injury. Is it safe?", a: "Usually yes, with modifications. Tell Meera before your first class and she will often suggest a one-to-one session first." },
          ],
        },
        map: {
          title: "Getting here",
          subtitle: "Parking behind the building",
          label: "Anahata Studio",
          address: "2nd floor, Lotus Arcade, Panampilly Nagar, Kochi 682036",
        },
        clients: { title: "We also teach at", subtitle: "" },
        newsletter: { title: "Weekly timetable by email", subtitle: "One short email every Sunday evening" },
      },
    ),
  },
};

/* ======================= 4. Advocate ======================= */

const advocate: ExampleProfile = {
  id: "advocate",
  name: "Rohan Deshpande",
  field: "Advocate",
  blurb: "Credentials-led page with a matter intake desk, fee downloads and a careful FAQ.",
  highlights: ["Certifications", "Request desk", "FAQ", "Downloads"],
  template: "ocean",
  content: {
    profile: {
      name: "Rohan Deshpande",
      title: "Advocate — Corporate & Property Law",
      tagline:
        "Plain-language advice on contracts, property and compliance, with fixed fees wherever the work allows.",
      avatar: "https://i.pravatar.cc/300?img=51",
      phone: "+91 98220 77341",
      whatsapp: "919822077341",
      email: "chambers@deshpandelaw.in",
      website: "deshpandelaw.in",
      location: "Deccan Gymkhana, Pune, Maharashtra",
      city: "Pune, Maharashtra",
      handle: "rohan",
      url: profileUrl("rohan"),
      org: { name: "Deshpande & Associates", note: "Bar Council of Maharashtra & Goa · Est. 2011", initials: "DA" },
      stats: { a: "600+", b: "4.8", c: "14 yrs" },
      statLabels: { a: "Matters handled", b: "Rating", c: "At the bar" },
      responseNote: "Consults Mon–Sat, 10–6",
    },
    links: [
      { id: "ad-l1", title: "Practice areas", subtitle: "What we do and do not take on", url: "#", icon: "portfolio", clicks: 214, visible: true },
      { id: "ad-l2", title: "Fee schedule 2026", subtitle: "PDF · 240 KB", url: "#", icon: "brochure", clicks: 302, visible: true },
      { id: "ad-l3", title: "LinkedIn", subtitle: "Notes on judgments and compliance", url: "#", icon: "linkedin", clicks: 158, visible: true },
      { id: "ad-l4", title: "Pay a fee note", subtitle: "Secure UPI", url: "#", icon: "payment", clicks: 87, visible: true },
    ],
    services: [
      { id: "ad-s1", name: "Initial consultation", price: 2500, duration: "45 min", description: "Understand your position, the options and what each would realistically cost.", popular: true, bookings: 52 },
      { id: "ad-s2", name: "Contract drafting or review", price: 7500, duration: "3–5 days", description: "Employment, vendor, founder and lease agreements, with a marked-up version and a plain-language note.", bookings: 37 },
      { id: "ad-s3", name: "Property due diligence", price: 25000, duration: "2–3 weeks", description: "Title search, encumbrance check and a written opinion before you pay an advance.", bookings: 19 },
    ],
    gallery: [],
    events: [
      {
        id: "ad-e1",
        title: "Free legal clinic for small businesses",
        date: "Oct 18, 2026",
        day: "18",
        month: "Oct",
        time: "10:00 AM – 1:00 PM",
        venue: "Chambers, Deccan Gymkhana",
        attendees: 41,
        price: "Free · register",
        description: "Fifteen-minute slots on contracts, GST notices and employment paperwork for businesses under ten people.",
        cover: "https://picsum.photos/seed/os4u-adevent/900/500",
      },
    ],
    jobs: [
      { id: "ad-j1", title: "Junior associate", type: "Full-time", location: "Pune", pay: "₹5 – 7 LPA", tags: ["LLB", "0–2 yrs", "Drafting"], posted: "5 days ago", applicants: 34, open: true },
      { id: "ad-j2", title: "Law intern", type: "Internship · 8 weeks", location: "Pune", pay: "₹10,000 / month", tags: ["3rd–5th year", "Research", "Court visits"], posted: "2 weeks ago", applicants: 87, open: true },
    ],
    experience: [
      { id: "ad-x1", role: "Founder & managing partner", company: "Deshpande & Associates", period: "2011 — Present", location: "Pune", description: "Corporate advisory and property work for founders, family businesses and NRI clients.", current: true },
      { id: "ad-x2", role: "Senior associate", company: "Marathe & Co.", period: "2006 — 2011", location: "Mumbai", description: "Commercial litigation before the Bombay High Court and arbitration work." },
      { id: "ad-x3", role: "Junior counsel", company: "Chambers of Sr. Adv. N. Kulkarni", period: "2004 — 2006", location: "Mumbai", description: "Drafting, research and appearances before trial courts." },
    ],
    reviews: [
      { id: "ad-r1", author: "Sameer Joshi", role: "Founder, Reva Logistics", avatar: "https://i.pravatar.cc/128?img=58", rating: 5, text: "He talked us out of a deal we badly wanted and were about to sign. Eighteen months later that was obviously the right call.", date: "Aug 2026" },
      { id: "ad-r2", author: "Kavita Rane", role: "NRI client, Dubai", avatar: "https://i.pravatar.cc/128?img=29", rating: 5, text: "Handled a disputed ancestral property from 3,000 km away and explained every step in language I actually understood.", date: "Jun 2026" },
      { id: "ad-r3", author: "Harish Patil", role: "Director, Sahyadri Foods", avatar: "https://i.pravatar.cc/128?img=54", rating: 4, text: "Thorough and fairly priced. Court timelines are what they are, but we were never left wondering what was happening.", date: "May 2026" },
    ],
    clients: [
      { id: "ad-c1", name: "Reva Logistics", initials: "RL", industry: "Logistics", since: "2018" },
      { id: "ad-c2", name: "Sahyadri Foods", initials: "SF", industry: "FMCG", since: "2014" },
      { id: "ad-c3", name: "Kothrud Housing Society", initials: "KH", industry: "Housing", since: "2016" },
      { id: "ad-c4", name: "Nexa Technologies", initials: "NT", industry: "SaaS", since: "2021" },
    ],
    milestones: [],
    grievance: {
      enabled: true,
      categories: ["New matter", "Existing matter", "Document request", "Fee query", "Something else"],
      sla: "First response within one working day",
      note: "Please do not upload confidential documents or case papers here. Sending this form does not create an advocate–client relationship, and nothing on this page is legal advice.",
      askLocation: true,
      locationLabel: "Matter reference (if any)",
    },
    requests: [
      { id: "ad-q1", ref: "MAT-1182", name: "Sameer J.", category: "Existing matter", location: "MAT-0994", summary: "Asking for the status of the vendor agreement revision.", status: "In progress", date: "Today" },
      { id: "ad-q2", ref: "MAT-1181", name: "Anita K.", category: "New matter", location: "—", summary: "Flat purchase in Baner, wants title verification before advance.", status: "Open", date: "Today" },
      { id: "ad-q3", ref: "MAT-1176", name: "Nexa Technologies", category: "Document request", location: "MAT-1032", summary: "Needs signed copies of the ESOP policy.", status: "Resolved", date: "2 days ago" },
    ],
    knowledge: [
      { id: "ad-k1", title: "Fees and how they work", tags: ["fee", "fees", "cost", "price", "charge", "billing", "retainer"], content: "An initial consultation is ₹2,500 for forty five minutes and is adjusted against the fee if you go ahead. Contract drafting or review starts at ₹7,500. Property due diligence is ₹25,000 and covers title search, encumbrance check and a written opinion. Litigation is billed per appearance with an agreed cap, and every engagement starts with a written fee note so there are no surprises." },
      { id: "ad-k2", title: "Practice areas", tags: ["practice", "area", "work", "corporate", "property", "contract", "litigation", "what"], content: "The chambers handle corporate advisory, contract drafting and review, property and title work, employment matters and related litigation. We do not take criminal matters, matrimonial disputes or taxation, and will refer you to someone who does rather than take work outside our competence." },
      { id: "ad-k3", title: "What to bring to a consultation", tags: ["bring", "document", "prepare", "consultation", "first", "meeting"], content: "Bring every document you already have, even if it looks unimportant: agreements, notices, correspondence, receipts and identity proof. A short written timeline of what happened and when is more useful than anything else. Consultations run forty five minutes and can be held at the chambers or over video." },
      { id: "ad-k4", title: "Timelines and what to expect", tags: ["timeline", "how long", "duration", "court", "delay", "when"], content: "A contract review takes three to five working days. Property due diligence takes two to three weeks depending on how quickly the registrar's office responds. Litigation timelines are set by the court and are genuinely hard to predict; we give you a realistic range at the outset and update you at every hearing rather than only when asked." },
      { id: "ad-k5", title: "Working with NRI clients", tags: ["nri", "abroad", "overseas", "remote", "power of attorney", "poa"], content: "Roughly a third of the property work is for clients living abroad. Everything after the first meeting can be handled over video and email. Where your physical presence would otherwise be needed, a properly executed power of attorney, attested at the Indian consulate, usually solves it." },
      { id: "ad-k6", title: "Confidentiality", tags: ["confidential", "privacy", "privilege", "secure", "data"], content: "Anything you share in a consultation is privileged and stays within the chambers. Please do not send case papers through the enquiry form on this page, which is not a secure channel. Once you engage us, we will share a secure route for documents." },
    ],
    assistant: {
      enabled: true,
      name: "Chambers assistant",
      greeting:
        "Hello. I can explain fees, practice areas, timelines and what to bring to a consultation. I cannot give legal advice on your situation — book a consultation for that.",
      suggestions: ["What are your fees?", "What kind of matters do you take?", "What should I bring?", "How long does property due diligence take?"],
    },
    blocks: page(
      "ad",
      [
        "quickInfo",
        "services",
        "assistant",
        "grievance",
        "faq",
        "experience",
        "certifications",
        "education",
        "reviews",
        "clients",
        "downloads",
        "event",
        "jobs",
        "newsletter",
      ],
      {
        quickInfo: { title: "Chambers", subtitle: "Deccan Gymkhana, Pune", nav: "Chambers" },
        services: { title: "Engagements & fees", subtitle: "Fixed fees wherever the work allows", nav: "Fees" },
        assistant: { title: "Chambers assistant", subtitle: "General information, not legal advice" },
        grievance: { title: "Send a matter enquiry", subtitle: "First response within one working day" },
        faq: {
          title: "Questions we are asked most",
          subtitle: "",
          items: [
            { q: "Do you take criminal or matrimonial matters?", a: "No. The chambers handle corporate, contract, property and employment work. For anything outside that we will refer you to someone who does it properly." },
            { q: "Is the consultation fee adjusted if I engage you?", a: "Yes. The ₹2,500 consultation fee is set off against the first fee note if you decide to go ahead." },
            { q: "Can everything be done remotely?", a: "Largely yes. About a third of the property work is for clients abroad, handled over video with a power of attorney where physical presence is unavoidable." },
            { q: "Will you give me a fixed fee?", a: "Wherever the scope allows — drafting, reviews and due diligence are quoted as fixed fees. Litigation is billed per appearance against an agreed cap." },
          ],
        },
        experience: { title: "At the bar", subtitle: "Fourteen years of practice" },
        certifications: {
          title: "Enrolment & credentials",
          subtitle: "",
          items: [
            { name: "Advocate, enrolled", org: "Bar Council of Maharashtra & Goa", year: "2004", ref: "MAH/2481/2004" },
            { name: "Registered Trade Mark Agent", org: "Office of the CGPDTM", year: "2013", ref: "TMA-10422" },
            { name: "Certified Mediator", org: "Indian Institute of Arbitration & Mediation", year: "2018", ref: "" },
          ],
        },
        education: {
          title: "Education",
          subtitle: "",
          items: [
            { degree: "LL.M., Corporate & Commercial Law", school: "National Law School, Bengaluru", year: "2006", note: "Gold medal" },
            { degree: "LL.B.", school: "ILS Law College, Pune", year: "2004", note: "" },
            { degree: "B.Com.", school: "Fergusson College, Pune", year: "2001", note: "" },
          ],
        },
        reviews: { title: "Client feedback", subtitle: "" },
        clients: { title: "Advising", subtitle: "Companies and societies we work with" },
        downloads: {
          title: "Documents",
          subtitle: "Fee schedule and checklists",
          items: [
            { title: "Fee schedule 2026", size: "PDF · 240 KB", url: "#" },
            { title: "Property purchase — document checklist", size: "PDF · 180 KB", url: "#" },
            { title: "Employment contract — what to look for", size: "PDF · 310 KB", url: "#" },
            { title: "Engagement terms", size: "PDF · 120 KB", url: "#" },
          ],
        },
        event: { title: "Free legal clinic", subtitle: "For businesses under ten people" },
        jobs: { title: "Join the chambers", subtitle: "" },
        newsletter: { title: "Compliance reminders", subtitle: "Quarterly notes on deadlines that catch people out" },
      },
    ),
  },
};

/* ======================= registry ======================= */

const consultant: ExampleProfile = {
  id: "consultant",
  name: "Sheela Bhaskaran",
  field: "Financial consultant",
  blurb: "Services, bookings and testimonials — the profile this demo opens with.",
  highlights: ["Services", "AI assistant", "Reviews", "Numbers"],
  template: DEFAULT_SEED.template,
  content: DEFAULT_SEED.content,
};

export const EXAMPLE_PROFILES: ExampleProfile[] = [consultant, photographer, yoga, advocate];

export const exampleById = (id: string) => EXAMPLE_PROFILES.find((p) => p.id === id) ?? EXAMPLE_PROFILES[0];
