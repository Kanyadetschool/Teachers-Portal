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
- Parents Portal - for parents/guardians (separate site: kanyadet-school-parents.web.app)
- Profile / Results Portal - staff results and profile access
- Rectitude - staff sign-in and professional documents
- Academics / Internal Results - internal results system
- Resources - digital learning content
- E-learn - links out to KEC (kec.ac.ke)
- Admins - admin portal (separate site: kanyadet-school-admin.web.app)
- Staff/teacher login (this site's login page) - for teacher and admin accounts, includes
  Google sign-in and a "request an account" flow that needs admin approval

Admissions: handled via the Admissions page on the site, which links to a separate
online application form for each grade/level. Direct anyone asking about admissions
to the Admissions page so they pick the correct form for their child's level.
There are no published fee amounts on the site - if asked about fees, say you don't
have that figure and point them to the school contacts above.

The homepage also posts circulars and notices (term dates, KNEC/KPSEA/KJSEA
assessment info, capture-scores windows, timetabling guidelines, etc.) - these
change over time, so for anything date-specific, point people to the notices/
circulars on the homepage rather than guessing a date.

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
      top: 20px;
      right: 20px;
      z-index: 999998;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      background: linear-gradient(145deg, #d9a441, #c98a2e);
      box-shadow: 0 6px 18px rgba(201,138,46,.45);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform .15s ease, box-shadow .15s ease;
    }
    #aiWidgetBtn:hover { transform: scale(1.06); box-shadow: 0 8px 22px rgba(201,138,46,.55); }
    #aiWidgetBtn i { color: #fff; font-size: 20px; }
    #aiWidgetBtn .aiw-dot {
      position: absolute; top: 2px; right: 2px;
      width: 10px; height: 10px; border-radius: 50%;
      background: #1e8e5a; border: 2px solid #fff;
    }

    #aiWidgetPanel {
      position: fixed;
      top: 84px;
      right: 20px;
      z-index: 999999;
      width: 340px;
      max-width: calc(100vw - 32px);
      height: 460px;
      max-height: calc(100vh - 110px);
      background: #fffdf8;
      border: 1px solid rgba(211,164,55,.35);
      border-radius: 16px;
      box-shadow: 0 20px 56px rgba(43,26,16,.28);
      display: none;
      flex-direction: column;
      overflow: hidden;
      font-family: 'Inter', -apple-system, sans-serif;
    }
    #aiWidgetPanel.open { display: flex; animation: aiw-in .18s ease-out; }
    @keyframes aiw-in { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }

    #aiWidgetPanel .aiw-header {
      padding: 12px 14px;
      background: linear-gradient(160deg, #fdf8f3, #f7ece0);
      border-bottom: 1px solid rgba(211,164,55,.25);
      display: flex; align-items: center; justify-content: space-between;
    }
    #aiWidgetPanel .aiw-header span {
      font-family: 'Space Grotesk','Inter',sans-serif;
      font-weight: 600; font-size: 14px; color: #2b1a10;
    }
    #aiWidgetPanel .aiw-close {
      background: none; border: none; cursor: pointer; color: #8a7256; font-size: 15px; padding: 4px;
    }
    #aiWidgetPanel .aiw-close:hover { color: #2b1a10; }

    #aiWidgetMessages {
      flex: 1; overflow-y: auto; padding: 12px 14px; display: flex; flex-direction: column; gap: 10px;
    }
    .aiw-msg { font-size: 13px; line-height: 1.5; max-width: 88%; padding: 8px 11px; border-radius: 12px; white-space: pre-wrap; }
    .aiw-msg.user { align-self: flex-end; background: #c98a2e; color: #fff; border-bottom-right-radius: 3px; }
    .aiw-msg.bot { align-self: flex-start; background: #f3ead9; color: #2b1a10; border-bottom-left-radius: 3px; }
    .aiw-msg.err { align-self: flex-start; background: rgba(192,57,43,.1); color: #c0392b; border: 1px solid rgba(192,57,43,.3); }

    #aiWidgetForm { display: flex; gap: 8px; padding: 10px; border-top: 1px solid rgba(211,164,55,.25); }
    #aiWidgetInput {
      flex: 1; resize: none; border: 1.5px solid rgba(211,164,55,.3); border-radius: 10px;
      padding: 8px 10px; font-family: inherit; font-size: 13px; outline: none; max-height: 80px;
    }
    #aiWidgetInput:focus { border-color: rgba(201,138,46,.6); }
    #aiWidgetSend {
      border: none; border-radius: 10px; padding: 0 14px; background: #c98a2e; color: #fff;
      cursor: pointer; font-size: 13px; font-weight: 600;
    }
    #aiWidgetSend:disabled { opacity: .5; cursor: not-allowed; }
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
      <span>Ask AI</span>
      <button type="button" class="aiw-close" aria-label="Close">✕</button>
    </div>
    <div id="aiWidgetMessages"></div>
    <form id="aiWidgetForm">
      <textarea id="aiWidgetInput" rows="1" placeholder="Ask a question..."></textarea>
      <button id="aiWidgetSend" type="submit">Send</button>
    </form>
  `;
  document.body.appendChild(panel);

  return { btn, panel };
}

function addMessage(container, text, cls) {
  const div = document.createElement("div");
  div.className = "aiw-msg " + cls;
  div.textContent = text;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
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

function setupWidget() {
  const { btn, panel } = injectMarkup();
  const messages = panel.querySelector("#aiWidgetMessages");
  const form = panel.querySelector("#aiWidgetForm");
  const input = panel.querySelector("#aiWidgetInput");
  const sendBtn = panel.querySelector("#aiWidgetSend");
  const closeBtn = panel.querySelector(".aiw-close");

  let modelPromise = null;
  let chat = null;
  let greeted = false;

  btn.addEventListener("click", () => {
    panel.classList.toggle("open");
    if (panel.classList.contains("open")) {
      if (!greeted) {
        addMessage(messages, "Hi! Ask me anything about using this site.", "bot");
        greeted = true;
      }
      input.focus();
    }
  });
  closeBtn.addEventListener("click", () => panel.classList.remove("open"));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    addMessage(messages, text, "user");
    input.value = "";
    sendBtn.disabled = true;
    const thinkingEl = addMessage(messages, "…", "bot");

    try {
      if (!modelPromise) modelPromise = initModel();
      const model = await modelPromise;
      if (!chat) chat = model.startChat();

      const result = await chat.sendMessageStream(text);
      thinkingEl.textContent = "";
      for await (const chunk of result.stream) {
        thinkingEl.textContent += chunk.text();
        messages.scrollTop = messages.scrollHeight;
      }
      if (!thinkingEl.textContent) thinkingEl.textContent = "(no response)";
    } catch (err) {
      console.warn("[ai-widget] request failed:", err);
      thinkingEl.remove();
      addMessage(
        messages,
        "Sorry, something went wrong reaching the AI. Make sure the Gemini Developer API is enabled for this Firebase project.",
        "err"
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