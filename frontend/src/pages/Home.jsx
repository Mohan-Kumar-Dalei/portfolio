import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PageTransition from "../components/PageTransition";
import { useSite } from "../context/SiteContext";
import Hero from "../components/sections/Hero";
import Marquee from "../components/sections/Marquee";
import About from "../components/sections/About";
import Skills from "../components/sections/Skills";
import HorizontalProjects from "../components/sections/HorizontalProjects";
import NowBuilding from "../components/sections/NowBuilding";
import Services from "../components/sections/Services";
import Experience from "../components/sections/Experience";
import Stats from "../components/sections/Stats";
import BlogPreview from "../components/sections/BlogPreview";
import Testimonials from "../components/sections/Testimonials";
import CTA from "../components/sections/CTA";

const Home = () => {
  const { projects, testimonials, blogs } = useSite();
  const featured = projects.filter((p) => p.featured).slice(0, 6);

  // Sections that depend on API data mount late; re-measure every pin/trigger.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(id);
  }, [projects.length, blogs.length, testimonials.length]);

  return (
    <PageTransition>
      <Helmet>
        <title>Mohan Kumar Dalei | MERN Stack Developer & Technical Analyst</title>
        <meta name="description" content="Premium MERN stack developer specialising in Agentic AI. Explore selected work, skills, writing and experience." />
      </Helmet>

      <Hero />
      <Marquee />
      <About />
      <Skills />
      <HorizontalProjects projects={featured.length ? featured : projects} />
      <NowBuilding />
      <Services />
      <Experience />
      <Stats />
      <BlogPreview blogs={blogs} />
      <Testimonials testimonials={testimonials} />
      <CTA />
    </PageTransition>
  );
};

export default Home;
