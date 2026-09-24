const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Project = require("./models/Project");
const Testimonial = require("./models/Testimonial");
const Blog = require("./models/Blog");
const Setting = require("./models/Setting");
const { seedBlogs } = require("./seedBlogs");

const sampleProjects = [
  {
    title: "NexCommerce",
    subtitle: "AI-Powered Commerce Platform",
    description:
      "A full-stack MERN e-commerce platform with an agentic AI shopping assistant, real-time inventory, Stripe payments, and an analytics dashboard.",
    image:
      "https://images.unsplash.com/photo-1642132652860-471b4228023e?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400",
    features: ["Agentic AI assistant", "Stripe checkout", "Realtime inventory", "Admin analytics"],
    techStack: ["React", "Node.js", "Express", "MongoDB", "Tailwind", "GSAP"],
    githubLink: "https://github.com/Mohan-Kumar-Dalei",
    liveLink: "#",
    category: "Full Stack",
    featured: true,
    order: 1,
  },
  {
    title: "Synapse AI",
    subtitle: "Agentic Workflow Automation",
    description:
      "A workflow automation studio where users compose autonomous AI agents that chain tasks, call tools, and reason over data using a visual node editor.",
    image:
      "https://images.unsplash.com/photo-1642132652866-6fa262d3161f?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400",
    features: ["Visual agent builder", "Tool calling", "Vector memory", "Live execution logs"],
    techStack: ["React", "Express", "MongoDB", "Framer Motion", "Node.js"],
    githubLink: "https://github.com/Mohan-Kumar-Dalei",
    liveLink: "#",
    category: "AI / Full Stack",
    featured: true,
    order: 2,
  },
  {
    title: "Pulse Analytics",
    subtitle: "Realtime SaaS Dashboard",
    description:
      "A performant analytics dashboard streaming realtime metrics via websockets with beautiful data visualisations and a JWT-secured admin layer.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400",
    features: ["Realtime charts", "JWT auth", "Role based access", "Export reports"],
    techStack: ["React", "Node.js", "MongoDB", "Recharts", "Tailwind"],
    githubLink: "https://github.com/Mohan-Kumar-Dalei",
    liveLink: "#",
    category: "Full Stack",
    featured: true,
    order: 3,
  },
  {
    title: "DevFlow API",
    subtitle: "Scalable REST + GraphQL Backend",
    description:
      "A production-grade backend service with layered architecture, rate limiting, caching, and comprehensive API documentation for developer tools.",
    image:
      "https://images.unsplash.com/photo-1629654297299-c8506221ca97?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400",
    features: ["REST + GraphQL", "Redis caching", "Rate limiting", "OpenAPI docs"],
    techStack: ["Node.js", "Express", "MongoDB", "Redis"],
    githubLink: "https://github.com/Mohan-Kumar-Dalei",
    liveLink: "#",
    category: "Backend",
    featured: true,
    order: 4,
  },
];

const sampleTestimonials = [
  {
    name: "Aarav Sharma",
    role: "Engineering Lead",
    company: "Fintech Labs",
    quote:
      "Mohan ships fast without cutting corners. His MERN architecture decisions saved us weeks and the UI polish was genuinely Awwwards-level.",
    rating: 5,
    order: 1,
    avatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    name: "Sofia Martinez",
    role: "Product Manager",
    company: "Nimbus AI",
    quote:
      "The agentic AI features Mohan built into our platform felt like magic to users. Thoughtful, reliable, and beautifully engineered.",
    rating: 5,
    order: 2,
    avatar: "https://i.pravatar.cc/150?img=45",
  },
  {
    name: "Rohan Verma",
    role: "Founder",
    company: "StackForge",
    quote:
      "Rare to find a developer who is equally strong on backend systems and front-end craft. Mohan is that developer.",
    rating: 5,
    order: 3,
    avatar: "https://i.pravatar.cc/150?img=33",
  },
];

const seed = async () => {
  const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || "";
  const adminName = process.env.ADMIN_NAME || "Admin";

  // No built-in fallback credentials: a deploy that forgets these variables
  // must not end up with a guessable admin login.
  const existing = adminEmail && adminPassword ? await User.findOne({ email: adminEmail }) : null;
  if (!adminEmail || !adminPassword) {
    console.warn("[seed] ADMIN_EMAIL / ADMIN_PASSWORD not set; admin account left unchanged");
  } else if (!existing) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await User.create({ email: adminEmail, passwordHash, name: adminName, role: "admin" });
    console.log(`[seed] Admin created: ${adminEmail}`);
  } else {
    const matches = await bcrypt.compare(adminPassword, existing.passwordHash);
    if (!matches) {
      existing.passwordHash = await bcrypt.hash(adminPassword, 10);
      existing.name = adminName;
      await existing.save();
      console.log(`[seed] Admin password synced: ${adminEmail}`);
    }
  }

  if ((await Project.countDocuments()) === 0) {
    await Project.insertMany(sampleProjects);
    console.log(`[seed] Inserted ${sampleProjects.length} sample projects`);
  }
  if ((await Testimonial.countDocuments()) === 0) {
    await Testimonial.insertMany(sampleTestimonials);
    console.log(`[seed] Inserted ${sampleTestimonials.length} sample testimonials`);
  }

  await seedBlogs(Blog);

  const setting = await Setting.findOne({ key: "site" });
  if (!setting) {
    await Setting.create({
      key: "site",
      resumeUrl: "https://drive.google.com/file/d/1qUC0CfV-ffjjI5_NvDUPUYjpfb8jAdv7/view?usp=drive_link",
      availability: "Available for work — 2026",
      availabilityOpen: true,
      location: "India — Remote",
      email: "mohankumardalei2001@gmail.com",
      github: "https://github.com/Mohan-Kumar-Dalei",
      linkedin: "https://www.linkedin.com/in/mohan-kumar-dalei",
    });
    console.log("[seed] Created site settings");
  }
};

module.exports = seed;
