import { useState } from "react";
import { motion } from "framer-motion";
import { SectionLabel, ScrubWords, RevealImage, EASE_OUT } from "../editorial";

const ABOUT_IMG = "https://ik.imagekit.io/h7wep5nji/portfolio-image/Profile?updatedAt=1789225097913";
const FALLBACK_IMG = "https://ik.imagekit.io/h7wep5nji/Photos/profile-png.png";

const facts = [
  { k: "Now", v: "Technical Analyst at Contify" },
  { k: "Education", v: "B.Tech CSE · 2024 · CGPA 7.5" },
  { k: "Stack", v: "MongoDB · Express · React · Node" },
  { k: "Location", v: "Bhubaneswar, Odisha" },
];

const About = () => {
  const [img, setImg] = useState(ABOUT_IMG);

  return (
    <section id="about" className="relative py-24 md:py-36" data-testid="about-section">
      <div className="wrap">
        <SectionLabel index="01" right="Who I am">About</SectionLabel>

        <div className="mt-12 md:mt-16 grid grid-cols-12 gap-x-6 gap-y-12">
          {/* Portrait column */}
          <div className="col-span-12 md:col-span-5 lg:col-span-4">
            <RevealImage
              src={img}
              alt="Mohan Kumar Dalei"
              onError={() => img !== FALLBACK_IMG && setImg(FALLBACK_IMG)}
              className={`aspect-[4/5] rounded-[1.5rem] ${img === FALLBACK_IMG ? "bg-grad" : "bg-surface"}`}
              imgClassName={img === FALLBACK_IMG ? "object-contain object-bottom" : ""}
            />
            <div className="mt-3 flex justify-between label text-ink-muted">
              <span>Fig. 02 · Portrait</span>
              <span>Odisha</span>
            </div>
          </div>

          {/* Statement column */}
          <div className="col-span-12 md:col-span-7 lg:col-span-7 lg:col-start-6">
            <ScrubWords className="font-display text-[clamp(1.75rem,3.4vw,3.4rem)] font-semibold leading-[1.1] tracking-[-0.035em]">
              I&apos;m Mohan, a B.Tech CSE graduate and MERN stack developer from Odisha who builds things that
              feel fast, thoughtful and premium. By day I&apos;m a technical analyst; the rest of the time I ship
              full-stack products powered by AI.
            </ScrubWords>

            <div className="mt-12 grid sm:grid-cols-2 gap-8 text-ink-muted leading-relaxed">
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: EASE_OUT }}>
                I learned the craft through internships, certifications and a lot of personal projects, from ApexOS,
                a desktop that runs in the browser, to Apex UI, a React component library with its own NPM CLI.
                Today I build on React, Node.js, Express and MongoDB.
              </motion.p>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.1, ease: EASE_OUT }}>
                Lately it&apos;s AI: Gemini-powered assistants, voice interfaces, scraping tools and, right now, an
                exam-preparation coach. I use AI to do the heavy lifting while keeping full control over the
                architecture, the data and the details.
              </motion.p>
            </div>

            <dl className="mt-12 border-t border-border">
              {facts.map((f, i) => (
                <motion.div
                  key={f.k}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.06, ease: EASE_OUT }}
                  className="grid grid-cols-12 gap-4 border-b border-border py-4"
                >
                  <dt className="col-span-4 label text-ink-muted pt-1">{f.k}</dt>
                  <dd className="col-span-8 text-lg font-medium tracking-[-0.02em]">{f.v}</dd>
                </motion.div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
