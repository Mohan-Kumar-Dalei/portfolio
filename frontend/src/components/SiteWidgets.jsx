import { lazy, Suspense, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ChatBot from "./ChatBot";
import { isV1Path } from "../v2/VersionSwitch";
import { loadVisits } from "../lib/visits";

// Music and interface sounds belong to v1 only, so they load with it.
const AmbientControls = lazy(() => import("./AmbientControls"));
const SoundIntro = lazy(() => import("./SoundIntro"));

// Site-wide floating widgets — hidden on the admin area to avoid UI collisions.
// The minimal v2 site (the default) keeps only the chatbot.
const SiteWidgets = () => {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");
  // Count the visit (once per session) on public pages, either version.
  useEffect(() => {
    if (!isAdmin) loadVisits();
  }, [isAdmin]);
  if (isAdmin) return null;
  if (!isV1Path(pathname)) return <ChatBot />;
  return (
    <>
      <ChatBot />
      <Suspense fallback={null}>
        <AmbientControls />
        <SoundIntro />
      </Suspense>
    </>
  );
};

export default SiteWidgets;
