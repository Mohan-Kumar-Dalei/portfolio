// Section anchors on the single v2 page. On the page itself it scrolls
// straight there (and records the hash, so the version switch knows where you
// are); from a sub-page (blog, project) it navigates and the home page scrolls
// once the section exists.
export const goToSection = (navigate, id) => {
  const el = document.getElementById(id);
  if (window.location.pathname === "/v2" && el) {
    navigate(`/v2#${id}`, { replace: true, state: { noScroll: true } });
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  navigate(`/v2#${id}`);
};
