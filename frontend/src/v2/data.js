/*
 * Static copy for the v2 (minimal) site. Mirrors v1's About, Skills and
 * Experience pages and backend/lib/sarhaKnowledge.js; projects, blog posts,
 * testimonials and contact details come from the API like in v1.
 */
import { BookOpen, Code2, GraduationCap, LineChart, Orbit, School } from "lucide-react";
import {
  SiClaude,
  SiCss,
  SiCursor,
  SiExpress,
  SiGit,
  SiGithub,
  SiGooglegemini,
  SiGreensock,
  SiHtml5,
  SiJavascript,
  SiJsonwebtokens,
  SiMongodb,
  SiMongoose,
  SiNodedotjs,
  SiPostman,
  SiReact,
  SiReactrouter,
  SiSocketdotio,
  SiTailwindcss,
  SiVercel,
  SiVite,
} from "react-icons/si";
import { RiOpenaiFill } from "react-icons/ri";
import { VscVscode } from "react-icons/vsc";
import { TbApi, TbBrandFramerMotion, TbBrandMongodb } from "react-icons/tb";

export const PROFILE_IMG = "https://ik.imagekit.io/h7wep5nji/portfolio-image/Profile?updatedAt=1789225097913";
export const PROFILE_FALLBACK = "https://ik.imagekit.io/h7wep5nji/Photos/profile-png.png";
export const SITE_HOST = "mohankumardalei.apex-ui.in";
export const REPO = "https://github.com/Mohan-Kumar-Dalei/portfolio";

export const ROLES = ["MERN Stack Developer", "Technical Analyst", "Agentic AI Builder"];

export const STACK = [
  {
    title: "Languages",
    items: [
      ["JavaScript", SiJavascript],
      ["HTML", SiHtml5],
      ["CSS", SiCss],
    ],
  },
  {
    title: "Frontend",
    items: [
      ["React", SiReact],
      ["Tailwind CSS", SiTailwindcss],
      ["GSAP", SiGreensock],
      ["Framer Motion", TbBrandFramerMotion],
      ["React Router", SiReactrouter],
      ["Vite", SiVite],
    ],
  },
  {
    title: "Backend & Database",
    items: [
      ["Node.js", SiNodedotjs],
      ["Express", SiExpress],
      ["REST APIs", TbApi],
      ["JWT Auth", SiJsonwebtokens],
      ["Socket.io", SiSocketdotio],
      ["MongoDB", SiMongodb],
      ["Mongoose", SiMongoose],
      ["MongoDB Atlas", TbBrandMongodb],
    ],
  },
  {
    title: "Workflow & AI",
    items: [
      ["Claude", SiClaude],
      ["ChatGPT", RiOpenaiFill],
      ["Gemini", SiGooglegemini],
      ["Cursor", SiCursor],
      ["Antigravity", Orbit],
      ["Git", SiGit],
      ["GitHub", SiGithub],
      ["VS Code", VscVscode],
      ["Postman", SiPostman],
      ["Vercel", SiVercel],
    ],
  },
];

// Dates are "MM.YYYY" or "YYYY"; end: null means present.
export const EXPERIENCE = [
  {
    org: "Contify",
    initials: "C",
    current: true,
    positions: [
      {
        title: "Technical Analyst",
        icon: LineChart,
        type: "Full-time · Bhubaneswar",
        start: "10.2025",
        end: null,
        bullets: [
          "Analyse technical data and market-intelligence insights to support business decisions.",
          "Work with structured datasets, reports and monitoring tools every day.",
          "Collaborate across teams to improve reporting accuracy.",
        ],
        skills: ["Data Analysis", "Market Intelligence", "Reporting", "Monitoring Tools"],
      },
    ],
  },
  {
    org: "Independent · Open source",
    initials: "MK",
    current: true,
    positions: [
      {
        title: "MERN & AI Developer",
        icon: Code2,
        type: "Self-employed",
        start: "2024",
        end: null,
        bullets: [
          "Design and ship full-stack products end to end on MongoDB, Express, React and Node.",
          "Built Apex UI, a React component library with its own NPM CLI (apex-ui.in).",
          "Built AI-powered tools: the SARHA voice assistant, CosmosGen and more.",
        ],
        skills: ["React", "Node.js", "Express", "MongoDB", "Gemini", "Tailwind CSS", "GSAP"],
      },
    ],
  },
];

export const EDUCATION = [
  {
    org: "Sheryians Coding School",
    initials: "S",
    positions: [
      {
        title: "MERN with Generative AI · Job Ready Cohort",
        icon: BookOpen,
        type: "Cohort programme",
        start: "2025",
        end: "09.2025",
        bullets: [
          "Frontend and backend development, built around real projects and generative AI.",
          "Data structures and algorithms.",
          "DevOps practices: CI/CD, Docker and Kubernetes.",
        ],
        skills: ["MERN Stack", "Generative AI", "DSA", "CI/CD", "Docker", "Kubernetes"],
      },
    ],
  },
  {
    org: "Shibani Institute of Technical Education",
    initials: "SI",
    positions: [
      {
        title: "B.Tech, Computer Science & Engineering",
        icon: GraduationCap,
        type: "Bachelor's degree · CGPA 7.5",
        start: "2020",
        end: "2024",
        bullets: [
          "Built a foundation in data structures, algorithms and web development.",
          "Picked up the MERN stack through projects and certifications.",
        ],
        skills: ["DSA", "Web Development", "MERN Stack"],
      },
    ],
  },
  {
    org: "Ganesh Institute of Engineering & Technology",
    initials: "G",
    positions: [
      {
        title: "Higher Secondary, Science (+2)",
        icon: School,
        type: "Higher secondary · Bhubaneswar",
        start: "2018",
        end: "2020",
        bullets: ["+2 Science in Bhubaneswar, where the curiosity about how software works first started."],
        skills: ["Mathematics", "Physics", "Computer Science"],
      },
    ],
  },
];

export const CERTIFICATIONS = [
  {
    title: "MERN with Generative AI",
    org: "Sheryians Coding School",
    date: "Sep 2025",
    url: "https://drive.google.com/file/d/10ZYIshb8_TBpdy8YQl_En5nHRL4fe4XB/view",
  },
  {
    title: "Front-End Development",
    org: "Lakshya Institute of Technology",
    date: "Mar 2024",
    url: "https://drive.google.com/file/d/1y7SUN-vpiQ1epYtN-O6Xiz6ANHu-0ysh/view",
  },
];

export const ACHIEVEMENTS = [
  "Published Apex UI, a React component library with its own NPM CLI (apex-ui.in)",
  "Completed the Sheryians Job Ready Cohort (MERN with Generative AI)",
  "Won Kabaddi at the Initiative for Moral and Cultural Training Foundation, Odisha",
  "Completed a 30 km mini-marathon, start to finish",
];

// Section anchors on the v2 home page (header, command menu, version switch).
export const SECTIONS = [
  ["about", "About"],
  ["stack", "Stack"],
  ["experience", "Experience"],
  ["projects", "Projects"],
  ["education", "Education"],
  ["certifications", "Certifications"],
  ["blog", "Blog"],
  ["contact", "Contact"],
];
