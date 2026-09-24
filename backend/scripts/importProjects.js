/*
 * Replace the seeded demo projects with Mohan's real projects.
 *
 *   node scripts/importProjects.js           # dry run: shows what would change
 *   node scripts/importProjects.js --apply   # writes to the database in .env
 *
 * Projects are upserted by title, so running it twice is safe. The four demo
 * projects from seed.js are removed. Images are live screenshots generated from
 * each demo URL — swap them for real screenshots from the admin dashboard.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Project = require("../models/Project");

const GH = "https://github.com/Mohan-Kumar-Dalei";
const shot = (url) => `https://s0.wp.com/mshots/v1/${encodeURIComponent(url)}?w=1400&h=1050`;

// Seeded demo projects, plus ApexConnect whose source no longer exists.
const DEMO_TITLES = ["NexCommerce", "Synapse AI", "Pulse Analytics", "DevFlow API", "ApexConnect"];

// Built / shipped dates (LinkedIn posts, GitHub activity). They drive the
// "Newest" sort and the year on detail pages; `order` follows the same order.
const DATES = {
  "AI Exam Coach": "2026-09-20",
  "CosmosGen": "2026-09-01",
  "SARHA": "2026-05-24",
  "XPath Finder PRO": "2026-05-20",
  "Apex UI": "2025-09-20",
  "Apex AI Agent": "2025-09-10",
  "AI Caption Generator": "2025-09-05",
  "ApexOS": "2025-07-05"
};

const projects = [
  {
    title: "AI Exam Coach",
    subtitle: "Gov-exam preparation with AI",
    description:
      "Upload a single recruitment notification PDF and it builds the whole preparation system: extracted syllabus, AI lessons, adaptive quizzes, full CBT mock tests, a 60-day roadmap and an AI mentor that answers from your own performance data.",
    features: ["Syllabus extracted from the notification PDF", "AI lessons and adaptive quizzes", "Full CBT mock tests", "60-day roadmap and analytics", "AI mentor grounded in your results"],
    techStack: ["React", "Vite", "Tailwind CSS", "Node.js", "Express", "MongoDB", "Gemini", "JWT", "Multer", "pdf-parse"],
    image: "https://ik.imagekit.io/ny6yinyut/apex_connect_avatars/ai-coach.png?updatedAt=1790275505607",
    liveLink: "https://gov-exam-prepare.onrender.com/",
    githubLink: `${GH}/Gov-Exam-Prepare`,
    category: "AI / Full Stack",
    featured: true,
  },
  {
    title: "SARHA",
    subtitle: "Web-based AI voice assistant",
    description:
      "A full-stack intelligent assistant that combines AI conversation, voice interaction and system automation in one platform. Talk to it, hear it answer, and let it open apps or search the web for you.",
    features: [
      "Natural conversations with Gemini",
      "Human-like voice output and real-time speech recognition",
      "Web automation for YouTube and Spotify searches",
      "System automation: launch apps, shutdown commands",
      "Hybrid cloud / Local Mode deployment",
    ],
    techStack: ["React", "Vite", "Tailwind CSS", "Node.js", "Express", "MongoDB Atlas", "Gemini API", "OpenAI TTS", "Web Speech API", "Puppeteer"],
    liveLink: "",
    githubLink: `${GH}/sarha-ai-assistant`,
    image: "https://ik.imagekit.io/ny6yinyut/apex_connect_avatars/sarha.png?updatedAt=1790194357838",
    challenges: "Cloud hosts block access to the user's own machine, so system-level commands can't run from a deployed server.",
    solutions: "A hybrid Local Mode: the same app runs locally when system automation is needed, and in the cloud for everything else, with a fallback that keeps voice working either way.",
    category: "AI / Full Stack",
    featured: true,
  },
  {
    title: "Apex UI",
    subtitle: "React component library + NPM CLI",
    description:
      "A modern UI component library built on React and Tailwind CSS, with a custom Node.js CLI for installation and setup: reusable, responsive buttons, cards, animations and typography effects that let developers build interfaces with minimal code.",
    features: ["Reusable, responsive components", "Animation & typography effects", "Custom NPM CLI installer", "Documentation site"],
    techStack: ["React", "Tailwind CSS", "Node.js", "NPM CLI"],
    liveLink: "https://apex-ui.in",
    githubLink: `${GH}/ApexUI`,
    image: "https://ik.imagekit.io/ny6yinyut/apex_connect_avatars/df3e6087-f830-4725-9d34-bf04290bc82e_DIr3U2XTw?updatedAt=1759416901343",
    category: "Open Source",
    featured: true,
  },
  {
    title: "Apex AI Agent",
    subtitle: "Full-stack AI assistant with memory",
    description:
      "An AI-powered assistant with real-time chat, context-aware conversations, semantic search and long-term memory backed by a vector database.",
    features: ["Real-time chat", "Context-aware conversations", "Semantic search", "Long-term memory with a vector DB", "Secure authentication"],
    techStack: ["React", "Vite", "Node.js", "Express", "MongoDB", "Vector DB", "Socket.io", "JWT", "Gemini API"],
    liveLink: "https://apex-agent.netlify.app",
    githubLink: `${GH}/ApexAI_Frontend`,
    image: "https://ik.imagekit.io/ny6yinyut/apex_connect_avatars/8e2bf8ef-e855-4859-970b-8f046bd35e22_0ZTYJjYRml?updatedAt=1759394933988",
    category: "AI / Full Stack",
    featured: true,
  },
  {
    title: "XPath Finder PRO",
    subtitle: "AI-powered scraping selector tool",
    description:
      "Cuts the hours spent inspecting elements and hand-writing XPaths. Point at an element and Gemini generates resilient, context-aware selectors, with a live DOM tree kept in sync with the page.",
    features: ["AI-generated, resilient XPaths", "Precision element inspector", "Page and DOM tree stay in sync both ways", "Multi-select for scraping arrays"],
    techStack: ["React", "Vite", "Tailwind CSS", "Node.js", "Express", "Puppeteer", "Cheerio", "Gemini API"],
    liveLink: "",
    githubLink: `${GH}/xpath-finder`,
    image: "https://ik.imagekit.io/ny6yinyut/apex_connect_avatars/xpath-finder-pro.png?updatedAt=1790194250938",
    category: "AI / Tools",
    featured: true,
  },
  {
    title: "AI Caption Generator",
    subtitle: "Image-to-caption web app",
    description:
      "Upload a picture and get an insightful caption back. A React front end talks to a Node.js server that runs the image through an AI model, built to speed up content creation and improve accessibility.",
    features: ["Image upload", "AI-generated captions", "Animated React interface"],
    techStack: ["React", "Tailwind CSS", "GSAP", "Node.js", "Express", "MongoDB", "Gemini API"],
    liveLink: "https://ai-powered-captioner-frontend.vercel.app",
    githubLink: `${GH}/AI-Powered-Captioner-Frontend`,
    category: "AI / Full Stack",
    featured: true,
  },
  {
    title: "CosmosGen",
    subtitle: "Home repair services with an AI assistant",
    description:
      "A WhatsApp-first home-services platform for Bhubaneswar. An AI assistant books repairs over WhatsApp, customers follow their jobs on the web and in a mobile app, and admins and technicians run everything from their own live panels.",
    features: [
      "WhatsApp AI booking assistant (WhatsApp Cloud API + Gemini)",
      "Customer website and customer mobile app",
      "Admin and technician panels with live job tracking",
      "Google Maps location and technician routing",
      "Online payments with Razorpay",
      "Real-time updates over Socket.io, push notifications",
    ],
    techStack: ["React", "Vite", "Tailwind CSS", "GSAP", "Node.js", "Express", "MongoDB", "Redis", "Socket.io", "WhatsApp Cloud API", "Gemini", "Pinecone", "Google Maps", "Razorpay", "ImageKit", "React Native", "Expo", "Sentry"],
    liveLink: "",
    githubLink: "",
    image: "https://ik.imagekit.io/ny6yinyut/apex_connect_avatars/cosmosgen.png?updatedAt=1790196460686",
    category: "AI / Full Stack",
    featured: true,
  },
  {
    title: "ApexOS",
    subtitle: "An operating system in the browser",
    description:
      "A playful, interactive web-based OS. A desktop with apps, draggable windows and interactive elements that runs entirely in the browser.",
    features: ["Desktop with apps", "Window management", "Interactive UI"],
    techStack: ["HTML", "Tailwind CSS", "JavaScript"],
    liveLink: "",
    githubLink: `${GH}/ApexOS`,
    image: "https://ik.imagekit.io/ny6yinyut/apex_connect_avatars/apex-os.png?updatedAt=1790196357229",
    category: "Frontend",
    featured: false,
  },
]
  .map((p) => ({ ...p, createdAt: new Date(DATES[p.title] || Date.now()) }))
  .sort((a, b) => b.createdAt - a.createdAt)
  .map((p, i) => ({ ...p, order: i + 1, image: p.image || (p.liveLink ? shot(p.liveLink) : "") }));

const run = async () => {
  const apply = process.argv.includes("--apply");
  await connectDB();

  const demos = await Project.find({ title: { $in: DEMO_TITLES } }).select("title");
  console.log(`Demo projects to remove: ${demos.map((d) => d.title).join(", ") || "none"}`);
  for (const p of projects) {
    const exists = await Project.exists({ title: p.title });
    console.log(`${exists ? "update" : "create"}: ${p.title}`);
  }

  if (!apply) {
    console.log("\nDry run — nothing written. Re-run with --apply to save.");
  } else {
    await Project.deleteMany({ title: { $in: DEMO_TITLES } });
    for (const p of projects) {
      // raw collection: Mongoose treats createdAt as immutable on updates
      await Project.collection.updateOne({ title: p.title }, { $set: { ...p, updatedAt: new Date() } }, { upsert: true });
    }
    console.log(`\nSaved ${projects.length} projects.`);
  }
  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
