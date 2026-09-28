import { useState } from "react";

/**
 * Project cover. Falls back to a violet placeholder carrying the project name
 * when a project has no image yet (or the image fails to load).
 */
const ProjectImage = ({ src, title, className = "", imgClassName = "" }) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`relative grid place-items-center overflow-hidden bg-grad ${className}`}>
        <div
          aria-hidden
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "2.5rem 2.5rem",
          }}
        />
        <span className="relative title-xl px-6 text-center text-white/90 text-[clamp(1.75rem,6cqi,4.5rem)]">{title}</span>
      </div>
    );
  }

  return <img src={src} alt={title ? `${title}, a project by Mohan Kumar Dalei` : ""} loading="lazy" onError={() => setFailed(true)} className={`${className} ${imgClassName}`} />;
};

export default ProjectImage;
