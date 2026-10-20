import { useLocation } from "react-router-dom";
import ChatBot from "./ChatBot";
import AmbientControls from "./AmbientControls";
import SoundIntro from "./SoundIntro";
import { isV2Path } from "../v2/VersionSwitch";

// Site-wide floating widgets — hidden on the admin area to avoid UI collisions.
// The minimal v2 site keeps only the chatbot (no music or interface sounds).
const SiteWidgets = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin")) return null;
  if (isV2Path(pathname)) return <ChatBot />;
  return (
    <>
      <ChatBot />
      <AmbientControls />
      <SoundIntro />
    </>
  );
};

export default SiteWidgets;
