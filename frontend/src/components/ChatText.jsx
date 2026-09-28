import { Fragment } from "react";

/*
 * Tiny, safe renderer for the assistant's light Markdown: paragraphs, "- " or
 * "1. " lists, **bold**, *italic*, `code` and links (Markdown or bare URLs).
 * Everything becomes React elements, never HTML strings, so replies can't
 * inject markup. Kept small on purpose: the chat widget is on every page and
 * shouldn't pull in a full Markdown library.
 */

const INLINE = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*\s][^*]*\*|_[^_\s][^_]*_|`[^`]+`|\[[^\]]+\]\([^)\s]+\)|https?:\/\/[^\s)]+)/g;

const safeHref = (url) => (/^(https?:\/\/|\/|mailto:)/i.test(url) ? url : null);

const renderInline = (text, keyBase) => {
  const out = [];
  let last = 0;
  let m;
  let i = 0;
  INLINE.lastIndex = 0;
  while ((m = INLINE.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const key = `${keyBase}-${i++}`;
    if (tok.startsWith("**") || tok.startsWith("__")) out.push(<strong key={key}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("`")) out.push(<code key={key}>{tok.slice(1, -1)}</code>);
    else if (tok.startsWith("[")) {
      const [, label, url] = tok.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/) || [];
      const href = safeHref(url || "");
      out.push(href ? <a key={key} href={href} target={href.startsWith("/") ? undefined : "_blank"} rel="noreferrer">{label}</a> : label);
    } else if (/^https?:\/\//.test(tok)) {
      const url = tok.replace(/[.,;:!?]+$/, "");
      out.push(<a key={key} href={url} target="_blank" rel="noreferrer">{url}</a>);
      if (url.length < tok.length) out.push(tok.slice(url.length));
    } else out.push(<em key={key}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
};

const ChatText = ({ text = "" }) => {
  const lines = String(text).replace(/\r/g, "").split("\n");
  const blocks = [];
  let para = [];
  let list = null; // { ordered, items }
  const flushPara = () => {
    if (para.length) blocks.push({ type: "p", lines: para });
    para = [];
  };
  const flushList = () => {
    if (list) blocks.push({ type: "list", ...list });
    list = null;
  };
  for (const raw of lines) {
    const line = raw.replace(/^#{1,6}\s+/, ""); // headings read as plain text
    const bullet = line.match(/^\s*(?:[-*•])\s+(.*)$/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (bullet || numbered) {
      flushPara();
      const ordered = !!numbered;
      if (!list || list.ordered !== ordered) {
        flushList();
        list = { ordered, items: [] };
      }
      list.items.push((bullet || numbered)[1]);
    } else if (!line.trim()) {
      flushPara();
      flushList();
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();

  return (
    <div className="chat-md">
      {blocks.map((b, bi) =>
        b.type === "p" ? (
          <p key={bi}>
            {b.lines.map((l, li) => (
              <Fragment key={li}>
                {li > 0 && <br />}
                {renderInline(l, `${bi}-${li}`)}
              </Fragment>
            ))}
          </p>
        ) : b.ordered ? (
          <ol key={bi}>{b.items.map((it, ii) => <li key={ii}>{renderInline(it, `${bi}-${ii}`)}</li>)}</ol>
        ) : (
          <ul key={bi}>{b.items.map((it, ii) => <li key={ii}>{renderInline(it, `${bi}-${ii}`)}</li>)}</ul>
        )
      )}
    </div>
  );
};

export default ChatText;
