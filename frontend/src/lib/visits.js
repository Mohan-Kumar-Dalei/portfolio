import { useEffect, useState } from "react";
import api from "./api";

/*
 * Site visit counter. The first page view of a browser session reports a
 * visit (and, the first time this browser ever comes, a new visitor); later
 * calls only read the totals. One shared request per page load.
 */
let pending = null;

const read = (store, key) => {
  try {
    return window[store].getItem(key);
  } catch {
    return null; // storage blocked: still counted, just not de-duplicated
  }
};
const write = (store, key) => {
  try {
    window[store].setItem(key, "1");
  } catch {
    // not remembered; harmless
  }
};

export const loadVisits = () => {
  if (!pending) {
    const reported = read("sessionStorage", "mkd_visit");
    const returning = read("localStorage", "mkd_visitor");
    pending = (reported ? api.get("/visits") : api.post("/visits", { newVisitor: !returning }))
      .then((r) => {
        write("sessionStorage", "mkd_visit");
        write("localStorage", "mkd_visitor");
        return r.data;
      })
      .catch(() => {
        pending = null;
        return null;
      });
  }
  return pending;
};

/** { visits, visitors } or null while loading. */
export const useVisits = () => {
  const [counts, setCounts] = useState(null);
  useEffect(() => {
    let alive = true;
    loadVisits().then((c) => alive && setCounts(c));
    return () => {
      alive = false;
    };
  }, []);
  return counts;
};
