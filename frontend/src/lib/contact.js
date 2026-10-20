import { z } from "zod";
import api from "./api";
import { WEB3FORMS_KEY } from "../utils/links";

// Shared by both site versions' contact forms.
export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please tell me your name (at least 2 characters)."),
  email: z.string().trim().min(1, "I need your email to reply.").email("That email doesn't look right."),
  subject: z.string().trim().max(120, "Keep the subject under 120 characters.").optional(),
  message: z
    .string()
    .trim()
    .min(10, "A little more detail, please (at least 10 characters).")
    .max(5000, "Please keep it under 5000 characters."),
});

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

/**
 * Store the message in our own Express + MongoDB backend (the source of
 * truth), then send the email notification in the background. Throws with a
 * readable message if the message could not be stored.
 */
export const sendContactMessage = async (data, accessKey) => {
  try {
    const { data: saved } = await api.post("/messages", data);
    notifyByEmail(data, saved?.id, accessKey);
    return saved;
  } catch (err) {
    throw new Error(err?.response?.data?.message || "Something went wrong while sending. Please try again or email me directly.");
  }
};
