import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  LayoutDashboard, MessageSquare, FolderKanban, Quote, FileText, Settings as SettingsIcon,
  LogOut, Trash2, Plus, Pencil, X, Loader2, Mail, Save, CheckCircle2, Bot, Upload, Sparkles, ExternalLink,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { parseSpotify } from "../lib/spotify";
import PageTransition from "../components/PageTransition";

const today = () => new Date().toISOString().slice(0, 10);
const emptyProject = { title: "", subtitle: "", description: "", image: "", category: "Full Stack", features: "", techStack: "", githubLink: "", liveLink: "", architecture: "", challenges: "", solutions: "", featured: true, createdAt: today() };
const emptyTestimonial = { name: "", role: "", company: "", quote: "", rating: 5, avatar: "" };
const emptyBlog = { title: "", excerpt: "", content: "", coverImage: "", category: "Engineering", tags: "", featured: false, published: true };

const tabs = [
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "blogs", label: "Blogs", icon: FileText },
  { id: "testimonials", label: "Testimonials", icon: Quote },
  { id: "chats", label: "AI Chats", icon: Bot },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("messages");
  const [messages, setMessages] = useState([]);
  const [projects, setProjects] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [settings, setSettings] = useState(null);
  const [chatlogs, setChatlogs] = useState([]);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [uploading, setUploading] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");

  const errMsg = (err, fallback) => err?.response?.data?.message || fallback;

  const loadAll = useCallback(async () => {
    const [m, p, b, t, s, c] = await Promise.all([
      api.get("/messages").then((r) => r.data).catch(() => []),
      api.get("/projects").then((r) => r.data).catch(() => []),
      api.get("/blogs?all=true").then((r) => r.data).catch(() => []),
      api.get("/testimonials").then((r) => r.data).catch(() => []),
      api.get("/settings").then((r) => r.data).catch(() => null),
      api.get("/chatlogs").then((r) => r.data).catch(() => []),
    ]);
    setMessages(m); setProjects(p); setBlogs(b); setTestimonials(t); setSettings(s); setChatlogs(c);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const doLogout = () => { logout(); navigate("/admin/login", { replace: true }); };
  const deleteItem = async (kind, id) => {
    if (!window.confirm("Delete this item? This cannot be undone.")) return;
    setError("");
    try {
      await api.delete(`/${kind}/${id}`);
      await loadAll();
    } catch (err) {
      setError(errMsg(err, "Could not delete that item. Please try again."));
    }
  };

  const uploadFile = async (kind, file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    setUploading(kind);
    try {
      await api.post(`/upload/${kind}`, fd);
      await loadAll();
    } catch (err) {
      setError(errMsg(err, "Upload failed. Please try again."));
    } finally {
      setUploading("");
    }
  };

  const openModal = (m) => { setModalError(""); setModal(m); };
  const openProjectModal = (p) => openModal({ type: "project", data: p ? { ...p, features: (p.features || []).join(", "), techStack: (p.techStack || []).join(", "), createdAt: p.createdAt ? String(p.createdAt).slice(0, 10) : today() } : { ...emptyProject } });
  const openTestimonialModal = (t) => openModal({ type: "testimonial", data: t ? { ...t } : { ...emptyTestimonial } });
  const openBlogModal = (b) => openModal({ type: "blog", data: b ? { ...b, tags: (b.tags || []).join(", ") } : { ...emptyBlog } });

  // Pick a topic, then the AI gathers fresh stories on it, writes the post and
  // opens the draft for review. Nothing is published until the admin says so.
  const [genOpen, setGenOpen] = useState(false);
  const generateNews = async (topic) => {
    setGenerating(true);
    setError("");
    try {
      const { data } = await api.post("/blogs/generate", { topic }, { timeout: 90000 });
      setGenOpen(false);
      await loadAll();
      openBlogModal(data);
    } catch (err) {
      setGenOpen(false);
      setError(errMsg(err, "Couldn't generate a draft. Please try again."));
    } finally {
      setGenerating(false);
    }
  };

  // Required fields per form, checked before anything is sent.
  const missingFields = ({ type, data }) => {
    const need = {
      project: [["title", "Title"], ["description", "Description"]],
      testimonial: [["name", "Name"], ["quote", "Quote"]],
      blog: [["title", "Title"], ["content", "Content"]],
    }[type] || [];
    return need.filter(([k]) => !String(data[k] ?? "").trim()).map(([, label]) => label);
  };

  const saveModal = async () => {
    const missing = missingFields(modal);
    if (missing.length) {
      setModalError(`Please fill in: ${missing.join(", ")}.`);
      return;
    }
    setModalError("");
    setSaving(true);
    try {
      const { type, data } = modal;
      if (type === "project") {
        const payload = { ...data, features: splitList(data.features), techStack: splitList(data.techStack) };
        data._id ? await api.put(`/projects/${data._id}`, payload) : await api.post("/projects", payload);
      } else if (type === "testimonial") {
        const payload = { ...data, rating: Number(data.rating) || 5 };
        data._id ? await api.put(`/testimonials/${data._id}`, payload) : await api.post("/testimonials", payload);
      } else if (type === "blog") {
        const payload = { ...data, tags: splitList(data.tags) };
        data._id ? await api.put(`/blogs/${data._id}`, payload) : await api.post("/blogs", payload);
      }
      setModal(null); loadAll();
    } catch (err) {
      setModalError(errMsg(err, "Could not save. Please check the fields and try again."));
    } finally { setSaving(false); }
  };

  const saveSettings = async () => {
    setSaving(true);
    setError("");
    try {
      // Spotify: accept a share link or the whole embed code, store the clean link.
      const rawSpotify = String(settings.spotifyUrl || "").trim();
      const spotify = parseSpotify(rawSpotify);
      if (rawSpotify && !spotify) {
        setError("That Spotify link wasn't recognised. Paste a track, playlist or album link (or its embed code).");
        return;
      }
      // An empty key field means "keep the saved key", so it is not sent.
      const { geminiApiKey, hasGeminiKey, ...rest } = { ...settings, spotifyUrl: spotify ? spotify.url : "" };
      const { data } = await api.put("/settings", geminiApiKey ? { ...rest, geminiApiKey } : rest);
      setSettings(data);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2500);
    } catch (err) {
      setError(errMsg(err, "Could not save settings. Please try again."));
    } finally { setSaving(false); }
  };

  const deleteChat = async (id) => {
    if (!window.confirm("Delete this chat? This cannot be undone.")) return;
    setError("");
    try {
      await api.delete(`/chatlogs/${id}`);
      setChatlogs((c) => c.filter((x) => x._id !== id));
    } catch (err) {
      setError(errMsg(err, "Could not delete that chat."));
    }
  };

  const setField = (k, v) => setModal((m) => ({ ...m, data: { ...m.data, [k]: v } }));
  const setSetting = (k, v) => setSettings((s) => ({ ...s, [k]: v }));

  return (
    <PageTransition>
      <Helmet><title>Dashboard | Mohan Kumar Dalei</title><meta name="robots" content="noindex" /></Helmet>
      <div className="min-h-screen bg-base flex flex-col md:flex-row">
        <aside className="md:w-64 border-b md:border-b-0 md:border-r border-border p-6 flex md:flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 font-display text-xl font-bold mb-10"><LayoutDashboard size={20} className="text-primary" /><span className="text-gradient">Admin</span></div>
            <nav className="flex md:flex-col gap-2 flex-wrap">
              {tabs.map((t) => {
                const Icon = t.icon; const active = tab === t.id;
                const count = t.id === "messages" ? messages.length : t.id === "projects" ? projects.length : t.id === "blogs" ? blogs.length : t.id === "testimonials" ? testimonials.length : t.id === "chats" ? chatlogs.length : null;
                return (
                  <button key={t.id} onClick={() => setTab(t.id)} data-testid={`admin-tab-${t.id}`} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors duration-200 ${active ? "bg-chip text-ink border border-border" : "text-ink-muted hover:text-ink"}`}>
                    <Icon size={18} /><span className="hidden sm:inline">{t.label}</span>
                    {count !== null && <span className="ml-auto hidden md:inline text-xs font-mono text-ink-muted">{count}</span>}
                  </button>
                );
              })}
            </nav>
          </div>
          <div className="md:mt-auto">
            <div className="hidden md:block text-xs text-ink-muted font-mono mb-3 truncate">{user?.email}</div>
            <button onClick={doLogout} className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-ink-muted hover:text-red-400 transition-colors duration-200" data-testid="admin-logout"><LogOut size={18} /><span className="hidden sm:inline">Logout</span></button>
          </div>
        </aside>

        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-display text-3xl font-semibold">{tabs.find((t) => t.id === tab)?.label}</h1>
            {tab === "projects" && <AddBtn onClick={() => openProjectModal()} label="Add Project" testid="admin-add-project" />}
            {tab === "blogs" && (
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  onClick={() => setGenOpen(true)}
                  disabled={generating}
                  className="inline-flex items-center gap-2 rounded-full bg-grad px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-70 transition-transform duration-200 hover:scale-[1.02]"
                  data-testid="admin-generate-news"
                >
                  {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  {generating ? "Writing your draft…" : "Generate with AI"}
                </button>
                <AddBtn onClick={() => openBlogModal()} label="Add Blog" testid="admin-add-blog" />
              </div>
            )}
            {tab === "testimonials" && <AddBtn onClick={() => openTestimonialModal()} label="Add Testimonial" testid="admin-add-testimonial" />}
          </div>

          {error && (
            <div role="alert" className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm" data-testid="admin-error">
              <span>{error}</span>
              <button onClick={() => setError("")} aria-label="Dismiss" className="text-ink-muted hover:text-ink"><X size={16} /></button>
            </div>
          )}

          {tab === "messages" && (
            <div className="space-y-4" data-testid="admin-messages-list">
              {messages.length === 0 && <p className="text-ink-muted">No messages yet.</p>}
              {messages.map((m) => (
                <div key={m._id} className="glass rounded-xl p-5" data-testid="admin-message-item">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap"><span className="font-medium">{m.name}</span><a href={`mailto:${m.email}`} className="text-sm text-primary flex items-center gap-1"><Mail size={13} /> {m.email}</a></div>
                      {m.subject && <div className="text-sm text-ink-muted mt-1 font-mono">{m.subject}</div>}
                      {m.emailStatus === "sent" && (
                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 px-2.5 py-0.5 text-[0.6875rem] font-mono text-emerald-600">
                          <CheckCircle2 size={12} /> Email sent
                        </div>
                      )}
                      {m.emailStatus === "failed" && (
                        <div className="mt-2 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs" data-testid="admin-email-failed">
                          <b>Email not sent.</b> Web3Forms said: <span className="font-mono">{m.emailError || "unknown error"}</span>
                        </div>
                      )}
                      <p className="mt-3 text-ink-muted">{m.message}</p>
                      <div className="mt-3 text-xs text-ink-muted font-mono">{new Date(m.createdAt).toLocaleString()}</div>
                    </div>
                    <button onClick={() => deleteItem("messages", m._id)} className="grid h-9 w-9 place-items-center rounded-full border border-border hover:border-red-400 hover:text-red-400 transition-colors duration-200 shrink-0" data-testid="admin-delete-message"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "projects" && (
            <div className="grid md:grid-cols-2 gap-5" data-testid="admin-projects-list">
              {projects.map((p) => (
                <div key={p._id} className="glass rounded-xl overflow-hidden" data-testid="admin-project-item">
                  {p.image && <img src={p.image} alt={p.title} className="h-40 w-full object-cover" />}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div><h3 className="font-display text-lg font-medium">{p.title}</h3><p className="text-xs text-primary font-mono">{p.category}</p></div>
                      <RowActions onEdit={() => openProjectModal(p)} onDelete={() => deleteItem("projects", p._id)} editTestid="admin-edit-project" delTestid="admin-delete-project" />
                    </div>
                    <p className="mt-2 text-sm text-ink-muted line-clamp-2">{p.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "blogs" && (
            <div className="grid md:grid-cols-2 gap-5" data-testid="admin-blogs-list">
              {blogs.map((b) => (
                <div key={b._id} className="glass rounded-xl overflow-hidden" data-testid="admin-blog-item">
                  {b.coverImage && <img src={b.coverImage} alt={b.title} className="h-36 w-full object-cover" />}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-lg font-medium">{b.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-primary font-mono">{b.category}</span>
                          {b.featured && <span className="text-[0.625rem] font-mono px-2 py-0.5 rounded-full border border-border text-ink-muted">FEATURED</span>}
                          {!b.published && <span className="text-[0.625rem] font-mono px-2 py-0.5 rounded-full border border-amber-500/50 text-amber-600">DRAFT</span>}
                          {b.aiGenerated && <span className="text-[0.625rem] font-mono px-2 py-0.5 rounded-full border border-primary/40 text-primary">AI</span>}
                        </div>
                      </div>
                      <RowActions onEdit={() => openBlogModal(b)} onDelete={() => deleteItem("blogs", b._id)} editTestid="admin-edit-blog" delTestid="admin-delete-blog" />
                    </div>
                    <p className="mt-2 text-sm text-ink-muted line-clamp-2">{b.excerpt}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "testimonials" && (
            <div className="grid md:grid-cols-2 gap-5" data-testid="admin-testimonials-list">
              {testimonials.map((t) => (
                <div key={t._id} className="glass rounded-xl p-5" data-testid="admin-testimonial-item">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">{t.avatar && <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full object-cover" />}<div><div className="font-medium">{t.name}</div><div className="text-xs text-ink-muted font-mono">{t.role}{t.company ? ` · ${t.company}` : ""}</div></div></div>
                    <RowActions onEdit={() => openTestimonialModal(t)} onDelete={() => deleteItem("testimonials", t._id)} editTestid="admin-edit-testimonial" delTestid="admin-delete-testimonial" />
                  </div>
                  <p className="mt-3 text-sm text-ink-muted italic">"{t.quote}"</p>
                </div>
              ))}
            </div>
          )}

          {tab === "chats" && (
            <div className="space-y-4" data-testid="admin-chats-list">
              {chatlogs.length === 0 && <p className="text-ink-muted">No AI chats yet.</p>}
              {chatlogs.map((c) => (
                <div key={c._id} className="glass rounded-xl p-5" data-testid="admin-chat-item">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs font-mono text-ink-muted">
                        {c.createdAt ? new Date(c.createdAt).toLocaleString() : "Unknown time"}
                        {c.sessionId && c.sessionId !== "anon" ? " · session " + String(c.sessionId).slice(0, 8) : ""}
                      </div>
                      <p className="mt-2 font-medium">Q: {c.question}</p>
                      <p className="mt-2 text-sm text-ink-muted whitespace-pre-line">A: {c.answer}</p>
                    </div>
                    <button onClick={() => deleteChat(c._id)} aria-label="Delete chat" className="grid h-9 w-9 place-items-center rounded-full border border-border hover:border-red-400 hover:text-red-400 transition-colors duration-200 shrink-0" data-testid="admin-delete-chat"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "settings" && settings && (
            <div className="max-w-2xl space-y-4" data-testid="admin-settings">
              <Input label="Resume URL" value={settings.resumeUrl} onChange={(v) => setSetting("resumeUrl", v)} testid="set-resume" />
              <UploadField
                label="Upload a resume PDF"
                accept="application/pdf"
                hint="Replaces the URL above · max 4MB"
                busy={uploading === "resume"}
                onPick={(f) => uploadFile("resume", f)}
                testid="upload-resume"
              />
              <Input label="Availability text" value={settings.availability} onChange={(v) => setSetting("availability", v)} testid="set-availability" />
              <label className="flex items-center gap-3 text-sm text-ink-muted cursor-pointer">
                <input type="checkbox" checked={!!settings.availabilityOpen} onChange={(e) => setSetting("availabilityOpen", e.target.checked)} data-testid="set-available-open" /> Currently available for work
              </label>
              <Input label="Location" value={settings.location} onChange={(v) => setSetting("location", v)} testid="set-location" />
              <Input label="Email" value={settings.email} onChange={(v) => setSetting("email", v)} testid="set-email" />
              <Input label="GitHub URL" value={settings.github} onChange={(v) => setSetting("github", v)} testid="set-github" />
              <Input label="LinkedIn URL" value={settings.linkedin} onChange={(v) => setSetting("linkedin", v)} testid="set-linkedin" />
              <Input label="Background Music URL (mp3)" value={settings.musicUrl} onChange={(v) => setSetting("musicUrl", v)} testid="set-music" />
              <UploadField
                label="Upload a music track"
                accept="audio/mpeg,audio/wav,audio/ogg"
                hint="Replaces the URL above · max 4MB"
                busy={uploading === "music"}
                onPick={(f) => uploadFile("music", f)}
                testid="upload-music"
              />
              {/(spotify\.com|youtube\.com|youtu\.be)/i.test(settings.musicUrl || "") && (
                <p className="text-xs text-rose-500 font-mono -mt-2">This field needs a direct audio file (.mp3). For Spotify, use the field below.</p>
              )}
              <SpotifyField value={settings.spotifyUrl} onChange={(v) => setSetting("spotifyUrl", v)} />
              <div>
                <Input label="Gemini API Key (leave blank to keep the saved one)" type="password" value={settings.geminiApiKey} onChange={(v) => setSetting("geminiApiKey", v)} testid="set-gemini" />
                <p className="text-xs text-ink-muted mt-1 font-mono">{settings.hasGeminiKey ? "A key is saved. Enter a new one to replace it." : "No key saved. Set GEMINI_API_KEY on the server, or paste one here."}</p>
              </div>
              <button onClick={saveSettings} disabled={saving} className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 font-medium text-primary-foreground disabled:opacity-70 hover:bg-highlight transition-colors duration-200" data-testid="admin-save-settings">
                {saving ? <Loader2 size={18} className="animate-spin" /> : savedFlash ? <CheckCircle2 size={18} /> : <Save size={18} />}
                {savedFlash ? "Saved" : "Save Settings"}
              </button>
            </div>
          )}
        </main>
      </div>

      {genOpen && <TopicPicker busy={generating} onClose={() => !generating && setGenOpen(false)} onGenerate={generateNews} />}

      {modal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" data-testid="admin-modal">
          <div className="glass rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-7" data-lenis-prevent>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-medium capitalize">{modal.data._id ? "Edit" : "New"} {modal.type}</h2>
              <button onClick={() => setModal(null)} className="text-ink-muted hover:text-ink" data-testid="admin-modal-close"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              {modal.type === "project" && (
                <>
                  <Input label="Title *" value={modal.data.title} onChange={(v) => setField("title", v)} testid="pf-title" />
                  <Input label="Subtitle" value={modal.data.subtitle} onChange={(v) => setField("subtitle", v)} testid="pf-subtitle" />
                  <Input label="Category" value={modal.data.category} onChange={(v) => setField("category", v)} testid="pf-category" />
                  <Textarea label="Description *" value={modal.data.description} onChange={(v) => setField("description", v)} testid="pf-description" />
                  <Input label="Image URL" value={modal.data.image} onChange={(v) => setField("image", v)} testid="pf-image" />
                  <Input label="Features (comma separated)" value={modal.data.features} onChange={(v) => setField("features", v)} testid="pf-features" />
                  <Input label="Tech Stack (comma separated)" value={modal.data.techStack} onChange={(v) => setField("techStack", v)} testid="pf-tech" />
                  <Textarea label="Architecture" value={modal.data.architecture} onChange={(v) => setField("architecture", v)} testid="pf-arch" />
                  <Textarea label="Challenges" value={modal.data.challenges} onChange={(v) => setField("challenges", v)} testid="pf-challenges" />
                  <Textarea label="Solutions" value={modal.data.solutions} onChange={(v) => setField("solutions", v)} testid="pf-solutions" />
                  <Input label="GitHub Link" value={modal.data.githubLink} onChange={(v) => setField("githubLink", v)} testid="pf-github" />
                  <Input label="Live Link" value={modal.data.liveLink} onChange={(v) => setField("liveLink", v)} testid="pf-live" />
                  <Input label="Date (sets the Newest order)" type="date" value={modal.data.createdAt} onChange={(v) => setField("createdAt", v)} testid="pf-date" />
                  <label className="flex items-center gap-2 text-sm text-ink-muted cursor-pointer"><input type="checkbox" checked={!!modal.data.featured} onChange={(e) => setField("featured", e.target.checked)} data-testid="pf-featured" /> Featured (shown in the Home work reel)</label>
                </>
              )}
              {modal.type === "testimonial" && (
                <>
                  <Input label="Name *" value={modal.data.name} onChange={(v) => setField("name", v)} testid="tf-name" />
                  <Input label="Role" value={modal.data.role} onChange={(v) => setField("role", v)} testid="tf-role" />
                  <Input label="Company" value={modal.data.company} onChange={(v) => setField("company", v)} testid="tf-company" />
                  <Textarea label="Quote *" value={modal.data.quote} onChange={(v) => setField("quote", v)} testid="tf-quote" />
                  <Input label="Avatar URL" value={modal.data.avatar} onChange={(v) => setField("avatar", v)} testid="tf-avatar" />
                  <Input label="Rating (1-5)" type="number" value={modal.data.rating} onChange={(v) => setField("rating", v)} testid="tf-rating" />
                </>
              )}
              {modal.type === "blog" && (
                <>
                  <BlogReview data={modal.data} />
                  <Input label="Title *" value={modal.data.title} onChange={(v) => setField("title", v)} testid="bf-title" />
                  <Textarea label="Excerpt" value={modal.data.excerpt} onChange={(v) => setField("excerpt", v)} testid="bf-excerpt" />
                  <Input label="Cover Image URL" value={modal.data.coverImage} onChange={(v) => setField("coverImage", v)} testid="bf-cover" />
                  <Input label="Category" value={modal.data.category} onChange={(v) => setField("category", v)} testid="bf-category" />
                  <Input label="Tags (comma separated)" value={modal.data.tags} onChange={(v) => setField("tags", v)} testid="bf-tags" />
                  <Textarea label="Content (Markdown) *" value={modal.data.content} onChange={(v) => setField("content", v)} rows={8} testid="bf-content" />
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 text-sm text-ink-muted cursor-pointer"><input type="checkbox" checked={!!modal.data.featured} onChange={(e) => setField("featured", e.target.checked)} data-testid="bf-featured" /> Featured</label>
                    <label className="flex items-center gap-2 text-sm text-ink-muted cursor-pointer"><input type="checkbox" checked={!!modal.data.published} onChange={(e) => setField("published", e.target.checked)} data-testid="bf-published" /> Published</label>
                  </div>
                </>
              )}
            </div>

            {modalError && (
              <div role="alert" className="mt-6 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm" data-testid="admin-modal-error">{modalError}</div>
            )}

            <button onClick={saveModal} disabled={saving} className="mt-7 w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 font-medium text-primary-foreground disabled:opacity-70 hover:bg-highlight transition-colors duration-200" data-testid="admin-modal-save">
              {saving && <Loader2 size={18} className="animate-spin" />}{saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}
    </PageTransition>
  );
};

const splitList = (str) => String(str || "").split(",").map((s) => s.trim()).filter(Boolean);

const AddBtn = ({ onClick, label, testid }) => (
  <button onClick={onClick} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-highlight transition-colors duration-200" data-testid={testid}><Plus size={16} /> {label}</button>
);

const RowActions = ({ onEdit, onDelete, editTestid, delTestid }) => (
  <div className="flex gap-2">
    <button onClick={onEdit} className="grid h-9 w-9 place-items-center rounded-full border border-border hover:border-primary hover:text-primary transition-colors duration-200" data-testid={editTestid}><Pencil size={14} /></button>
    <button onClick={onDelete} className="grid h-9 w-9 place-items-center rounded-full border border-border hover:border-red-400 hover:text-red-400 transition-colors duration-200" data-testid={delTestid}><Trash2 size={14} /></button>
  </div>
);

// Spotify link or embed code, with a live check of what was pasted.
const SpotifyField = ({ value, onChange }) => {
  const raw = String(value || "").trim();
  const parsed = parseSpotify(raw);
  return (
    <div>
      <Input label="Spotify song / playlist (link or embed code)" value={value} onChange={onChange} testid="set-spotify" />
      <p className={`text-xs mt-1 font-mono ${raw && !parsed ? "text-rose-500" : "text-ink-muted"}`}>
        {!raw
          ? "Leave empty to use the MP3 above. When set, the site's music button opens a Spotify player instead."
          : parsed
            ? `Spotify ${parsed.type} detected · ${parsed.url}`
            : "Not a Spotify track, playlist or album link."}
      </p>
      {parsed && (
        <iframe
          title="Spotify preview"
          src={`https://open.spotify.com/embed/${parsed.type}/${parsed.id}?utm_source=generator`}
          width="100%"
          height="152"
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          className="mt-3 block rounded-xl border-0"
        />
      )}
    </div>
  );
};

// Shown if the topic list can't be fetched; mirrors backend/lib/news.js.
const FALLBACK_TOPICS = [
  { key: "ai", label: "AI & Machine Learning" },
  { key: "frontend", label: "Frontend development" },
  { key: "backend", label: "Backend & APIs" },
  { key: "devops", label: "DevOps & Cloud" },
  { key: "security", label: "Cybersecurity" },
  { key: "mobile", label: "Mobile apps" },
  { key: "web", label: "Web platform & browsers" },
];

// "Generate with AI": choose a preset topic or type any topic of your own.
const TopicPicker = ({ busy, onClose, onGenerate }) => {
  const [topics, setTopics] = useState(FALLBACK_TOPICS);
  const [picked, setPicked] = useState("ai");
  const [custom, setCustom] = useState("");

  useEffect(() => {
    api.get("/blogs/generate/topics").then((r) => Array.isArray(r.data) && r.data.length && setTopics(r.data)).catch(() => {});
  }, []);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const topic = custom.trim() || picked;
  const label = custom.trim() || topics.find((t) => t.key === picked)?.label || picked;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" data-testid="topic-picker" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="topic-picker-title" className="glass rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-7" data-lenis-prevent>
        <div className="flex items-center justify-between mb-2">
          <h2 id="topic-picker-title" className="font-display text-xl font-medium flex items-center gap-2"><Sparkles size={18} className="text-primary" /> Generate a blog draft</h2>
          <button onClick={onClose} disabled={busy} aria-label="Close" className="text-ink-muted hover:text-ink disabled:opacity-40"><X size={20} /></button>
        </div>
        <p className="text-sm text-ink-muted">Pick a topic. The AI reads the latest stories on it and writes a draft for you to review.</p>

        <div className="mt-6 flex flex-wrap gap-2" role="radiogroup" aria-label="Topic">
          {topics.map((t) => {
            const on = !custom.trim() && picked === t.key;
            return (
              <button
                key={t.key}
                type="button"
                role="radio"
                aria-checked={on}
                disabled={busy}
                onClick={() => {
                  setPicked(t.key);
                  setCustom("");
                }}
                className={`rounded-full border px-4 py-2 text-sm transition-colors duration-200 ${on ? "border-primary bg-primary text-primary-foreground" : "border-border text-ink hover:border-primary"}`}
                data-testid={`topic-${t.key}`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          <label className="block font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-ink-muted mb-1.5">Or your own topic</label>
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value.slice(0, 80))}
            onKeyDown={(e) => e.key === "Enter" && !busy && onGenerate(topic)}
            disabled={busy}
            placeholder="e.g. Next.js caching, PostgreSQL performance, WebAssembly"
            className="w-full rounded-lg bg-chip border border-border px-4 py-2.5 text-sm focus:border-primary outline-none transition-colors duration-200"
            data-testid="topic-custom"
          />
        </div>

        <button
          onClick={() => onGenerate(topic)}
          disabled={busy}
          className="mt-7 w-full inline-flex items-center justify-center gap-2 rounded-full bg-grad px-8 py-3 font-semibold text-white disabled:opacity-80"
          data-testid="topic-generate"
        >
          {busy ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          {busy ? `Reading the latest on ${label}…` : `Generate: ${label}`}
        </button>
        {busy && <p className="mt-3 text-center text-xs text-ink-muted">This usually takes 15–30 seconds.</p>}
      </div>
    </div>
  );
};

// Top of the blog modal: cover preview, AI-draft notice, sources and a
// preview link, so a generated draft can be checked before publishing.
const BlogReview = ({ data }) => {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [data.coverImage]);
  const sources = Array.isArray(data.sources) ? data.sources : [];
  return (
    <div className="space-y-4">
      {data.coverImage && (
        <div className="overflow-hidden rounded-xl border border-border bg-chip aspect-[16/9] grid place-items-center">
          {broken ? (
            <span className="px-4 text-center text-xs text-ink-muted font-mono">Cover image didn't load. Paste another Cover Image URL below.</span>
          ) : (
            <img src={data.coverImage} alt="" className="h-full w-full object-cover" onError={() => setBroken(true)} />
          )}
        </div>
      )}
      {data.aiGenerated && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          <div className="flex items-center gap-2 font-medium"><Sparkles size={15} className="text-primary" /> AI-written draft</div>
          {data.aiMode === "evergreen" ? (
            <p className="mt-1 text-ink-muted">
              There wasn't enough recent coverage of this topic, so this is an <b>evergreen guide</b> written from general knowledge.
              Double-check facts, versions and code before you tick <b>Published</b> and save.
            </p>
          ) : (
            <p className="mt-1 text-ink-muted">Read it through and check the facts against the sources. Tick <b>Published</b> and save when it's ready.</p>
          )}
          {sources.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {sources.map((s) => (
                <li key={s.url} className="text-xs">
                  <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-start gap-1.5 text-primary hover:underline">
                    <ExternalLink size={12} className="mt-0.5 shrink-0" />
                    <span>{s.title} <span className="text-ink-muted">· {s.source}</span></span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {data._id && data.slug && (
        <a href={`/blog/${data.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline" data-testid="bf-preview">
          <ExternalLink size={14} /> Preview on the site{data.published ? "" : " (draft, visible only to you)"}
        </a>
      )}
    </div>
  );
};

const Input = ({ label, value, onChange, testid, type = "text" }) => (
  <div>
    <label className="block font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-ink-muted mb-1.5">{label}</label>
    <input type={type} autoComplete={type === "password" ? "new-password" : undefined} value={value ?? ""} onChange={(e) => onChange(e.target.value)} data-testid={testid} className="w-full rounded-lg bg-chip border border-border px-4 py-2.5 text-sm focus:border-primary outline-none transition-colors duration-200" />
  </div>
);

const UploadField = ({ label, accept, hint, busy, onPick, testid }) => (
  <label className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-chip/50 px-4 py-3 text-sm cursor-pointer hover:border-primary transition-colors duration-200">
    {busy ? <Loader2 size={16} className="animate-spin shrink-0" /> : <Upload size={16} className="shrink-0 text-ink-muted" />}
    <span className="flex-1">
      <span className="block">{label}</span>
      <span className="block font-mono text-[0.6875rem] text-ink-muted">{hint}</span>
    </span>
    <input
      type="file"
      accept={accept}
      className="hidden"
      data-testid={testid}
      disabled={busy}
      onChange={(e) => {
        const f = e.target.files?.[0];
        e.target.value = "";
        if (f) onPick(f);
      }}
    />
  </label>
);

const Textarea = ({ label, value, onChange, testid, rows = 3 }) => (
  <div>
    <label className="block font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-ink-muted mb-1.5">{label}</label>
    <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} rows={rows} data-testid={testid} className="w-full rounded-lg bg-chip border border-border px-4 py-2.5 text-sm focus:border-primary outline-none transition-colors duration-200 resize-none" />
  </div>
);

export default AdminDashboard;
