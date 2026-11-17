/* Simply Sport Science: responsive navigation menu.
   Shows a menu button at 1000px and below, and adds a Revision link if the page's nav lacks one.
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
  '@media(max-width:1000px){'+
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
  window.addEventListener('resize',function(){if(window.innerWidth>1000)set(false);});
})();
