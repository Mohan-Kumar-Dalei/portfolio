import { SectionHead } from "./editorial";

/** Kept for older call sites — renders the editorial section head. */
const SectionHeading = ({ index, eyebrow, title, subtitle }) => (
  <SectionHead index={index} label={eyebrow} title={title} intro={subtitle} />
);

export default SectionHeading;
