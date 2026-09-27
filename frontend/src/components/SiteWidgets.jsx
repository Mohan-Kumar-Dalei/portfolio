import { useLocation } from "react-router-dom";
import ChatBot from "./ChatBot";
import AmbientControls from "./AmbientControls";
import SoundIntro from "./SoundIntro";

// Site-wide floating widgets — hidden on the admin area to avoid UI collisions.
const SiteWidgets = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin")) return null;
  return (
    <>
      <ChatBot />
      <AmbientControls />
      <SoundIntro />
    </>
  );
};

export default SiteWidgets;
