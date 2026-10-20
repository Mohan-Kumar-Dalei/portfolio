import { lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import ChatBot from "./ChatBot";
import { isV1Path } from "../v2/VersionSwitch";

// Music and interface sounds belong to v1 only, so they load with it.
const AmbientControls = lazy(() => import("./AmbientControls"));
const SoundIntro = lazy(() => import("./SoundIntro"));

// Site-wide floating widgets — hidden on the admin area to avoid UI collisions.
// The minimal v2 site (the default) keeps only the chatbot.
const SiteWidgets = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin")) return null;
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
