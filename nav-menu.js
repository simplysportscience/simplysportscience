/* Simply Sport Science: responsive navigation menu.
   Shows a menu button at 1100px and below, and adds a Revision link if the page's nav lacks one.
   One shared file: edit here and every page updates. */
(function(){
  var nav=document.querySelector('nav .nav-inner'), list=nav&&nav.querySelector('.nav-links');
  if(!nav||!list||nav.querySelector('.nav-toggle')) return;

  var css=document.createElement('style');
  css.textContent=
  '.nav-toggle{display:none;align-items:center;justify-content:center;width:44px;height:44px;margin-left:auto;background:transparent;border:1px solid rgba(148,163,184,.35);border-radius:10px;cursor:pointer;color:#fff;padding:0;flex-shrink:0;}'+
  '.nav-toggle:hover{background:rgba(107,33,212,.2);}'+
  '.nav-toggle:focus-visible{outline:2px solid #22D3EE;outline-offset:2px;}'+
  '.nav-toggle span{position:relative;display:block;width:20px;height:2px;background:currentColor;border-radius:2px;transition:background .15s;}'+
  '.nav-toggle span::before,.nav-toggle span::after{content:"";position:absolute;left:0;width:20px;height:2px;background:currentColor;border-radius:2px;transition:transform .2s,top .2s;}'+
  '.nav-toggle span::before{top:-6px;}.nav-toggle span::after{top:6px;}'+
  '.nav-toggle[aria-expanded="true"] span{background:transparent;}'+
  '.nav-toggle[aria-expanded="true"] span::before{top:0;transform:rotate(45deg);}'+
  '.nav-toggle[aria-expanded="true"] span::after{top:0;transform:rotate(-45deg);}'+
  '@media(max-width:1100px){'+
    '.nav-toggle{display:inline-flex;}'+
    'nav .nav-links{display:none!important;position:absolute;top:100%;left:0;right:0;flex-direction:column;align-items:stretch;gap:2px;padding:10px 16px 16px;background:#0F172A;border-bottom:1px solid rgba(148,163,184,.25);box-shadow:0 18px 40px rgba(0,0,0,.45);max-height:calc(100vh - 70px);overflow-y:auto;}'+
    'nav .nav-links.open{display:flex!important;}'+
    'nav .nav-links li{width:100%;}'+
    'nav .nav-links a{display:block;font-size:16px;padding:13px 14px;white-space:normal;}'+
  '}';
  document.head.appendChild(css);

  /* Add Revision if missing (relative to the same folder as the other nav links) */
  if(!list.querySelector('a[href$="revision.html"]')){
    var ref=list.querySelector('a[href$="ib-hub.html"]')||list.querySelector('a[href$="az-library.html"]');
    if(ref){
      var prefix=ref.getAttribute('href').replace(/[^\/]*$/,'');
      var li=document.createElement('li'), a=document.createElement('a');
      a.href=prefix+'revision.html'; a.textContent='Revision'; li.appendChild(a); list.appendChild(li);
    }
  }

  if(!list.id) list.id='site-nav-links';
  var btn=document.createElement('button');
  btn.type='button'; btn.className='nav-toggle'; btn.setAttribute('aria-label','Open menu');
  btn.setAttribute('aria-expanded','false'); btn.setAttribute('aria-controls',list.id);
  btn.innerHTML='<span></span>';
  nav.appendChild(btn);

  function set(open){
    list.classList.toggle('open',open);
    btn.setAttribute('aria-expanded',open?'true':'false');
    btn.setAttribute('aria-label',open?'Close menu':'Open menu');
  }
  btn.addEventListener('click',function(){set(!list.classList.contains('open'));});
  list.addEventListener('click',function(e){if(e.target.closest('a'))set(false);});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&list.classList.contains('open')){set(false);btn.focus();}});
  document.addEventListener('click',function(e){if(list.classList.contains('open')&&!e.target.closest('nav'))set(false);});
  window.addEventListener('resize',function(){if(window.innerWidth>1100)set(false);});
})();

/* Social icons: official brand marks (Simple Icons, CC0), added to every page footer and to any <div data-social> */
(function(){
  var P={
    youtube:"M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
    instagram:"M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077",
    spotify:"M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z",
    x:"M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z",
    tiktok:"M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
  };
  var L=[
    ['youtube','YouTube','https://www.youtube.com/@SimplySportScience','#FF0000'],
    ['spotify','Spotify','https://open.spotify.com/show/18z5qQdjBDvhq5UwX6X3h0','#1DB954'],
    ['instagram','Instagram','https://www.instagram.com/simply_sport_science','linear-gradient(45deg,#F58529 0%,#DD2A7B 45%,#8134AF 75%,#515BD4 100%)'],
    ['x','X','https://x.com/simplysportsci','#000000'],
    ['tiktok','TikTok','https://www.tiktok.com/@simplysportscienc','#000000']
  ];
  var css='.sss-soc{display:flex;flex-wrap:wrap;justify-content:center;gap:14px;margin:6px 0 4px}'+
  '.sss-soc a{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-width:48px;height:48px;border-radius:99px;color:#fff;text-decoration:none;font:700 15px system-ui,sans-serif;border:2px solid rgba(255,255,255,.28);box-shadow:0 4px 14px rgba(0,0,0,.35);transition:transform .15s,box-shadow .15s,border-color .15s}'+
  '.sss-soc a svg{width:24px;height:24px;fill:#fff;flex-shrink:0}'+
  '.sss-soc a:hover,.sss-soc a:focus-visible{transform:translateY(-3px) scale(1.06);border-color:#fff;box-shadow:0 8px 22px rgba(255,255,255,.18)}'+
  '.sss-soc a:focus-visible{outline:3px solid #22D3EE;outline-offset:3px}'+
  '.sss-soc.sss-lg a{height:54px;padding:0 22px 0 18px}.sss-soc.sss-lg a svg{width:26px;height:26px}'+
  '.sss-soc:not(.sss-lg) a{width:48px}.sss-soc .sss-t{display:none}.sss-soc.sss-lg .sss-t{display:inline}'+
  '.sss-soc-wrap{text-align:center;margin:16px 0 16px}.sss-soc-wrap small{display:block;margin-bottom:8px;font:700 12px system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#94A3B8}'+
  '.footer-soc.sss-done{display:block}';
  function row(lg){
    var h='<div class="sss-soc'+(lg?' sss-lg':'')+'">';
    for(var i=0;i<L.length;i++){var s=L[i];
      h+='<a href="'+s[2]+'" target="_blank" rel="noopener" aria-label="'+s[1]+'" title="'+s[1]+'" style="background:'+s[3]+'">'+
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="'+P[s[0]]+'"/></svg><span class="sss-t">'+s[1]+'</span></a>';}
    return h+'</div>';
  }
  function go(){
    if(document.querySelector('.sss-soc'))return;
    var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
    var done=false;
    var holders=document.querySelectorAll('[data-social]');
    for(var j=0;j<holders.length;j++){holders[j].innerHTML=row(holders[j].getAttribute('data-social')==='large');done=true;}
    var f=document.querySelector('footer, .hub-footer');
    if(!f||done)return;
    var old=f.querySelector('.footer-soc');
    if(old){old.className='footer-soc sss-done';old.innerHTML=row(false);return;}
    var w=document.createElement('div');w.className='sss-soc-wrap';
    w.innerHTML='<small>Follow Simply Sport Science</small>'+row(false);
    var ps=f.querySelectorAll(':scope > p');
    if(ps.length)f.insertBefore(w,ps[ps.length-1]);else f.appendChild(w);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
})();
