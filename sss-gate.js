/* Simply Sport Science: Google sign-in gate (browser-side).
   Convenience gate only: it stops casual visitors, but the page files stay public. */
(function () {
  var CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
  var KEY = 'sssSession';
  var DAYS = 30;
  var PUBLIC = ['index.html', 'privacy.html', 'about.html', '404.html', ''];
  var configured = CLIENT_ID.indexOf('YOUR_GOOGLE') === -1;
  var path = (location.pathname.split('/').pop() || 'index.html').split('?')[0];

  function getSession() {
    try { var s = JSON.parse(localStorage.getItem(KEY)); if (s && s.exp > Date.now()) return s; } catch (e) {}
    return null;
  }
  function setSession(s) { s.exp = Date.now() + DAYS * 86400000; localStorage.setItem(KEY, JSON.stringify(s)); }
  function signOut() { localStorage.removeItem(KEY); location.href = 'index.html'; }
  function decodeJwt(token) {
    var p = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(atob(p).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2); }).join('')));
  }
  window.sssSession = getSession;
  window.sssSignOut = signOut;

  var session = getSession();

  // Lock every page except the public ones until a session exists.
  if (configured && PUBLIC.indexOf(path) === -1 && !session) {
    location.replace('index.html?next=' + encodeURIComponent(path));
    return;
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (session && !document.getElementById('sssBar') && path !== 'index.html') {
      var footer = document.querySelector('.hub-footer');
      if (footer) {
        var a = document.createElement('a');
        a.href = '#'; a.textContent = 'Sign out (' + (session.name || session.email) + ')';
        a.onclick = function (e) { e.preventDefault(); signOut(); };
        footer.appendChild(a);
      }
    }
    if (path !== 'index.html') return;

    // Front page: sign-in banner.
    var bar = document.createElement('div');
    bar.id = 'sssBar';
    bar.style.cssText = 'max-width:520px;margin:28px auto 0;padding:22px 24px;border-radius:24px;background:linear-gradient(160deg,#1C1442,#15102F);border:1px solid rgba(179,139,255,.45);box-shadow:0 0 34px rgba(179,139,255,.18);text-align:center;font-family:"Segoe UI",system-ui,sans-serif;color:#fff;';
    var h = document.createElement('div');
    h.style.cssText = 'font-size:11px;font-weight:900;letter-spacing:2px;text-transform:uppercase;color:#F5C866;margin-bottom:8px;';
    var msg = document.createElement('div');
    msg.style.cssText = 'font-size:14px;color:#D4D0EA;line-height:1.6;margin-bottom:14px;';
    var btn = document.createElement('div');
    btn.style.cssText = 'display:flex;justify-content:center;min-height:44px;';
    bar.appendChild(h); bar.appendChild(msg); bar.appendChild(btn);
    document.body.insertBefore(bar, document.body.firstChild);

    var next = new URLSearchParams(location.search).get('next');
    if (session) {
      h.textContent = 'Signed in';
      msg.textContent = 'Welcome back' + (session.name ? ', ' + session.name : '') + '.';
      var go = document.createElement('a');
      go.href = next || 'ib-hub.html';
      go.textContent = next ? 'Continue →' : 'Go to the courses →';
      go.style.cssText = 'display:inline-block;padding:10px 20px;border-radius:99px;background:linear-gradient(135deg,#6B2FC4,#C4218A);color:#fff;font-weight:800;text-decoration:none;font-size:14px;';
      btn.appendChild(go);
      var out = document.createElement('a');
      out.href = '#'; out.textContent = 'Sign out';
      out.style.cssText = 'display:block;margin-top:12px;font-size:12px;color:#A39FC0;';
      out.onclick = function (e) { e.preventDefault(); signOut(); };
      bar.appendChild(out);
      if (next && configured) location.replace(next);
      return;
    }

    h.textContent = 'Sign in to continue';
    msg.textContent = next ? 'Please sign in with Google to open that page.' : 'Sign in with Google to explore the courses, practice questions and teaching resources.';
    if (!configured) {
      msg.textContent = 'Sign-in is not set up yet. The site owner needs to add the Google client ID to sss-gate.js.';
      return;
    }
    var gis = document.createElement('script');
    gis.src = 'https://accounts.google.com/gsi/client'; gis.async = true;
    gis.onload = function () {
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: function (resp) {
          try {
            var p = decodeJwt(resp.credential);
            setSession({ name: p.name || '', email: p.email || '', picture: p.picture || '' });
            location.replace(next || 'index.html');
          } catch (e) { msg.textContent = 'Sign-in could not be completed. Please try again.'; }
        }
      });
      window.google.accounts.id.renderButton(btn, { theme: 'filled_black', size: 'large', shape: 'pill', text: 'signin_with' });
    };
    document.head.appendChild(gis);
  });
})();
