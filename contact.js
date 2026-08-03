// Cloudflare Pages Function — handles the "Reach the Secretariat" contact form.
// Lives at /functions/api/contact.js in the repo; Cloudflare automatically
// exposes it at the URL path /api/contact — no extra routing config needed.
//
// Requires one secret set in the Cloudflare Pages dashboard:
//   RESEND_API_KEY  — from resend.com, after verifying unipc.info as a sending domain.
// See the setup notes that came with this file for the exact steps.

const ALLOWED_DEPARTMENTS = new Set([
  "eosg@unipc.info",
  "secretariat@unipc.info",
  "jcac@unipc.info",
  "treaties@unipc.info",
  "irp@unipc.info",
  "otc@unipc.info",
  "oac@unipc.info",
  "osc@unipc.info",
  "membership@unipc.info",
  "social@unipc.info",
]);

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid submission." }), { status: 400 });
  }

  const {
    department, first_name, family_name, email,
    phone, indigenous_nation, state, message,
  } = body;

  // Server-side validation — never trust the client alone.
  if (!ALLOWED_DEPARTMENTS.has(department)) {
    return new Response(JSON.stringify({ error: "Unknown department." }), { status: 400 });
  }
  if (!first_name || !family_name || !email || !message) {
    return new Response(JSON.stringify({ error: "Missing required fields." }), { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: "Invalid email." }), { status: 400 });
  }

  const html = `
    <h2>New contact form submission — UNIPC website</h2>
    <p><b>Routed to:</b> ${escapeHtml(department)}</p>
    <p><b>From:</b> ${escapeHtml(first_name)} ${escapeHtml(family_name)} &lt;${escapeHtml(email)}&gt;</p>
    <p><b>Telephone:</b> ${escapeHtml(phone) || "—"}</p>
    <p><b>Indigenous Nation:</b> ${escapeHtml(indigenous_nation) || "—"}</p>
    <p><b>State:</b> ${escapeHtml(state) || "—"}</p>
    <hr>
    <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
  `;

  const resendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "UNIPC Website <forms@unipc.info>",
      to: [department],
      reply_to: email,
      subject: `[Website] New enquiry for ${department.split("@")[0]}`,
      html,
    }),
  });

  if (!resendRes.ok) {
    const errText = await resendRes.text();
    return new Response(JSON.stringify({ error: "Send failed", detail: errText }), { status: 502 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
