import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { isV1Path } from "./VersionSwitch";

const FONT_ID = "v2-font";
const FONT_HREF = "https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap";

/**
 * The v2 look (palette, typeface, native cursor) applies everywhere except
 * v1 (/v1): the public site and the admin. Sets html.is-v2 to match the
 * current page; index.html does the same before the first paint.
 */
export const useSiteLook = () => {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    const v2 = !isV1Path(pathname);
    document.documentElement.classList.toggle("is-v2", v2);
    if (v2 && !document.getElementById(FONT_ID)) {
      document.head.appendChild(Object.assign(document.createElement("link"), { id: FONT_ID, rel: "stylesheet", href: FONT_HREF }));
    }
  }, [pathname]);
};
