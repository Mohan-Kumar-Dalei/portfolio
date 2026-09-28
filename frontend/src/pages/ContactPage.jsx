import { Helmet } from "react-helmet-async";
import { pageTitle } from "../seo";
import PageTransition from "../components/PageTransition";
import PageHeader from "../components/PageHeader";
import Contact from "../components/sections/Contact";
import { useSite } from "../context/SiteContext";
import { LINKS } from "../utils/links";
import { fileUrl } from "../lib/api";

const ContactPage = () => {
  const { settings } = useSite();
  const resume = fileUrl(settings?.resumeUrl) || LINKS.resume;
  const open = settings?.availabilityOpen ?? true;

  return (
    <PageTransition>
      <Helmet>
        <title>{pageTitle("/contact")}</title>
      </Helmet>

      <PageHeader
        index="/ contact"
        eyebrow="Say hello"
        title={<>Let&apos;s start a <span className="text-gradient">conversation.</span></>}
        subtitle="Whether it's a project, a role, or just an idea, my inbox is always open."
      >
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-2 rounded-full chip-accent px-4 py-2 text-sm" data-testid="availability-badge">
            <span className={`h-2 w-2 rounded-full ${open ? "bg-success animate-pulse" : "bg-ink-muted"}`} />
            {settings?.availability || "Available for work"}
          </span>
          <a href={resume} target="_blank" rel="noreferrer" className="rounded-full border border-strong px-5 py-2 text-sm font-medium hover:border-primary hover:text-primary transition-colors duration-200" data-testid="contact-resume-download">
            Download résumé ↗
          </a>
        </div>
      </PageHeader>

      <Contact />

      <section className="pb-28">
        <div className="wrap">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-border h-72 md:h-96">
            <iframe
              title="location"
              src="https://www.google.com/maps?q=Bhubaneswar,Odisha,India&z=12&output=embed"
              className="w-full h-full [filter:grayscale(1)] dark:[filter:grayscale(1)_invert(0.92)_contrast(0.9)]"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="pointer-events-none absolute left-6 bottom-6 rounded-full bg-base px-4 py-2 label">Bhubaneswar, Odisha, India</div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
};

export default ContactPage;
