import { lazy, Suspense } from "react";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { SiteProvider } from "./context/SiteContext";
import { SoundProvider } from "./context/SoundContext";
import CustomCursor from "./components/CustomCursor";
import SiteWidgets from "./components/SiteWidgets";
import Layout from "./components/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";

import Home from "./pages/Home";
import AboutPage from "./pages/AboutPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import ExperiencePage from "./pages/ExperiencePage";
import ServicesPage from "./pages/ServicesPage";
import BlogPage from "./pages/BlogPage";
import BlogDetailPage from "./pages/BlogDetailPage";
import ContactPage from "./pages/ContactPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import { isV2Path } from "./v2/VersionSwitch";

// v2, the minimal site, is its own chunk: v1 visitors never download it.
const v2 = (name) => lazy(() => import("./v2").then((m) => ({ default: m[name] })));
const V2Layout = v2("V2Layout");
const V2Home = v2("Home");
const V2Blog = v2("Blog");
const V2BlogPost = v2("BlogPost");
const V2Project = v2("Project");
const page = (Page) => (
  <Suspense fallback={null}>
    <Page />
  </Suspense>
);

// v1's custom cursor and film grain stay off the minimal v2 pages.
const V1Chrome = () => {
  const { pathname } = useLocation();
  if (isV2Path(pathname)) return null;
  return (
    <>
      <CustomCursor />
      <div className="noise-overlay" />
    </>
  );
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
                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/projects/:id" element={<ProjectDetailPage />} />
                  <Route path="/experience" element={<ExperiencePage />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/blog/:slug" element={<BlogDetailPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                </Route>
                <Route path="/v2" element={page(V2Layout)}>
                  <Route index element={page(V2Home)} />
                  <Route path="blog" element={page(V2Blog)} />
                  <Route path="blog/:slug" element={page(V2BlogPost)} />
                  <Route path="projects/:id" element={page(V2Project)} />
                  <Route path="*" element={<Navigate to="/v2" replace />} />
                </Route>
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
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
