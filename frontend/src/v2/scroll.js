// Section anchors on the home page. If the section is on screen already (the
// home page, or one of its aliases like /about) it scrolls straight there and
// records the hash, so the version switch knows where you are; from a
// sub-page (blog, project) it navigates and the home page scrolls once the
// section exists.
export const goToSection = (navigate, id) => {
  const el = document.getElementById(id);
  if (el && el.closest("#v2-main")) {
    if (window.location.pathname === "/") navigate(`/#${id}`, { replace: true, state: { noScroll: true } });
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  navigate(`/#${id}`);
};
