/*
 * wm-security-notice.js
 * ─────────────────────────────────────────────────────────────────────────
 * On-page "quick start" guide, built in the same visual language as
 * weve_moved.html — soft gradient card, Fraunces headline, Plus Jakarta
 * Sans body, blue/teal/gold accents, rounded numbered "step chip"
 * components.
 *
 * Originally this was a security notice (console-paste scam warning +
 * an explanation of retired on-page security theater). Content has since
 * shifted to plain onboarding: how to sign in, how to request a teacher
 * account, and what to do if locked out — the things a first-time
 * visitor actually needs on this page. The audit-log / lockout code
 * itself (writeAuditLog / registerFailure / applyLockUI, further down
 * login.html) is unaffected by this file either way; it just isn't the
 * subject of the on-page copy anymore.
 *
 * This file only adds a self-contained notice — it does not remove or
 * rebind any of the page's real functionality (auth, lockout, audit log).
 *
 * Persistence: the notice shows once per page load by default. A "Don't
 * remind me again on this device" control lets a visitor silence future
 * appearances via localStorage (key: wmSecurityNoticeSilenced). The X /
 * backdrop / Escape close only dismiss the current view and do not set
 * that flag, so the notice still appears on the visitor's next visit
 * unless they explicitly chose to silence it.
 */
(function () {
  'use strict';

  var SILENCE_KEY = 'wmSecurityNoticeSilenced';

  function isSilenced() {
    try { return localStorage.getItem(SILENCE_KEY) === '1'; } catch (e) { return false; }
  }
  function setSilenced() {
    try { localStorage.setItem(SILENCE_KEY, '1'); } catch (e) { /* ignore (private mode, etc.) */ }
  }

  function inject() {
    if (document.getElementById('wmSecurityNotice')) return; // never duplicate
    if (isSilenced()) return; // visitor already asked not to see this again

    var style = document.createElement('style');
    style.id = 'wmSecurityNoticeStyle';
    style.textContent = [
      '#wmSecurityNotice{',
      '  --wm-blue:#2980b9; --wm-blue-dk:#1a5276; --wm-teal:#16a085; --wm-gold:#f39c12;',
      '  --wm-chip:#f3f5f8; --wm-border:rgba(20,30,45,.08);',
      '  --wm-border-strong:rgba(20,30,45,.14); --wm-text:#101c2c; --wm-text2:#5b6472; --wm-text3:#98a0ac;',
      '  --wm-shadow:0 28px 64px -18px rgba(30,50,80,.24), 0 8px 22px -10px rgba(41,128,185,.14);',
      '  position:fixed; top:50%; left:50%; transform:translate(-50%,-46%);',
      '  z-index:100000; width:min(440px, calc(100vw - 24px)); box-sizing:border-box;',
      '  opacity:0; transition:opacity .45s ease, transform .45s cubic-bezier(.16,1,.3,1);',
      '  pointer-events:none;',
      '}',
      '#wmSecurityNotice.wm-show{ opacity:1; transform:translate(-50%,-50%); pointer-events:auto; }',
      '#wmSecurityNotice *{ box-sizing:border-box; }',
      '#wmSecurityNotice .wm-card{',
      '  position:relative; background:linear-gradient(160deg,#ffffff,#f8f1e3 130%);',
      '  border:1px solid var(--wm-border-strong); border-radius:22px; padding:22px 24px 18px;',
      '  box-shadow:var(--wm-shadow); font-family:"Plus Jakarta Sans",-apple-system,sans-serif; color:var(--wm-text);',
      '  overflow:hidden; max-height:calc(100vh - 32px); overflow-y:auto;',
      '}',
      '#wmSecurityNotice .wm-card::before{',
      '  content:""; position:absolute; inset:0 0 auto 0; height:4px;',
      '  background:linear-gradient(90deg,var(--wm-blue),var(--wm-teal) 55%,var(--wm-gold));',
      '}',
      '#wmSecurityNotice .wm-kicker{',
      '  display:inline-flex; align-items:center; gap:7px; margin-bottom:12px;',
      '  font-size:11px; font-weight:800; letter-spacing:.14em; text-transform:uppercase; color:var(--wm-blue-dk);',
      '}',
      '#wmSecurityNotice .wm-kicker .wm-mark{',
      '  width:20px; height:20px; border-radius:6px; flex-shrink:0; display:flex; align-items:center; justify-content:center;',
      '  background:linear-gradient(135deg,var(--wm-blue),var(--wm-blue-dk)); color:#fff;',
      '  font-family:"Fraunces",serif; font-weight:800; font-size:10px;',
      '}',
      '#wmSecurityNotice .wm-kicker .wm-mark svg{ width:11px; height:11px; }',
      '#wmSecurityNotice .wm-close{',
      '  position:absolute; top:14px; right:14px; width:26px; height:26px; border-radius:50%; border:none;',
      '  background:var(--wm-chip); color:var(--wm-text3); cursor:pointer; display:flex; align-items:center; justify-content:center;',
      '  transition:.2s ease;',
      '}',
      '#wmSecurityNotice .wm-close:hover{ color:var(--wm-text); background:#ebeef2; }',
      '#wmSecurityNotice .wm-close svg{ width:12px; height:12px; }',
      '#wmSecurityNotice h1{',
      '  font-family:"Fraunces",serif; font-weight:600; font-size:19px; letter-spacing:-.3px; line-height:1.22;',
      '  margin:0 0 8px; padding-right:26px; color:var(--wm-text);',
      '}',
      '#wmSecurityNotice h1 em{',
      '  font-style:italic; font-weight:500; background:linear-gradient(100deg,var(--wm-blue),var(--wm-teal) 70%);',
      '  -webkit-background-clip:text; background-clip:text; color:transparent;',
      '}',
      '#wmSecurityNotice .wm-lede{ font-size:12.5px; line-height:1.6; color:var(--wm-text2); margin:0 0 14px; }',
      '#wmSecurityNotice .wm-lede b{ color:var(--wm-text); font-weight:700; }',
      '#wmSecurityNotice .wm-tip{',
      '  display:flex; align-items:flex-start; gap:9px; background:var(--wm-chip); border:1px solid var(--wm-border);',
      '  border-radius:14px; padding:10px 13px; font-size:11px; line-height:1.5; color:var(--wm-text2);',
      '}',
      '#wmSecurityNotice .wm-tip + .wm-tip{ margin-top:8px; }',
      '#wmSecurityNotice .wm-tip .wm-tip-ic{',
      '  width:20px; height:20px; border-radius:50%; flex-shrink:0; margin-top:1px;',
      '  display:flex; align-items:center; justify-content:center;',
      '}',
      '#wmSecurityNotice .wm-tip .wm-tip-ic svg{ width:11px; height:11px; }',
      '#wmSecurityNotice .wm-tip .wm-tip-ic{ font-family:"Plus Jakarta Sans",-apple-system,sans-serif; font-size:11px; font-weight:800; }',
      '#wmSecurityNotice .wm-tip.wm-tip-gold .wm-tip-ic{ background:rgba(243,156,18,.16); color:var(--wm-gold); }',
      '#wmSecurityNotice .wm-tip.wm-tip-blue .wm-tip-ic{ background:rgba(41,128,185,.14); color:var(--wm-blue); }',
      '#wmSecurityNotice .wm-tip.wm-tip-teal .wm-tip-ic{ background:rgba(22,160,133,.15); color:var(--wm-teal); }',
      '#wmSecurityNotice .wm-silence{',
      '  display:block; width:100%; margin:12px 0 0; padding:6px 4px 0; text-align:center;',
      '  background:none; border:none; border-top:1px solid var(--wm-border);',
      '  font-family:"Plus Jakarta Sans",-apple-system,sans-serif; font-size:11px; font-weight:600;',
      '  color:var(--wm-text3); cursor:pointer; transition:color .15s ease;',
      '}',
      '#wmSecurityNotice .wm-silence:hover{ color:var(--wm-blue-dk); text-decoration:underline; }',
      '@media (max-width:480px){',
      '  #wmSecurityNotice .wm-card{ padding:18px 18px 16px; border-radius:18px; }',
      '  #wmSecurityNotice h1{ font-size:17px; }',
      '}',
      '@media (prefers-reduced-motion:reduce){',
      '  #wmSecurityNotice{ transition:opacity .2s ease; }',
      '}',
      '#wmSecurityNoticeBackdrop{',
      '  position:fixed; inset:0; z-index:99999; background:rgba(16,28,44,.42);',
      '  backdrop-filter:blur(3px) saturate(110%); -webkit-backdrop-filter:blur(3px) saturate(110%);',
      '  opacity:0; transition:opacity .45s ease; pointer-events:none;',
      '}',
      '#wmSecurityNoticeBackdrop.wm-show{ opacity:1; pointer-events:auto; }',
      '@media (prefers-reduced-motion:reduce){',
      '  #wmSecurityNoticeBackdrop{ transition:opacity .2s ease; }',
      '}'
    ].join('\n');
    document.head.appendChild(style);

    var backdrop = document.createElement('div');
    backdrop.id = 'wmSecurityNoticeBackdrop';
    document.body.appendChild(backdrop);

    var wrap = document.createElement('div');
    wrap.id = 'wmSecurityNotice';
    wrap.setAttribute('role', 'status');
    wrap.setAttribute('aria-live', 'polite');
    wrap.innerHTML =
      '<div class="wm-card">' +
        '<button class="wm-close" id="wmSecurityNoticeClose" aria-label="Dismiss notice" title="Dismiss">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
        '</button>' +
        '<div class="wm-kicker">' +
          '<span class="wm-mark">K</span>' +
          '<span>Kanyadet Primary &amp; Junior School</span>' +
        '</div>' +
        '<h1>New here? <em>Quick start</em> guide</h1>' +
        '<p class="wm-lede">' +
          'Everything you need to sign in or request a teacher account is ' +
          'right here on this page.' +
        '</p>' +
        '<div class="wm-tip wm-tip-blue">' +
          '<span class="wm-tip-ic">1</span>' +
          '<span><b>Already have an account?</b> Enter your email and password ' +
          'above and select Sign In, or use "Continue with Google" for a ' +
          'one-tap sign-in.</span>' +
        '</div>' +
        '<div class="wm-tip wm-tip-gold">' +
          '<span class="wm-tip-ic">2</span>' +
          '<span><b>New teacher?</b> Click "New teacher? Request access" ' +
          'below the sign-in button, fill in your personal and professional ' +
          'details, and submit. An admin reviews every request &mdash; ' +
          'you\u2019ll be able to sign in as soon as yours is approved.</span>' +
        '</div>' +
        '<div class="wm-tip wm-tip-teal">' +
          '<span class="wm-tip-ic">3</span>' +
          '<span><b>Trouble signing in?</b> Too many failed attempts will ' +
          'briefly lock the sign-in button &mdash; just wait for the timer ' +
          'next to it to clear. Still stuck? Reach out to the school admin ' +
          'for help.</span>' +
        '</div>' +
        '<button type="button" class="wm-silence" id="wmSecurityNoticeSilence">' +
          'Don\u2019t remind me again on this device' +
        '</button>' +
      '</div>';

    document.body.appendChild(wrap);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        wrap.classList.add('wm-show');
        backdrop.classList.add('wm-show');
      });
    });

    var closeBtn = document.getElementById('wmSecurityNoticeClose');
    var silenceBtn = document.getElementById('wmSecurityNoticeSilence');
    function dismiss() {
      wrap.classList.remove('wm-show');
      backdrop.classList.remove('wm-show');
      setTimeout(function () {
        if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
        if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
      }, 450);
    }
    if (closeBtn) closeBtn.addEventListener('click', dismiss);
    if (silenceBtn) silenceBtn.addEventListener('click', function () {
      setSilenced();
      dismiss();
    });
    backdrop.addEventListener('click', dismiss);
    document.addEventListener('keydown', function onKey(e) {
      if (e.key === 'Escape') { dismiss(); document.removeEventListener('keydown', onKey); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();