const blogs = [
  {
    title: "Building Agentic AI Systems with the MERN Stack",
    slug: "building-agentic-ai-mern",
    excerpt:
      "How I architect autonomous AI agents on top of a React, Node and MongoDB foundation — from tool-calling to persistent memory.",
    coverImage:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400",
    category: "AI",
    tags: ["Agentic AI", "MERN", "Architecture"],
    featured: true,
    content: `## Why agentic systems

Agentic AI moves beyond single prompt-response calls. An agent can **reason**, **plan**, and **act** using tools.

### The core loop

1. Perceive the goal
2. Plan a sequence of steps
3. Call tools (APIs, DB, search)
4. Reflect and iterate

\`\`\`js
async function runAgent(goal) {
  let state = { goal, steps: [] };
  while (!state.done) {
    const action = await planNextAction(state);
    const result = await executeTool(action);
    state = reduce(state, action, result);
  }
  return state.answer;
}
\`\`\`

### Persistence with MongoDB

I store agent memory as embeddings + structured logs, which makes runs debuggable and resumable.

> Great agents are observable agents.

The MERN stack gives me a fast iteration loop: React for the control panel, Express for orchestration, MongoDB for memory.`,
  },
  {
    title: "Designing Premium UI with GSAP and Lenis",
    slug: "premium-ui-gsap-lenis",
    excerpt:
      "The animation techniques behind award-winning feel — smooth scrolling, scroll-triggered reveals and magnetic interactions.",
    coverImage:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400",
    category: "Frontend",
    tags: ["GSAP", "Lenis", "Animation", "UX"],
    featured: true,
    content: `## Motion is the message

The difference between a good site and an award-winning one is **motion craft**.

### Smooth scroll with Lenis

\`\`\`js
const lenis = new Lenis({ duration: 1.2 });
function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
\`\`\`

### Scroll-triggered reveals

GSAP ScrollTrigger lets content enter with intention — staggered, eased, and pinned.

- Reveal on enter
- Pin for storytelling
- Scrub for scroll-controlled motion

Keep it subtle. Premium motion is felt, not noticed.`,
  },
  {
    title: "Structuring a Scalable Express API",
    slug: "scalable-express-api",
    excerpt:
      "A pragmatic folder structure and patterns for Express + MongoDB APIs that stay clean as they grow.",
    coverImage:
      "https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400",
    category: "Backend",
    tags: ["Express", "Node.js", "MongoDB", "Architecture"],
    featured: false,
    content: `## Layers, not spaghetti

A clean Express app separates concerns:

\`\`\`
routes/       -> HTTP surface
controllers/  -> request handling
models/       -> data schemas
middleware/   -> auth, validation
config/       -> db, env
\`\`\`

### Middleware for auth

\`\`\`js
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  req.user = jwt.verify(token, process.env.JWT_SECRET);
  next();
};
\`\`\`

This structure has carried projects from prototype to production without a rewrite.`,
  },
];

const seedBlogs = async (Blog) => {
  if ((await Blog.countDocuments()) > 0) return;
  const withRT = blogs.map((b) => ({
    ...b,
    readingTime: Math.max(1, Math.round(b.content.split(/\s+/).length / 200)),
  }));
  await Blog.insertMany(withRT);
  console.log(`[seed] Inserted ${withRT.length} blogs`);
};

module.exports = { seedBlogs };
