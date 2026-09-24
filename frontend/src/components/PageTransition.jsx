/**
 * Page entrance: a curtain panel lifts away and the page fades in beneath it.
 *
 * Both are plain CSS keyframes (see .page-curtain / .page-enter in index.css)
 * instead of framer-motion. The JS version waited for the old page's exit
 * animation before mounting the new one; when that animation stalled (tab in
 * the background, a busy main thread) the new page stayed at opacity 0 and the
 * route looked blank. CSS animations always run to their end, so a page can
 * never get stuck invisible. The wrapper only animates opacity, so GSAP pins
 * inside it keep an untransformed ancestor.
 */
const PageTransition = ({ children, className = "" }) => (
  <>
    <div aria-hidden className="page-curtain pointer-events-none fixed inset-0 z-[90] bg-surface" />
    <div className={`page-enter ${className}`}>{children}</div>
  </>
);

export default PageTransition;
