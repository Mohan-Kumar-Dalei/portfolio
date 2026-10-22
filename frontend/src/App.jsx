import { lazy, Suspense } from "react";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { SiteProvider } from "./context/SiteContext";
import { SoundProvider } from "./context/SoundContext";
import SiteWidgets from "./components/SiteWidgets";
import ProtectedRoute from "./routes/ProtectedRoute";
import { V2Layout, Home as V2Home, Blog as V2Blog, BlogPost as V2BlogPost, Project as V2Project } from "./v2";
import { isV1Path } from "./v2/VersionSwitch";
import { useSiteLook } from "./v2/look";

/*
 * v2, the minimal site, is the default and owns the public URLs (/, /blog,
 * /blog/:slug, /projects/:id; /about, /projects, /experience, /services and
 * /contact open the matching section). v1, the animated site, lives under
 * /v1 in its own chunk, so default visitors never download its animation code.
 */
const v1 = (name) => lazy(() => import("./v1").then((m) => ({ default: m[name] })));
const V1Layout = v1("Layout");
const V1Home = v1("Home");
const V1About = v1("AboutPage");
const V1Projects = v1("ProjectsPage");
const V1ProjectDetail = v1("ProjectDetailPage");
const V1Experience = v1("ExperiencePage");
const V1Services = v1("ServicesPage");
const V1Blog = v1("BlogPage");
const V1BlogDetail = v1("BlogDetailPage");
const V1Contact = v1("ContactPage");
const CustomCursor = lazy(() => import("./components/CustomCursor"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

const page = (Page) => (
  <Suspense fallback={null}>
    <Page />
  </Suspense>
);

// v1's custom cursor and film grain, on v1 only. Everything else (the
// public v2 site and the admin) has the v2 look and the normal cursor.
const V1Chrome = () => {
  const { pathname } = useLocation();
  useSiteLook();
  if (!isV1Path(pathname)) return null;
  return (
    <>
      <Suspense fallback={null}>
        <CustomCursor />
      </Suspense>
      <div className="noise-overlay" />
    </>
  );
};

// Old /v2/... links (shared while v2 was the alternative) now live at the root.
const FromV2 = () => {
  const { pathname, hash } = useLocation();
  return <Navigate to={`${pathname.replace(/^\/v2/, "") || "/"}${hash}`} replace />;
};

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <SiteProvider>
            <SoundProvider>
              <BrowserRouter>
                <V1Chrome />
                <SiteWidgets />
                <Routes>
                  <Route element={<V2Layout />}>
                    <Route path="/" element={<V2Home />} />
                    <Route path="/about" element={<V2Home section="about" />} />
                    <Route path="/projects" element={<V2Home section="projects" />} />
                    <Route path="/experience" element={<V2Home section="experience" />} />
                    <Route path="/services" element={<V2Home section="contact" />} />
                    <Route path="/contact" element={<V2Home section="contact" />} />
                    <Route path="/blog" element={<V2Blog />} />
                    <Route path="/blog/:slug" element={<V2BlogPost />} />
                    <Route path="/projects/:id" element={<V2Project />} />
                  </Route>
                  <Route path="/v1" element={page(V1Layout)}>
                    <Route index element={page(V1Home)} />
                    <Route path="about" element={page(V1About)} />
                    <Route path="projects" element={page(V1Projects)} />
                    <Route path="projects/:id" element={page(V1ProjectDetail)} />
                    <Route path="experience" element={page(V1Experience)} />
                    <Route path="services" element={page(V1Services)} />
                    <Route path="blog" element={page(V1Blog)} />
                    <Route path="blog/:slug" element={page(V1BlogDetail)} />
                    <Route path="contact" element={page(V1Contact)} />
                    <Route path="*" element={<Navigate to="/v1" replace />} />
                  </Route>
                  <Route path="/v2/*" element={<FromV2 />} />
                  <Route path="/v2" element={<FromV2 />} />
                  <Route path="/admin/login" element={page(AdminLogin)} />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={null}>
                          <AdminDashboard />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
            </SoundProvider>
          </SiteProvider>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
