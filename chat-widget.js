/* Simply Sport Science study assistant. Searches chat-index.json in the browser,
   then asks a small Cloudflare Worker to write a short answer from the best passages. */
(function () {
  var WORKER_URL = 'https://sss-chat.simply-sport-sci.workers.dev'; // e.g. https://sss-chat.yourname.workers.dev

  var STOP = 'a an the of and or to in on for with is are was were be been it its this that these those what which who how why when where do does did can could should would about as at by from into than then there their them they you your i me my we our us not no yes if so but also any all some more most other such very just tell explain describe define please give'.split(' ');
  var STOPSET = {}; STOP.forEach(function (w) { STOPSET[w] = 1; });
  function stem(w) { return w.length > 4 && /s$/.test(w) && !/ss$/.test(w) ? w.replace(/(ies)$/, 'y').replace(/s$/, '') : w; }
  function tokens(s) {
    return (s.toLowerCase().replace(/v[oó]\s*2|vo₂/g, 'vo2').match(/[a-z0-9]+/g) || [])
      .filter(function (w) { return w.length > 1 && !STOPSET[w]; }).map(stem);
  }

  // ---- search (BM25 over passages, with a boost for title matches) ----
  function buildIndex(data) {
    var docs = data.chunks.map(function (c) {
      var p = data.pages[c[0]];
      var tt = tokens(p[1]), bt = tokens(c[1]);
      var tf = {}; bt.forEach(function (w) { tf[w] = (tf[w] || 0) + 1; });
      var tset = {}; tt.forEach(function (w) { tset[w] = 1; });
      return { page: c[0], text: c[1], len: bt.length, tf: tf, tset: tset, tn: tt.length };
    });
    var df = {}, total = 0;
    docs.forEach(function (d) { total += d.len; Object.keys(d.tf).forEach(function (w) { df[w] = (df[w] || 0) + 1; }); });
    return { pages: data.pages, docs: docs, df: df, avg: total / docs.length };
  }
  function search(ix, q, n) {
    var qt = tokens(q); if (!qt.length) return [];
    var N = ix.docs.length, k1 = 1.4, b = 0.7, res = [];
    ix.docs.forEach(function (d) {
      var s = 0;
      qt.forEach(function (w) {
        var f = d.tf[w] || 0, hit = d.tset[w];
        if (!f && !hit) return;
        var idf = Math.log(1 + (N - (ix.df[w] || 0) + 0.5) / ((ix.df[w] || 0) + 0.5));
        s += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + b * d.len / ix.avg)));
        if (hit) s += idf * 2.2;
      });
      if (s > 0) {
        var all = d.tn > 0 && qt.length >= d.tn;
        if (all) { for (var w2 in d.tset) { if (qt.indexOf(w2) < 0) { all = false; break; } } }
        if (all) s += 12 * d.tn;
        res.push({ s: s, d: d });
      }
    });
    res.sort(function (a, b2) { return b2.s - a.s; });
    var out = [], perPage = {};
    for (var i = 0; i < res.length && out.length < n; i++) {
      var pg = res[i].d.page; perPage[pg] = (perPage[pg] || 0) + 1;
      if (perPage[pg] > 2) continue;
      var p = ix.pages[pg];
      out.push({ u: p[0], t: p[1], x: res[i].d.text.slice(0, 900), s: res[i].s });
    }
    return out;
  }
  if (typeof document === 'undefined') { module.exports = { buildIndex: buildIndex, search: search }; return; }

  // ---- widget ----
  if (/^PASTE/.test(WORKER_URL)) return; // not switched on yet
  var me = document.currentScript, src = me && me.src ? me.src : location.href;
  var base = src.replace(/[^\/]*(\?.*)?$/, '');
  var index = null, loading = null, busy = false, last = 0;

  var css = '#sss-chat-btn{position:fixed;right:18px;bottom:18px;z-index:900;display:flex;align-items:center;gap:8px;padding:12px 18px;border:0;border-radius:99px;cursor:pointer;font:800 14px system-ui,sans-serif;color:#fff;background:linear-gradient(135deg,#6B21D4,#C026D3);box-shadow:0 0 22px rgba(192,38,211,.55)}' +
    '#sss-chat-btn:hover{transform:translateY(-2px)}' +
    '#sss-chat{position:fixed;right:18px;bottom:78px;z-index:901;width:380px;max-width:calc(100vw - 24px);height:560px;max-height:calc(100vh - 100px);display:none;flex-direction:column;border-radius:20px;overflow:hidden;background:#0F172A;border:1.5px solid #9B59E8;box-shadow:0 0 40px rgba(107,33,212,.5);font:14px/1.5 system-ui,sans-serif;color:#fff}' +
    '#sss-chat.open{display:flex}' +
    '#sss-chat header{padding:14px 16px;background:linear-gradient(135deg,#4C1397,#6B21D4,#C026D3);display:flex;justify-content:space-between;align-items:center;font-weight:900}' +
    '#sss-chat header small{display:block;font-weight:600;font-size:11px;opacity:.85}' +
    '#sss-chat header button{background:none;border:0;color:#fff;font-size:22px;cursor:pointer;line-height:1}' +
    '#sss-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px}' +
    '.sss-m{max-width:88%;padding:10px 13px;border-radius:14px;white-space:pre-wrap;word-wrap:break-word}' +
    '.sss-u{align-self:flex-end;background:#6B21D4}.sss-a{align-self:flex-start;background:#162032;border:1px solid #2D3F5E}' +
    '.sss-src{margin-top:8px;font-size:12px;color:#94A3B8}.sss-src a{color:#22D3EE;display:block;text-decoration:none;margin-top:2px}.sss-src a:hover{text-decoration:underline}' +
    '.sss-chips{display:flex;flex-wrap:wrap;gap:6px}.sss-chips button{background:#162032;color:#22D3EE;border:1px solid #2D3F5E;border-radius:99px;padding:6px 12px;font-size:12.5px;cursor:pointer}' +
    '#sss-form{display:flex;gap:8px;padding:10px;border-top:1px solid #2D3F5E}' +
    '#sss-in{flex:1;background:#162032;border:1px solid #2D3F5E;border-radius:12px;color:#fff;padding:10px 12px;font:inherit}' +
    '#sss-go{background:#22D3EE;color:#0F172A;border:0;border-radius:12px;padding:0 16px;font-weight:900;cursor:pointer}' +
    '#sss-note{padding:0 12px 10px;font-size:11px;color:#94A3B8;text-align:center}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var btn = document.createElement('button'); btn.id = 'sss-chat-btn'; btn.type = 'button'; btn.innerHTML = '💬 Ask a question';
  var box = document.createElement('div'); box.id = 'sss-chat'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Simply Sport Science study assistant');
  box.innerHTML = '<header><div>Study Assistant<small>Answers from this website</small></div><button type="button" aria-label="Close">×</button></header>' +
    '<div id="sss-msgs"></div><form id="sss-form"><input id="sss-in" maxlength="300" placeholder="Ask about any topic or term…" autocomplete="off"/><button id="sss-go" type="submit">Ask</button></form>' +
    '<div id="sss-note">AI can make mistakes. Check your specification and ask your teacher.</div>';
  document.body.appendChild(btn); document.body.appendChild(box);
  var msgs = box.querySelector('#sss-msgs'), input = box.querySelector('#sss-in');

  function add(cls, text) { var d = document.createElement('div'); d.className = 'sss-m ' + cls; d.textContent = text; msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight; return d; }
  function sources(div, list) {
    if (!list.length) return;
    var s = document.createElement('div'); s.className = 'sss-src'; s.appendChild(document.createTextNode('Read more:'));
    var seen = {}; list.forEach(function (p) {
      if (seen[p.u]) return; seen[p.u] = 1;
      var a = document.createElement('a'); a.href = base + p.u; a.textContent = '→ ' + p.t; s.appendChild(a);
    }); div.appendChild(s);
  }
  function welcome() {
    add('sss-a', "Hi! I'm the Simply Sport Science study assistant. Ask me about any topic or term on the site.");
    var c = document.createElement('div'); c.className = 'sss-chips';
    ['What is lactate threshold?', 'Explain the sliding filament theory', 'What is periodisation?'].forEach(function (q) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = q; b.onclick = function () { ask(q); }; c.appendChild(b);
    }); msgs.appendChild(c);
  }
  function load() {
    if (index) return Promise.resolve(index);
    if (!loading) loading = fetch(base + 'chat-index.json').then(function (r) { return r.json(); }).then(function (d) { index = buildIndex(d); return index; });
    return loading;
  }
  function ask(q) {
    q = (q || '').trim(); if (!q || busy) return;
    if (Date.now() - last < 2500) { return; }
    busy = true; last = Date.now(); input.value = '';
    add('sss-u', q); var wait = add('sss-a', 'Thinking…');
    load().then(function (ix) {
      var hits = search(ix, q, 5);
      if (!hits.length) { wait.textContent = "I can't find that on the site yet. Try the A–Z library search, or rephrase your question."; return; }
      return fetch(WORKER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, passages: hits.map(function (h) { return { t: h.t, x: h.x }; }) }) })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (!res.ok || !res.j.answer) {
            wait.textContent = res.j && res.j.error === 'limit' ? "I've answered a lot of questions today and need a rest. Please try again tomorrow, or use the A–Z library search." : 'Sorry, something went wrong. Please try again in a moment.';
            sources(wait, hits.slice(0, 3)); return;
          }
          wait.textContent = res.j.answer; sources(wait, hits.slice(0, 3));
        });
    }).catch(function () { wait.textContent = 'Sorry, I could not load. Please check your connection and try again.'; })
      .then(function () { busy = false; msgs.scrollTop = msgs.scrollHeight; });
  }
  box.querySelector('#sss-form').onsubmit = function (e) { e.preventDefault(); ask(input.value); };
  btn.onclick = function () { box.classList.toggle('open'); if (box.classList.contains('open')) { if (!msgs.children.length) welcome(); input.focus(); load().catch(function () {}); } };
  box.querySelector('header button').onclick = function () { box.classList.remove('open'); };
})();
