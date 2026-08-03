// Cloudflare Pages Function — handles the "News & Media submissions" form.
// Lives at /functions/api/media-submission.js; exposed automatically at
// /api/media-submission. Routes to social@ (Press & Social), since that's
// the department that owns the Newsroom and media use.
//
// Requires the same RESEND_API_KEY secret as contact.js — see setup notes.

const DESTINATION = "social@unipc.info";

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

  const { name, email, organization, submission_type, source_link, description, consent } = body;

  if (!name || !email || !submission_type || !source_link || !description) {
    return new Response(JSON.stringify({ error: "Missing required fields." }), { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: "Invalid email." }), { status: 400 });
  }
  if (!consent) {
    return new Response(JSON.stringify({ error: "Consent required." }), { status: 400 });
  }

  const typeLabel = { news: "News item", media: "Media — photo or video", other: "Other" }[submission_type] || submission_type;

  const html = `
    <h2>New news/media submission — UNIPC website</h2>
    <p><b>From:</b> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
    <p><b>Organization:</b> ${escapeHtml(organization) || "—"}</p>
    <p><b>Type:</b> ${escapeHtml(typeLabel)}</p>
    <p><b>Source / media link:</b> <a href="${escapeHtml(source_link)}">${escapeHtml(source_link)}</a></p>
    <p><b>Consent to verifiable-source / usage terms:</b> Yes</p>
    <hr>
    <p style="white-space:pre-wrap">${escapeHtml(description)}</p>
  `;

  const resendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "UNIPC Website <forms@unipc.info>",
      to: [DESTINATION],
      reply_to: email,
      subject: `[Website] New ${typeLabel.toLowerCase()} submission`,
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
