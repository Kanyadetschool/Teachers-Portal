// js/ai-widget.js
//
// Floating "Ask AI" button, top-right on every page that includes this
// script. Powered by the Gemini Developer API through Firebase AI Logic.
//
// Setup (one time):
//   1. In the Firebase Console → Build → AI Logic, set up the
//      "Gemini Developer API" backend for this project if you haven't
//      already — the widget will show a clear error until that's done.
//   Config: imported straight from ./js/firebaseConfig.js (same file
//   the rest of the site already uses) — nothing to fill in here.
//   Note: this widget must sit at the same relative depth as that file
//   (i.e. alongside a page that also does "./js/firebaseConfig.js").
//
// Usage (drop this one line near the end of <body> on any page):
//   <script type="module" src="./js/ai-widget.js"></script>
//
// Runs its own isolated Firebase app instance (named "ai-widget") on a
// newer Firebase SDK version than the rest of the site, so it does not
// touch or depend on whatever Firebase version/app your existing
// auth/Firestore code already initialized.

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app-check.js";
import { getAI, getGenerativeModel, GoogleAIBackend } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-ai.js";
import { firebaseConfig as firebaseConfigAI } from "./firebaseConfig.js";

// reCAPTCHA v3 site key, registered in Firebase Console → App Check → Apps.
// This is the public key — safe to ship in client code.
const RECAPTCHA_V3_SITE_KEY = "6LdLIHwtAAAAAF2kmB4fB00trs2PyrV-HgBRkCC7";

const AI_APP_NAME = "ai-widget";
const MODEL_NAME = "gemini-3.6-flash";

// Static facts about the school, pulled from the live site
// (kanyadet-school-portal.web.app). Keep this updated if any of these
// change - the model treats it as ground truth.
const SCHOOL_FACTS = `
School: Kanyadet Comprehensive School (also known as Kanyadet Primary & Junior School),
founded in 1970, located in Akala, Kenya.
Address: P.O Box 45 - 40139, Akala, Kenya.
Phone: +254 799 773 21
Email: kanyadetprischool@gmail.com
Facebook: web.facebook.com/kanyadetprischool

Site portals and where to find them:
- Teacher Portal (this site, kanyadet-school-portal.web.app) - the landing/marketing page
  for staff; the actual sign-in lives at kanyadet-school-admin.web.app/teachers.html
- Parents Portal - for parents/guardians (separate site: kanyadet-school-parents.web.app)
- Admins portal - admin sign-in and oversight (separate site: kanyadet-school-admin.web.app)
- Profile / Results Portal - staff results and profile access
- Rectitude - staff sign-in and professional documents
- Academics / Internal Results - internal results system
- Resources - digital learning content
- E-learn - links out to KEC (kec.ac.ke)
- Staff/teacher login also supports Google sign-in and a "request an account" flow that
  needs admin approval

What the Teacher Portal covers (six tools, one login, synced live with the school office):
- Gradebook - enter marks per subject; CBC-banded results are calculated automatically,
  no manual grade lookup
- Attendance - mark a class present/absent/late in under a minute; same roll the office
  and parents both see
- Timetable - see exactly where a teacher is meant to be, period by period
- Class welfare - flag a pupil needing follow-up (e.g. lunch contribution gaps,
  wellbeing notes), routed straight to the office
- Announcements - staff notices and term dates in one feed
- Staff profiles - each teacher's classes, subjects and contact details

How teachers sign in (three steps): 1) sign in with the email/password the admin office
set up (a forgotten password is reset by the admin office, not self-service); 2) assigned
classes and subjects load automatically; 3) mark attendance, enter scores, or check the
timetable - each saves straight to the school's records. The portal works fine in any
mobile browser, no app install required, though an "Install app" option is offered.
Parents only ever see their own child's grades/attendance/notices, never the whole class.
Anything that looks wrong should be flagged via the portal's welfare/flag tool or reported
straight to the admin office.

CBC grading scale used across the portal (score -> level -> points -> meaning):
90-100 EE1 (8.0) Exceeding Expectation (Highest); 75-89.9 EE2 (7.0) Exceeding Expectation;
58-74.9 ME1 (6.0) Meeting Expectation (Upper); 41-57.9 ME2 (5.0) Meeting Expectation (Lower);
31-40.9 AE1 (4.0) Approaching Expectation; 21-30.9 AE2 (3.0) Approaching Expectation;
11-20.9 BE1 (2.0) Below Expectation; 1-10.9 BE2 (1.0) Below Expectation.

Data handling: every change made inside the portal (a score entered, a record edited, an
account updated) is written to an audit log with who made it and when. The public landing
page itself never writes to the school's database - the calendar/announcements shown there
are read-only, and anything sensitive (like the staff roster) stays locked behind sign-in.

Admissions: handled via the Admissions page on the site, which links to a separate
online application form for each grade/level. Direct anyone asking about admissions
to the Admissions page so they pick the correct form for their child's level.
There are no published fee amounts on the site - if asked about fees, say you don't
have that figure and point them to the school contacts above.

The homepage also posts circulars and notices (term dates, KNEC/KPSEA/KJSEA
assessment info, capture-scores windows, timetabling guidelines, etc.) - these
change over time, so for anything date-specific, point people to the notices/
circulars on the homepage rather than guessing a date.

Staff directory - full profile per teacher (all Active). When someone asks about a specific
teacher by name, or "who teaches X", answer using their full profile (role + subject/class),
not just a one-line mention.

Teacher: Geofrey Onyango
Role: Advanced Admin
Subject(s)/Class: Maths

Teacher: Oduor Geofrey
Role: Advanced Admin
Subject(s)/Class: not listed

Teacher: Ouma Stephen
Role: Advanced Admin
Subject(s)/Class: Mathematics

Teacher: Jackline Opiyo
Role: Teacher
Subject(s)/Class: Grade 1

Teacher: Lydia Stanley
Role: Teacher
Subject(s)/Class: Class teacher

Teacher: Md Vallary
Role: Teacher
Subject(s)/Class: Grade 4, Grade 5, Grade 6

Teacher: Beryl Atieno
Role: Teacher
Subject(s)/Class: Maths, Business Studies (BS)

Teacher: Vincent Lichuma
Role: Teacher
Subject(s)/Class: Kiswahili

Teacher: Janet Oluoch
Role: Teacher
Subject(s)/Class: Kiswahili, CRE

Teacher: Jerry Owuor
Role: Teacher
Subject(s)/Class: English

Teacher: Vivien Kemunto
Role: Teacher
Subject(s)/Class: English, Literature

Teacher: Francis Olum
Role: Teacher
Subject(s)/Class: Mathematics, Chemistry

Teacher: Eunice Atieno
Role: Teacher
Subject(s)/Class: English, CAS

If someone asks for a teacher's personal contact (phone/email), don't give one - direct them
to the school office contacts above instead. Don't invent details (tenure, qualifications,
photos, bios) that aren't listed here.

Partner bodies referenced on the site: TSC (Teachers Service Commission),
KNEC (Kenya National Examination Council), and KICD/MOE (Kenya Institute of
Curriculum Development).
`.trim();

function buildSystemInstruction() {
  // Pages can optionally set this before the widget script loads, e.g.
  //   <script>window.AI_WIDGET_PAGE_CONTEXT = "Staff/teacher login page";</script>
  // to give a clearer hint than the raw document title.
  const pageHint = (typeof window !== "undefined" && window.AI_WIDGET_PAGE_CONTEXT)
    || document.title
    || "";
  const pageLine = pageHint
    ? `\n\nThe visitor is currently on this page: "${pageHint}" (${location.pathname}). Tailor help to that page when relevant, e.g. if they're on the login page, help with signing in rather than general admissions info.`
    : "";

  return (
    "You are the helpful AI assistant embedded on the Kanyadet Comprehensive School (Kanyadet " +
    "Primary & Junior School) website. Answer clearly and concisely, using the facts below. " +
    "If asked something you can't verify from these facts (like a specific student's record, " +
    "results, fees, or account details), say you can't access that and point them to the " +
    "relevant staff/admin or the contacts below instead of guessing.\n\n" +
    SCHOOL_FACTS +
    pageLine
  );
}

(function injectStyles() {
  const css = `
    #aiWidgetBtn {
      position: fixed;
      bottom: 90px;
      left: 5px;
      z-index: 999998;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      background: linear-gradient(145deg, #e0ac4f, #c17f28);
      box-shadow: 0 8px 20px rgba(155,105,30,.4), inset 0 1px 0 rgba(255,255,255,.25);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform .18s cubic-bezier(.34,1.56,.64,1), box-shadow .18s ease;
    }
    #aiWidgetBtn:hover { transform: scale(1.08) rotate(-4deg); box-shadow: 0 10px 26px rgba(155,105,30,.5), inset 0 1px 0 rgba(255,255,255,.3); }
    #aiWidgetBtn:active { transform: scale(.96); }
    #aiWidgetBtn i { color: #fff; font-size: 19px; filter: drop-shadow(0 1px 1px rgba(0,0,0,.15)); }
    #aiWidgetBtn .aiw-dot {
      position: absolute; top: 1px; right: 1px;
      width: 11px; height: 11px; border-radius: 50%;
      background: #2fa96b; border: 2.5px solid #fffdf8;
    }

    #aiWidgetPanel {
      position: fixed;
      top: 84px;
      left: 20px;
      z-index: 999999;
      width: 350px;
      max-width: calc(100vw - 32px);
      height: 480px;
      max-height: calc(100vh - 110px);
      background: rgba(255,253,249,.92);
      backdrop-filter: blur(14px) saturate(1.1);
      -webkit-backdrop-filter: blur(14px) saturate(1.1);
      border: 1px solid rgba(193,127,40,.22);
      border-radius: 18px;
      box-shadow: 0 24px 60px rgba(43,26,16,.24), 0 2px 8px rgba(43,26,16,.08);
      display: none;
      flex-direction: column;
      overflow: hidden;
      font-family: 'Inter', -apple-system, sans-serif;
      transform-origin: top left;
    }
    #aiWidgetPanel.open { display: flex; animation: aiw-in .2s cubic-bezier(.2,.9,.3,1); }
    @keyframes aiw-in { from { opacity: 0; transform: scale(.97) translateY(-6px); } to { opacity: 1; transform: scale(1) translateY(0); } }

    #aiWidgetPanel .aiw-header {
      position: relative;
      overflow: hidden;
      padding: 13px 14px;
      background: linear-gradient(155deg, #fbf3e8, #f5e6d0);
      border-bottom: 1px solid rgba(193,127,40,.2);
      display: flex; align-items: center; gap: 9px;
    }
    #aiWidgetPanel .aiw-header::after {
      content: ""; position: absolute; top: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, transparent, #e0ac4f 35%, #fff2d2 50%, #e0ac4f 65%, transparent);
      background-size: 220% 100%;
      animation: aiw-shimmer 3.2s linear infinite;
    }
    @keyframes aiw-shimmer { 0% { background-position: 220% 0; } 100% { background-position: -220% 0; } }
    #aiWidgetPanel .aiw-header-icon {
      width: 26px; height: 26px; border-radius: 8px; flex-shrink: 0;
      background: #fff; border: 1px solid rgba(193,127,40,.25);
      display: flex; align-items: center; justify-content: center;
      overflow: hidden; padding: 3px;
    }
    #aiWidgetPanel .aiw-header-icon img { width: 100%; height: 100%; object-fit: contain; }
    #aiWidgetPanel .aiw-header-text { flex: 1; min-width: 0; }
    #aiWidgetPanel .aiw-header-text .aiw-title {
      font-family: 'Space Grotesk','Inter',sans-serif;
      font-weight: 600; font-size: 14px; letter-spacing: .1px; color: #2b1a10; display: block;
    }
    #aiWidgetPanel .aiw-header-text .aiw-subtitle {
      font-size: 11px; color: #8a7256; display: flex; align-items: center; gap: 5px; margin-top: 2px;
    }
    #aiWidgetPanel .aiw-status-dot {
      width: 6px; height: 6px; border-radius: 50%; background: #2fa96b; flex-shrink: 0;
      animation: aiw-status-pulse 2s ease-out infinite;
    }
    @keyframes aiw-status-pulse {
      0% { box-shadow: 0 0 0 0 rgba(47,169,107,.5); }
      70% { box-shadow: 0 0 0 5px rgba(47,169,107,0); }
      100% { box-shadow: 0 0 0 0 rgba(47,169,107,0); }
    }
    #aiWidgetPanel .aiw-close {
      background: none; border: none; cursor: pointer; color: #8a7256; font-size: 15px;
      padding: 5px; border-radius: 7px; flex-shrink: 0; line-height: 1;
      transition: background .12s ease, color .12s ease;
    }
    #aiWidgetPanel .aiw-close:hover { color: #2b1a10; background: rgba(193,127,40,.12); }

    .aiw-register {
      display: none; flex-direction: column; gap: 10px; padding: 16px 14px;
      flex: 1; min-height: 0; overflow-y: auto;
    }
    .aiw-register p { font-size: 12.5px; color: #6b5636; line-height: 1.5; margin: 0 0 2px 0; }
    .aiw-register form { display: flex; flex-direction: column; gap: 8px; }
    .aiw-register label {
      font-size: 12px; font-weight: 600; color: #6b5636;
      margin-bottom: -4px;
    }
    .aiw-register input {
      border: 1.5px solid rgba(193,127,40,.25); border-radius: 10px;
      padding: 9px 11px; font-family: inherit; font-size: 13.5px; outline: none;
      background: #fff; transition: border-color .12s ease, box-shadow .12s ease;
    }
    .aiw-register input:focus { border-color: #c17f28; box-shadow: 0 0 0 3px rgba(193,127,40,.12); }
    .aiw-register-error { font-size: 12px; color: #a83226; display: none; }
    .aiw-register-error.show { display: block; }
    .aiw-register button {
      margin-top: 4px; border: none; border-radius: 11px; padding: 10px 15px;
      background: linear-gradient(150deg, #cf9337, #b97c28); color: #fff;
      font-weight: 600; font-size: 13.5px; cursor: pointer; transition: filter .12s ease, transform .1s ease;
    }
    .aiw-register button:hover { filter: brightness(1.06); }
    .aiw-register button:active { transform: scale(.98); }

    .aiw-chat { display: flex; flex-direction: column; flex: 1; min-height: 0; }

    #aiWidgetMessages {
      flex: 1; min-height: 0; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 12px;
      background:
        radial-gradient(circle at 100% 0%, rgba(224,172,79,.05), transparent 55%);
      scrollbar-width: thin;
      scrollbar-color: rgba(193,127,40,.3) transparent;
    }
    #aiWidgetMessages::-webkit-scrollbar { width: 6px; }
    #aiWidgetMessages::-webkit-scrollbar-track { background: transparent; }
    #aiWidgetMessages::-webkit-scrollbar-thumb { background: rgba(193,127,40,.28); border-radius: 3px; }
    #aiWidgetMessages::-webkit-scrollbar-thumb:hover { background: rgba(193,127,40,.45); }

    .aiw-row.grouped { margin-top: -6px; }
    .aiw-row.grouped .aiw-avatar { visibility: hidden; }
    .aiw-row { display: flex; align-items: flex-end; gap: 8px; max-width: 92%; animation: aiw-msg-in .22s cubic-bezier(.2,.9,.3,1) both; }
    @keyframes aiw-msg-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    .aiw-row.user { flex-direction: row-reverse; align-self: flex-end; }
    .aiw-row.bot { align-self: flex-start; }
    .aiw-avatar {
      width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      overflow: hidden;
    }
    .aiw-avatar.bot { background: #fff; border: 1px solid rgba(193,127,40,.25); padding: 3px; }
    .aiw-avatar.bot img { width: 100%; height: 100%; object-fit: contain; }
    .aiw-avatar.bot.active { animation: aiw-avatar-pulse 1.6s ease-out infinite; }
    @keyframes aiw-avatar-pulse {
      0% { box-shadow: 0 0 0 0 rgba(193,127,40,.4); }
      70% { box-shadow: 0 0 0 8px rgba(193,127,40,0); }
      100% { box-shadow: 0 0 0 0 rgba(193,127,40,0); }
    }
    .aiw-avatar.user { background: linear-gradient(150deg, #cf9337, #b97c28); color: #fff; font-size: 11px; }
    .aiw-msg { font-size: 13.5px; line-height: 1.6; min-width: 0; padding: 10px 13px; border-radius: 15px; white-space: pre-wrap; word-wrap: break-word; }
    .aiw-msg.user { background: linear-gradient(150deg, #cf9337, #b97c28); color: #fff; border-bottom-right-radius: 4px; box-shadow: 0 2px 8px rgba(185,124,40,.28); }
    .aiw-msg.bot {
      position: relative;
      background: #fffcf7; color: #2b1a10; border-bottom-left-radius: 4px;
      border: 1px solid rgba(193,127,40,.14); box-shadow: 0 1px 2px rgba(43,26,16,.04), 0 3px 10px rgba(43,26,16,.05);
      transition: box-shadow .18s ease, transform .18s ease;
    }
    .aiw-msg.bot:hover { box-shadow: 0 4px 18px rgba(43,26,16,.1), 0 1px 3px rgba(43,26,16,.06); transform: translateY(-1px); }
    .aiw-copy-btn {
      position: absolute; top: 6px; right: 6px; width: 22px; height: 22px; border-radius: 7px;
      border: none; background: rgba(193,127,40,.08); color: #8a7256; cursor: pointer;
      display: flex; align-items: center; justify-content: center; font-size: 10px;
      opacity: 0; transform: translateY(-2px);
      transition: opacity .15s ease, transform .15s ease, background .15s ease, color .15s ease;
    }
    .aiw-msg.bot:hover .aiw-copy-btn { opacity: 1; transform: translateY(0); }
    .aiw-copy-btn:hover { background: rgba(193,127,40,.18); color: #2b1a10; }
    .aiw-msg.bot p { margin: 0 0 8px 0; }
    .aiw-msg.bot p:last-child { margin-bottom: 0; }
    .aiw-msg.bot strong { font-weight: 700; color: #211307; }
    .aiw-msg.bot a { color: #a6631f; font-weight: 600; text-decoration: underline; text-decoration-color: rgba(166,99,31,.4); text-underline-offset: 2px; }
    .aiw-msg.bot a:hover { text-decoration-color: rgba(166,99,31,.9); }
    .aiw-msg.err { background: rgba(192,57,43,.06); color: #a83226; border: 1px solid rgba(192,57,43,.22); box-shadow: none; }

    .aiw-typing { display: inline-flex; align-items: center; gap: 4px; padding: 2px 0; }
    .aiw-typing span {
      width: 6px; height: 6px; border-radius: 50%; background: #c17f28; opacity: .35;
      animation: aiw-typing-bounce 1.1s ease-in-out infinite;
    }
    .aiw-typing span:nth-child(2) { animation-delay: .15s; }
    .aiw-typing span:nth-child(3) { animation-delay: .3s; }
    @keyframes aiw-typing-bounce {
      0%, 60%, 100% { opacity: .35; transform: translateY(0); }
      30% { opacity: 1; transform: translateY(-3px); }
    }

    #aiWidgetForm { display: flex; align-items: flex-end; gap: 8px; padding: 11px; border-top: 1px solid rgba(193,127,40,.18); background: rgba(255,253,249,.7); }
    #aiWidgetInput {
      flex: 1; resize: none; border: 1.5px solid rgba(193,127,40,.22); border-radius: 20px;
      padding: 9px 14px; font-family: inherit; font-size: 13.5px; outline: none; max-height: 80px;
      background: #fff; transition: border-color .12s ease, box-shadow .12s ease;
    }
    #aiWidgetInput:focus { border-color: #c17f28; box-shadow: 0 0 0 3px rgba(193,127,40,.12); }
    #aiWidgetSend {
      border: none; border-radius: 50%; width: 36px; height: 36px; flex-shrink: 0;
      background: linear-gradient(150deg, #cf9337, #b97c28); color: #fff;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; font-size: 13px; transition: filter .12s ease, transform .1s ease;
      box-shadow: 0 2px 8px rgba(185,124,40,.3);
    }
    #aiWidgetSend:hover:not(:disabled) { filter: brightness(1.06); transform: scale(1.04); }
    #aiWidgetSend:active:not(:disabled) { transform: scale(.94); }
    #aiWidgetSend:disabled { opacity: .5; cursor: not-allowed; }
    #aiWidgetSend i { transition: transform .18s ease; }
    #aiWidgetSend:hover:not(:disabled) i { transform: rotate(-10deg) translateX(1px); }
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
})();

function injectMarkup() {
  const btn = document.createElement("button");
  btn.id = "aiWidgetBtn";
  btn.type = "button";
  btn.title = "Ask AI";
  btn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i><span class="aiw-dot"></span>`;
  document.body.appendChild(btn);

  const panel = document.createElement("div");
  panel.id = "aiWidgetPanel";
  panel.innerHTML = `
    <div class="aiw-header">
      <div class="aiw-header-icon"><img src="./images/logo.png" alt="School logo" /></div>
      <div class="aiw-header-text">
        <span class="aiw-title">Ask AI</span>
        <span class="aiw-subtitle"><span class="aiw-status-dot"></span>Online · Kanyadet Teacher Portal</span>
      </div>
      <button type="button" class="aiw-close" aria-label="Close">✕</button>
    </div>
    <div id="aiWidgetRegister" class="aiw-register">
      <p>Quick details before we chat — so the school can follow up with you if needed.</p>
      <form id="aiWidgetRegisterForm">
        <label for="aiwRegName">Full name</label>
        <input id="aiwRegName" type="text" placeholder="e.g. Jane Wanjiru" autocomplete="name" required />
        <label for="aiwRegEmail">Email address</label>
        <input id="aiwRegEmail" type="email" placeholder="e.g. jane@example.com" autocomplete="email" required />
        <label for="aiwRegPhone">Phone number</label>
        <input id="aiwRegPhone" type="tel" placeholder="e.g. 0712 345 678" autocomplete="tel" required />
        <span class="aiw-register-error" id="aiwRegError">Please fill in all three fields.</span>
        <button type="submit">Start chat</button>
      </form>
    </div>
    <div id="aiWidgetChat" class="aiw-chat">
      <div id="aiWidgetMessages"></div>
      <form id="aiWidgetForm">
        <textarea id="aiWidgetInput" rows="1" placeholder="Ask a question..."></textarea>
        <button id="aiWidgetSend" type="submit" aria-label="Send message"><i class="fa-solid fa-paper-plane"></i></button>
      </form>
    </div>
  `;
  document.body.appendChild(panel);

  return { btn, panel };
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Minimal markdown -> HTML for AI responses: **bold**, [text](url) links,
// and paragraph/line breaks. Escapes raw HTML first so nothing from the
// model can inject markup other than these two patterns.
function renderMarkdown(text) {
  let html = escapeHtml(text);

  // [label](url) -> safe link, http/https only, opens in a new tab.
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_, label, url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  });

  // **bold**
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  // Blank line = paragraph break, single newline = line break.
  html = html
    .split(/\n{2,}/)
    .map(block => block.replace(/\n/g, "<br>"))
    .join("</p><p>");

  return `<p>${html}</p>`;
}

function addMessage(container, text, cls, opts = {}) {
  const isUser = cls === "user";

  const row = document.createElement("div");
  row.className = "aiw-row " + (isUser ? "user" : "bot") + (opts.grouped ? " grouped" : "");

  const avatar = document.createElement("div");
  avatar.className = "aiw-avatar " + (isUser ? "user" : "bot") + (opts.typing ? " active" : "");
  avatar.innerHTML = isUser
    ? `<i class="fa-solid fa-user"></i>`
    : `<img src="./images/logo.png" alt="School logo" />`;

  const bubble = document.createElement("div");
  bubble.className = "aiw-msg " + cls;

  const content = document.createElement("div");
  content.className = "aiw-msg-content";
  if (opts.typing) {
    content.innerHTML = `<span class="aiw-typing"><span></span><span></span><span></span></span>`;
  } else if (cls === "bot") {
    content.innerHTML = renderMarkdown(text);
  } else {
    content.textContent = text;
  }
  bubble.appendChild(content);

  if (cls === "bot") {
    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "aiw-copy-btn";
    copyBtn.setAttribute("aria-label", "Copy response");
    copyBtn.innerHTML = `<i class="fa-regular fa-copy"></i>`;
    copyBtn.addEventListener("click", () => {
      const plain = content.innerText || content.textContent || "";
      if (!navigator.clipboard?.writeText) return;
      navigator.clipboard.writeText(plain).then(() => {
        copyBtn.innerHTML = `<i class="fa-solid fa-check"></i>`;
        setTimeout(() => { copyBtn.innerHTML = `<i class="fa-regular fa-copy"></i>`; }, 1200);
      }).catch(() => {});
    });
    bubble.appendChild(copyBtn);
  }

  row.appendChild(avatar);
  row.appendChild(bubble);
  container.appendChild(row);
  container.scrollTop = container.scrollHeight;
  bubble._content = content;
  bubble._avatar = avatar;
  return bubble;
}

async function initModel() {
  const isNewApp = !getApps().some(a => a.name === AI_APP_NAME);
  const app = isNewApp ? initializeApp(firebaseConfigAI, AI_APP_NAME) : getApp(AI_APP_NAME);

  if (isNewApp) {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(RECAPTCHA_V3_SITE_KEY),
      isTokenAutoRefreshEnabled: true
    });
  }

  const ai = getAI(app, { backend: new GoogleAIBackend() });
  return getGenerativeModel(ai, { model: MODEL_NAME, systemInstruction: buildSystemInstruction() });
}

// WhatsApp number the registration form sends new contacts to, wa.me format
// (country code + number, no "+", no spaces). Update here if it ever changes.
const REGISTER_WHATSAPP_NUMBER = "254769106047";
const REGISTER_STORAGE_KEY = "aiWidgetContact";

function getSavedContact() {
  try {
    const raw = localStorage.getItem(REGISTER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveContact(contact) {
  try {
    localStorage.setItem(REGISTER_STORAGE_KEY, JSON.stringify(contact));
  } catch {
    // Storage unavailable (private browsing etc.) - registration just won't
    // persist across visits, which is fine, not fatal.
  }
}

function setupWidget() {
  const { btn, panel } = injectMarkup();
  const registerView = panel.querySelector("#aiWidgetRegister");
  const registerForm = panel.querySelector("#aiWidgetRegisterForm");
  const registerError = panel.querySelector("#aiwRegError");
  const nameInput = panel.querySelector("#aiwRegName");
  const emailInput = panel.querySelector("#aiwRegEmail");
  const phoneInput = panel.querySelector("#aiwRegPhone");
  const chatView = panel.querySelector("#aiWidgetChat");
  const messages = panel.querySelector("#aiWidgetMessages");
  const form = panel.querySelector("#aiWidgetForm");
  const input = panel.querySelector("#aiWidgetInput");
  const sendBtn = panel.querySelector("#aiWidgetSend");
  const closeBtn = panel.querySelector(".aiw-close");

  let modelPromise = null;
  let chat = null;
  let greeted = false;
  let lastSide = null;

  function nextGrouped(cls) {
    const side = cls === "user" ? "user" : "bot";
    const grouped = lastSide === side;
    lastSide = side;
    return grouped;
  }

  function showChat() {
    registerView.style.display = "none";
    chatView.style.display = "flex";
  }

  function showRegister() {
    chatView.style.display = "none";
    registerView.style.display = "flex";
  }

  function greetIfNeeded() {
    if (!greeted) {
      addMessage(messages, "Hi! Ask me anything about using this site.", "bot", { grouped: nextGrouped("bot") });
      greeted = true;
    }
  }

  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!name || !email || !phone) {
      registerError.classList.add("show");
      return;
    }
    registerError.classList.remove("show");

    const waText = encodeURIComponent(
      `New Ask AI registration:\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nPage: ${location.href}`
    );
    window.open(`https://wa.me/${REGISTER_WHATSAPP_NUMBER}?text=${waText}`, "_blank", "noopener");

    saveContact({ name, email, phone });
    showChat();
    greetIfNeeded();
    input.focus();
  });

  btn.addEventListener("click", () => {
    panel.classList.toggle("open");
    if (panel.classList.contains("open")) {
      if (getSavedContact()) {
        showChat();
        greetIfNeeded();
        input.focus();
      } else {
        showRegister();
        nameInput.focus();
      }
    }
  });
  closeBtn.addEventListener("click", () => panel.classList.remove("open"));

  document.addEventListener("click", (e) => {
    if (!panel.classList.contains("open")) return;
    if (panel.contains(e.target) || btn.contains(e.target)) return;
    panel.classList.remove("open");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("open")) {
      panel.classList.remove("open");
      btn.focus();
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    addMessage(messages, text, "user", { grouped: nextGrouped("user") });
    input.value = "";
    sendBtn.disabled = true;
    const thinkingEl = addMessage(messages, "", "bot", { typing: true, grouped: nextGrouped("bot") });

    try {
      if (!modelPromise) modelPromise = initModel();
      const model = await modelPromise;
      if (!chat) chat = model.startChat();

      const result = await chat.sendMessageStream(text);
      let raw = "";
      thinkingEl._content.textContent = "";
      for await (const chunk of result.stream) {
        raw += chunk.text();
        thinkingEl._content.textContent = raw;
        messages.scrollTop = messages.scrollHeight;
      }
      thinkingEl._content.innerHTML = raw ? renderMarkdown(raw) : "(no response)";
      thinkingEl._avatar.classList.remove("active");
    } catch (err) {
      console.warn("[ai-widget] request failed:", err);
      thinkingEl.closest(".aiw-row")?.remove();
      lastSide = "user";
      addMessage(
        messages,
        "Sorry, something went wrong reaching the AI. Make sure the Gemini Developer API is enabled for this Firebase project.",
        "err",
        { grouped: nextGrouped("bot") }
      );
    } finally {
      sendBtn.disabled = false;
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupWidget);
} else {
  setupWidget();
}