import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowUpRight, CheckCircle2, Loader2 } from "lucide-react";
import { SectionLabel, SplitReveal, EASE_OUT } from "../editorial";
import api from "../../lib/api";
import { useSite } from "../../context/SiteContext";
import { LINKS, WEB3FORMS_KEY } from "../../utils/links";

const schema = z.object({
  name: z.string().trim().min(2, "Please tell me your name (at least 2 characters)."),
  email: z.string().trim().min(1, "I need your email to reply.").email("That email doesn't look right."),
  subject: z.string().trim().max(120, "Keep the subject under 120 characters.").optional(),
  message: z
    .string()
    .trim()
    .min(10, "A little more detail, please (at least 10 characters).")
    .max(5000, "Please keep it under 5000 characters."),
});

const initial = { name: "", email: "", subject: "", message: "" };

// Inline error under a field; announced to screen readers.
const FieldError = ({ id, message }) => (
  <AnimatePresence initial={false}>
    {message && (
      <motion.p
        key={message}
        id={id}
        role="alert"
        initial={{ opacity: 0, height: 0, y: -4 }}
        animate={{ opacity: 1, height: "auto", y: 0 }}
        exit={{ opacity: 0, height: 0, y: -4 }}
        transition={{ duration: 0.25, ease: EASE_OUT }}
        className="flex items-center gap-2 overflow-hidden pt-3 text-sm font-medium text-rose-500"
      >
        <AlertCircle size={15} className="shrink-0" />
        {message}
      </motion.p>
    )}
  </AnimatePresence>
);

const Field = ({ n, label, name, register, error, type = "text", textarea, testid, placeholder, optional }) => {
  const errId = `contact-${name}-error`;
  const common = {
    ...register(name),
    "aria-invalid": error ? "true" : "false",
    "aria-describedby": error ? errId : undefined,
    "data-testid": testid,
    placeholder,
    className: "mt-3 w-full bg-transparent text-xl md:text-2xl font-medium tracking-[-0.02em] text-ink placeholder:text-ink-muted outline-none",
  };
  return (
    <label
      className={`group block border-b py-6 transition-colors duration-500 ${
        error ? "border-rose-500" : "border-border focus-within:border-primary"
      }`}
    >
      <span className="flex items-baseline gap-4 label text-ink-muted">
        <span className={error ? "text-rose-500" : "text-ink"}>({n})</span> {label}
        {optional && <span className="ml-auto normal-case tracking-normal">optional</span>}
      </span>
      {textarea ? <textarea rows={3} {...common} className={`${common.className} resize-none`} /> : <input type={type} {...common} />}
      <FieldError id={errId} message={error?.message} />
    </label>
  );
};

const Notice = ({ tone, title, children, testid }) => {
  const ok = tone === "success";
  const Icon = ok ? CheckCircle2 : AlertCircle;
  return (
    <motion.div
      role={ok ? "status" : "alert"}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: EASE_OUT }}
      className={`mt-8 flex items-start gap-3 rounded-2xl border px-5 py-4 text-sm ${
        ok ? "border-emerald-500/40 bg-emerald-500/10" : "border-rose-500/40 bg-rose-500/10"
      }`}
      data-testid={testid}
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${ok ? "text-emerald-500" : "text-rose-500"}`} />
      <div>
        <div className="font-semibold text-ink">{title}</div>
        <div className="mt-0.5 text-ink-muted">{children}</div>
      </div>
    </motion.div>
  );
};

/*
 * Email notification through Web3Forms (free plan: must be sent from the
 * browser). Runs after the message is safely stored; its outcome, including
 * Web3Forms' own error text, is saved on the message so the admin dashboard
 * shows whether the email actually went out.
 */
const notifyByEmail = async (data, messageId, accessKey) => {
  let ok = false;
  let error = "";
  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: accessKey || WEB3FORMS_KEY,
        name: data.name,
        email: data.email,
        replyto: data.email,
        subject: `Portfolio: ${data.subject || "New message"} (from ${data.name})`,
        message: data.message,
        from_name: "Mohan's Portfolio",
      }),
    });
    const body = await res.json().catch(() => ({}));
    ok = res.ok && body.success === true;
    if (!ok) error = body.message || `HTTP ${res.status}`;
  } catch (err) {
    error = err?.message || "Network error";
  }
  if (!ok) console.warn("[contact] email notification failed:", error);
  if (messageId) api.patch(`/messages/${messageId}/email`, { ok, error }).catch(() => {});
};

const Contact = () => {
  // The key set in Admin → Settings decides which inbox gets the email.
  const { settings } = useSite();
  const [status, setStatus] = useState("idle"); // idle | success | error
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initial,
    mode: "onTouched", // first check when a field is left, then live while it is fixed
  });

  const onSubmit = async (data) => {
    setStatus("idle");
    setServerError("");
    try {
      // Persist to our own Express + MongoDB backend — this is the source of truth.
      const { data: saved } = await api.post("/messages", data);
      setStatus("success");
      reset(initial);
      setTimeout(() => setStatus("idle"), 5000);
      notifyByEmail(data, saved?.id, settings?.web3formsKey);
    } catch (err) {
      setStatus("error");
      setServerError(err?.response?.data?.message || "Something went wrong while sending. Please try again or email me directly.");
    }
  };

  const errorCount = Object.keys(errors).length;

  return (
    <section id="contact" className="relative py-20 md:py-28" data-testid="contact-section">
      <div className="wrap">
        <SectionLabel index="07" right="Reply within 24h">Contact</SectionLabel>

        <div className="mt-12 md:mt-16 grid grid-cols-12 gap-x-6 gap-y-14">
          <div className="col-span-12 lg:col-span-5">
            <SplitReveal className="title-xl text-[clamp(2.2rem,5.6cqi,7rem)]">
              Tell me about your <span className="text-gradient">project.</span>
            </SplitReveal>
            <div className="mt-12 space-y-6">
              <a href={`mailto:${LINKS.email}`} className="group block" data-testid="contact-email-link">
                <div className="label text-ink-muted">Email</div>
                <div className="mt-2 text-xl md:text-2xl font-medium">
                  <span className="u-link pb-0.5">{LINKS.email}</span>
                </div>
              </a>
              <div>
                <div className="label text-ink-muted">Location</div>
                <div className="mt-2 text-xl md:text-2xl font-medium">India, available remotely</div>
              </div>
              <div className="flex gap-6 label">
                <a href={LINKS.github} target="_blank" rel="noreferrer" className="u-link hover:text-primary">GitHub ↗</a>
                <a href={LINKS.linkedin} target="_blank" rel="noreferrer" className="u-link hover:text-primary">LinkedIn ↗</a>
              </div>
            </div>
          </div>

          <motion.form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: EASE_OUT }}
            className="col-span-12 lg:col-span-7"
            data-testid="contact-form"
          >
            <div className="border-t border-strong">
              <Field n="01" label="What's your name?" name="name" register={register} error={errors.name} testid="contact-name" placeholder="Jane Doe" />
              <Field n="02" label="Your email" name="email" type="email" register={register} error={errors.email} testid="contact-email" placeholder="jane@company.com" />
              <Field n="03" label="Subject" name="subject" register={register} error={errors.subject} testid="contact-subject" placeholder="A new product, a role, an idea…" optional />
              <Field n="04" label="Your message" name="message" register={register} error={errors.message} textarea testid="contact-message" placeholder="Tell me about it…" />
            </div>

            <AnimatePresence mode="wait">
              {errorCount > 0 ? (
                <Notice key="invalid" tone="error" title={`Please fix ${errorCount} field${errorCount > 1 ? "s" : ""} above`} testid="contact-error">
                  Each one is marked in red with what&apos;s missing.
                </Notice>
              ) : status === "error" ? (
                <Notice key="failed" tone="error" title="Message not sent" testid="contact-error">
                  {serverError}
                </Notice>
              ) : status === "success" ? (
                <Notice key="sent" tone="success" title="Thanks, your message is in." testid="contact-success">
                  I usually reply within 24 hours.
                </Notice>
              ) : null}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group mt-10 inline-flex items-center gap-4 rounded-full bg-grad px-8 py-4 text-lg font-semibold text-white disabled:opacity-70"
              data-testid="contact-submit"
            >
              {isSubmitting ? "Sending…" : status === "success" ? "Message sent" : "Send message"}
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-black transition-transform duration-500 group-hover:rotate-45">
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : status === "success" ? <CheckCircle2 size={16} /> : <ArrowUpRight size={16} />}
              </span>
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
