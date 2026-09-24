import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SectionHead, EASE_OUT } from "../editorial";

const cosmos = {
  name: "CosmosGen",
  tag: "Home repair service · AI",
  desc: "A WhatsApp-first home-services platform for Bhubaneswar. An AI assistant books repairs right inside WhatsApp, customers follow every job on the web and in their mobile app, and admins and technicians run the day from live panels.",
  points: ["WhatsApp AI booking assistant", "Customer website + customer mobile app", "Admin & technician panels", "Live tracking on Google Maps", "Razorpay payments", "Real-time updates & push alerts"],
  stack: ["React", "Node.js", "Express", "MongoDB", "Redis", "Socket.io", "WhatsApp Cloud API", "Gemini", "Pinecone", "Google Maps", "Razorpay", "React Native", "Expo"],
};

const coach = {
  name: "AI Exam Coach",
  tag: "Gov-exam preparation · AI",
  desc: "Upload a single recruitment notification PDF and it builds the whole preparation system: extracted syllabus, AI lessons, adaptive quizzes, full CBT mock tests, a 60-day roadmap and an AI mentor that answers from your own performance data.",
  points: ["Syllabus from the notification PDF", "AI lessons & adaptive quizzes", "Full CBT mock tests", "60-day roadmap + analytics"],
  stack: ["React", "Node.js", "Express", "MongoDB", "Gemini", "JWT"],
  github: "https://github.com/Mohan-Kumar-Dalei/Gov-Exam-Prepare",
  live: "https://gov-exam-prepare.onrender.com/",
};

// A booking, told as a WhatsApp chat. Plays on a loop.
const chat = [
  { from: "user", text: "Hi, my AC isn't cooling 😓" },
  { from: "bot", text: "Sorry about that! I can book a technician for you. Which area are you in?" },
  { from: "user", text: "Patia, Bhubaneswar" },
  { from: "bot", text: "Done ✅ Ravi (AC expert) is booked for tomorrow, 10 AM." },
  { from: "track" },
];

const floaters = [
  { label: "Redis", className: "left-[4%] top-[18%]", d: 0 },
  { label: "Google Maps", className: "right-[2%] top-[8%]", d: 1.2 },
  { label: "Socket.io", className: "left-[0%] bottom-[16%]", d: 0.6 },
  { label: "Gemini", className: "right-[6%] bottom-[10%]", d: 1.8 },
];

const WhatsAppDemo = () => {
  const [step, setStep] = useState(0);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    let t;
    if (step < chat.length) {
      // the bot "types" before it answers
      if (chat[step].from !== "user") {
        setTyping(true);
        t = setTimeout(() => {
          setTyping(false);
          setStep((s) => s + 1);
        }, 1300);
      } else {
        t = setTimeout(() => setStep((s) => s + 1), 1100);
      }
    } else {
      t = setTimeout(() => setStep(0), 3200);
    }
    return () => clearTimeout(t);
  }, [step]);

  return (
    <div className="relative mx-auto w-full max-w-[22rem]">
      {floaters.map((f) => (
        <motion.span
          key={f.label}
          className={`absolute z-20 hidden sm:inline-flex rounded-full chip-accent bg-surface px-3 py-1 font-mono text-[0.6875rem] shadow-lg ${f.className}`}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3.2, delay: f.d, repeat: Infinity, ease: "easeInOut" }}
        >
          {f.label}
        </motion.span>
      ))}

      {/* phone */}
      <div className="relative mx-auto w-[17.5rem] rounded-[2.2rem] border border-strong bg-base p-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)]">
        <div className="overflow-hidden rounded-[1.8rem] bg-[#0b141a]">
          <div className="flex items-center gap-3 bg-[#1f2c33] px-4 py-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-grad text-xs font-bold text-white">CG</span>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-white">CosmosGen Assistant</div>
              <div className="text-[0.6875rem] text-[#8696a0]">{typing ? "typing…" : "online"}</div>
            </div>
          </div>

          <div className="flex h-[19rem] flex-col justify-end gap-2 bg-[#0b141a] px-3 py-3">
            <AnimatePresence initial={false}>
              {chat.slice(0, step).map((m, i) =>
                m.from === "track" ? (
                  <motion.div
                    key={`track-${i}`}
                    initial={{ opacity: 0, y: 14, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="self-start w-[85%] overflow-hidden rounded-xl bg-[#1f2c33]"
                  >
                    <div className="relative h-16 bg-[#233138]">
                      <svg viewBox="0 0 200 64" className="absolute inset-0 h-full w-full opacity-70">
                        <path d="M10 50 C 60 10, 110 60, 190 14" stroke="#8b5cf6" strokeWidth="3" fill="none" strokeDasharray="6 6" />
                      </svg>
                      <span className="absolute right-4 top-2 h-3 w-3 rounded-full bg-[#8b5cf6]">
                        <span className="absolute inset-0 animate-ping rounded-full bg-[#8b5cf6]" />
                      </span>
                    </div>
                    <div className="px-3 py-2 text-[0.75rem] text-white">📍 Ravi is on the way · 12 min</div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={`${m.from}-${i}`}
                    initial={{ opacity: 0, y: 14, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className={`max-w-[82%] rounded-xl px-3 py-2 text-[0.8125rem] leading-snug text-white ${
                      m.from === "user" ? "self-end rounded-br-sm bg-[#005c4b]" : "self-start rounded-bl-sm bg-[#1f2c33]"
                    }`}
                  >
                    {m.text}
                  </motion.div>
                )
              )}
              {typing && (
                <motion.div
                  key="typing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="self-start flex gap-1 rounded-xl rounded-bl-sm bg-[#1f2c33] px-3 py-3"
                >
                  {[0, 1, 2].map((d) => (
                    <motion.span
                      key={d}
                      className="h-1.5 w-1.5 rounded-full bg-[#8696a0]"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

const Chips = ({ items }) => (
  <div className="flex flex-wrap gap-2">
    {items.map((t) => (
      <span key={t} className="rounded-full border border-border px-3 py-1 font-mono text-[0.6875rem] text-ink-muted">
        {t}
      </span>
    ))}
  </div>
);

/** Projects still in active development. CosmosGen gets the spotlight card. */
const NowBuilding = () => (
  <section id="now-building" className="relative py-24 md:py-32" data-testid="now-building-section">
    <div className="wrap">
      <SectionHead
        index="✳"
        label="Now building"
        right="In progress"
        title={<>On the <span className="text-gradient">workbench.</span></>}
        intro="What I'm building right now. Both are in active development."
      />

      {/* CosmosGen: spinning gradient border + live WhatsApp demo */}
      <motion.article
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 1, ease: EASE_OUT }}
        className="relative mt-14 md:mt-20 overflow-hidden rounded-[2rem] p-[1.5px]"
      >
        <div aria-hidden className="cosmos-spin absolute left-1/2 top-1/2 aspect-square w-[160%] -translate-x-1/2 -translate-y-1/2" />
        <div className="relative grid lg:grid-cols-2 gap-10 overflow-hidden rounded-[calc(2rem-1.5px)] bg-surface p-7 md:p-12">
          <div aria-hidden className="glow-blob w-[34rem] h-[34rem] -left-40 -bottom-48 opacity-40" />
          <div className="relative flex flex-col">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full chip-accent px-3 py-1 label">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> In progress
              </span>
              <span className="rounded-full bg-grad px-3 py-1 label text-white">Featured build</span>
            </div>
            <div className="mt-3 label text-ink-muted">{cosmos.tag}</div>
            <h3 className="mt-8 title-xl text-[clamp(1.4rem,3.4cqi,4.25rem)]">{cosmos.name}</h3>
            <p className="mt-5 text-ink-muted text-lg leading-relaxed">{cosmos.desc}</p>
            <ul className="mt-8 grid sm:grid-cols-2 gap-x-6 gap-y-2">
              {cosmos.points.map((p) => (
                <li key={p} className="flex gap-3">
                  <span className="text-primary">+</span>
                  {p}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-10">
              <Chips items={cosmos.stack} />
            </div>
          </div>
          <div className="relative flex items-center justify-center py-6">
            <WhatsAppDemo />
          </div>
        </div>
      </motion.article>

      {/* AI Exam Coach */}
      <motion.article
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.9, delay: 0.1, ease: EASE_OUT }}
        className="group relative mt-5 overflow-hidden rounded-[1.75rem] border border-border bg-surface p-7 md:p-12 grid lg:grid-cols-12 gap-8"
      >
        <div aria-hidden className="glow-blob w-[26rem] h-[26rem] -right-24 -top-32 opacity-35 transition-opacity duration-700 group-hover:opacity-60" />
        <div className="relative lg:col-span-7">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full chip-accent px-3 py-1 label">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live beta
            </span>
            <span className="label text-ink-muted">{coach.tag}</span>
          </div>
          <h3 className="mt-8 title-xl text-[clamp(1.8rem,4cqi,4.5rem)]">{coach.name}</h3>
          <p className="mt-5 text-ink-muted text-lg leading-relaxed">{coach.desc}</p>
        </div>
        <div className="relative lg:col-span-5 flex flex-col justify-between gap-8">
          <ul className="grid gap-2">
            {coach.points.map((p) => (
              <li key={p} className="flex gap-3">
                <span className="text-primary">+</span>
                {p}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Chips items={coach.stack} />
            <div className="flex flex-wrap gap-3">
              <a
                href={coach.live}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-grad px-5 py-2.5 text-sm font-semibold text-white"
                data-testid="coach-live"
              >
                Live demo <ArrowUpRight size={15} />
              </a>
              <a
                href={coach.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:border-primary hover:text-primary transition-colors duration-200"
              >
                GitHub <ArrowUpRight size={15} />
              </a>
            </div>
          </div>
        </div>
      </motion.article>
    </div>
  </section>
);

export default NowBuilding;
