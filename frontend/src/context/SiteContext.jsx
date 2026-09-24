import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../lib/api";

const SiteContext = createContext(null);

export const SiteProvider = ({ children }) => {
  const [data, setData] = useState({ projects: [], testimonials: [], blogs: [], settings: null });
  const [loaded, setLoaded] = useState(false);

  const refetch = useCallback(async () => {
    const [projects, testimonials, blogs, settings] = await Promise.all([
      api.get("/projects").then((r) => r.data).catch(() => []),
      api.get("/testimonials").then((r) => r.data).catch(() => []),
      api.get("/blogs").then((r) => r.data).catch(() => []),
      api.get("/settings").then((r) => r.data).catch(() => null),
    ]);
    setData({ projects, testimonials, blogs, settings });
    setLoaded(true);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <SiteContext.Provider value={{ ...data, loaded, refetch }}>{children}</SiteContext.Provider>
  );
};

export const useSite = () => useContext(SiteContext);
