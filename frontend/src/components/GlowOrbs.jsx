const GlowOrbs = ({ className = "" }) => {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="absolute -top-40 -left-40 w-[37.5rem] h-[37.5rem] rounded-full bg-primary/10 blur-[140px] animate-float-slow" />
      <div className="absolute top-1/3 -right-40 w-[31.25rem] h-[31.25rem] rounded-full bg-secondary/15 blur-[140px] animate-float-slow" style={{ animationDelay: "3s" }} />
      <div className="absolute bottom-0 left-1/4 w-[25rem] h-[25rem] rounded-full bg-highlight/5 blur-[120px] animate-float-slow" style={{ animationDelay: "6s" }} />
    </div>
  );
};

export default GlowOrbs;
