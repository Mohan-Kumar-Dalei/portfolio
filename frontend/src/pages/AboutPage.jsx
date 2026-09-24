import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import PageTransition from "../components/PageTransition";
import PageHeader from "../components/PageHeader";
import About from "../components/sections/About";
import Skills from "../components/sections/Skills";
import Experience from "../components/sections/Experience";
import Stats from "../components/sections/Stats";
import CTA from "../components/sections/CTA";
import { SectionHead, EASE_OUT } from "../components/editorial";

const philosophy = [
  { title: "Clarity first", desc: "Simple, honest solutions over clever complexity. The best code reads like prose." },
  { title: "Craft & speed", desc: "Ship fast, but never at the cost of the details that make products feel premium." },
  { title: "User empathy", desc: "Every decision starts with the human on the other side of the screen." },
  { title: "Outcome driven", desc: "I care about impact and results, not just lines of code." },
];

const AboutPage = () => {
  return (
    <PageTransition>
      <Helmet>
        <title>About | Mohan Kumar Dalei</title>
        <meta name="description" content="The story, journey, philosophy and skills of Mohan Kumar Dalei, MERN stack developer and technical analyst." />
      </Helmet>

      <PageHeader
        index="/ about"
        eyebrow="Who I am"
        title={<>The story behind <span className="text-gradient">the code.</span></>}
        subtitle="Developer, analyst and lifelong learner obsessed with building premium digital experiences."
      />

      <About />

      <section className="relative py-24 md:py-36" data-testid="philosophy-section">
        <div className="wrap">
          <SectionHead index="✳" label="Philosophy" title={<>Values I <span className="text-gradient">work by.</span></>} />
          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {philosophy.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.9, delay: i * 0.08, ease: EASE_OUT }}
                className="group relative overflow-hidden rounded-[1.5rem] border border-border bg-surface p-7 min-h-[20rem] flex flex-col justify-between"
              >
                <span aria-hidden className="absolute inset-0 bg-grad opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                <span className="relative title-xl text-outline text-7xl transition-colors duration-500 group-hover:text-white group-hover:[filter:none]">0{i + 1}</span>
                <div className="relative">
                  <h3 className="title-xl text-[clamp(1.1rem,1.5cqi,1.9rem)] group-hover:text-white transition-colors duration-500">{p.title}</h3>
                  <p className="mt-3 text-ink-muted leading-relaxed group-hover:text-white/85 transition-colors duration-500">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Skills />
      <Experience />
      <Stats />
      <CTA />
    </PageTransition>
  );
};

export default AboutPage;
