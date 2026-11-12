/* Simply Sport Science – podcast button (production)
   Circular "Podcast" buttons in the page header, shown only when an episode exists.
   Episodes live in the separate audio site; podcasts.json there lists which episodes exist.
   BTEC pages → one button in the header   (btec-learn-u01-… → btec-u01 | btec-unit-08-… → btec-old-08)
   IB / AS Level pages → one button per presentation (AS Level topics may also have one whole-topic episode, named cam-N), all in the header (named after the presentation's slide folder, e.g. ib-a2-3-2 or cam-1-1-synovial-joints).
                One button = full-size circle; 2-4 buttons = a row of smaller circles with a shared player strip.
   Change window.SSS_PODCAST_BASE (before this script) or the default below to move the audio to a new host. */
(function(){
  var BASE=window.SSS_PODCAST_BASE||'https://simplysportscience.github.io/podcasts/';
  if(BASE.slice(-1)!=='/') BASE+='/';
  var file=(location.pathname.split('/').pop()||'index.html').replace(/\.html?$/,'');
  var isIB=/^(ib-[a-d]\d+-\d+|cam-\d+)-/.test(file);   /* IB and AS Level (Cambridge) topic pages: one button per presentation */
  var uidN=0;

  function pageKey(){
    var m=file.match(/^btec-learn-u(\d+)-/); if(m) return 'btec-u'+m[1];
    m=file.match(/^btec-unit-(\d+)-/); if(m) return 'btec-old-'+m[1];
    m=file.match(/^(ib-[a-d]\d+-\d+)-/); if(m) return m[1];
    m=file.match(/^(cam-\d+)-/); if(m) return m[1];
    return file;
  }
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }

  function ringSvg(u){
    return '<svg class="pc-ring" viewBox="0 0 120 120" aria-hidden="true"><defs>'+
      '<linearGradient id="pc-grad'+u+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F5C866"/><stop offset="1" stop-color="#22D3EE"/></linearGradient>'+
      '<linearGradient id="pc-ig'+u+'" gradientUnits="userSpaceOnUse" x1="14" y1="8" x2="50" y2="58"><stop offset="0" stop-color="#FFF6D6"/><stop offset="1" stop-color="#F5B840"/></linearGradient>'+
      '<linearGradient id="pc-ag'+u+'" gradientUnits="userSpaceOnUse" x1="10" y1="0" x2="54" y2="0"><stop offset="0" stop-color="#E0FBFF"/><stop offset="1" stop-color="#22D3EE"/></linearGradient></defs>'+
      '<circle class="pc-ring-track" cx="60" cy="60" r="54"/><circle class="pc-ring-fill" cx="60" cy="60" r="54" stroke="url(#pc-grad'+u+')"/></svg>';
  }
  function iconPodcast(u){
    return '<svg class="pc-icon pc-icon-podcast" viewBox="0 0 64 64" aria-hidden="true" focusable="false">'+
      '<path class="pc-arc pc-arc-outer" d="M15.15 39.14A22 22 0 1 1 48.85 39.14" fill="none" stroke="url(#pc-ag'+u+')" stroke-width="4.6" stroke-linecap="round"/>'+
      '<path class="pc-arc pc-arc-inner" d="M21.66 33.68A13.5 13.5 0 1 1 42.34 33.68" fill="none" stroke="#FFFFFF" stroke-width="4.6" stroke-linecap="round"/>'+
      '<circle cx="32" cy="25" r="6.6" fill="url(#pc-ig'+u+')"/>'+
      '<path d="M32 33.8c-2.5 0-4.2 1.7-4.4 4.1l-.8 12.4c-.2 2.9 2 5.2 5.2 5.2s5.4-2.3 5.2-5.2l-.8-12.4c-.2-2.4-1.9-4.1-4.4-4.1z" fill="url(#pc-ig'+u+')"/></svg>';
  }
  function iconPause(u){
    return '<svg class="pc-icon pc-icon-pause" viewBox="0 0 64 64" aria-hidden="true" focusable="false">'+
      '<rect x="16" y="13" width="12" height="38" rx="3.6" fill="url(#pc-ig'+u+')"/><rect x="36" y="13" width="12" height="38" rx="3.6" fill="url(#pc-ig'+u+')"/></svg>';
  }

  /* Builds one button + audio.
     tracks = [{src,title,label,minutes}, ...]   (one or more episodes behind the one button)
     opts   = { place:function(wrap), caption:'A.2.3.2' (small text under the circle), infoSlot:element (shared player strip) } */
  function build(tracks,opts){
    var u=++uidN, cur=0, store='', title=tracks[0].title, minutes=tracks[0].minutes, src=tracks[0].src, multi=tracks.length>1;
    var wrap=document.createElement('div'); wrap.className='pc-wrap'+(opts.infoSlot?' pc-in-dock':'');
    wrap.innerHTML=
      '<button class="pc-btn" type="button" aria-pressed="false" aria-label="Play podcast episode: '+esc(title)+'">'+ringSvg(u)+
        '<span class="pc-face">'+iconPodcast(u)+iconPause(u)+'<span class="pc-label">Podcast</span></span></button>'+
      (opts.caption?'<div class="pc-cap">'+esc(opts.caption)+'</div>':'')+
      '<div class="pc-info">'+
        '<div class="pc-status" role="status" aria-live="polite"></div>'+
        '<input class="pc-seek" type="range" min="0" max="1000" value="0" step="1" aria-label="Seek within podcast episode">'+
        '<div class="pc-controls"><button class="pc-mini pc-back" type="button" aria-label="Back 15 seconds">−15s</button>'+
          '<button class="pc-mini pc-speed" type="button" aria-label="Playback speed">1×</button>'+
          '<button class="pc-mini pc-fwd" type="button" aria-label="Forward 15 seconds">+15s</button></div></div>'+
      '<audio preload="none"></audio>';
    var info=wrap.querySelector('.pc-info'), capEl=wrap.querySelector('.pc-cap');
    var capLabel=!!(capEl && multi && !opts.infoSlot);   /* a single circle shows the episode name in its caption */
    var capDock=!!(capEl && multi && opts.infoSlot);       /* a circle in a row shows its code, then the episode name while it plays */
    var dots=[];
    if(multi){
      var dotsEl=document.createElement('div'); dotsEl.className='pc-dots'; dotsEl.setAttribute('role','group'); dotsEl.setAttribute('aria-label','Podcast episodes');
      tracks.forEach(function(t,i){
        var d=document.createElement('button'); d.type='button'; d.className='pc-dot'; d.textContent=String(i+1);
        d.title=(t.label||t.title)+(t.minutes?' · '+t.minutes+' min':''); d.setAttribute('aria-label','Episode '+(i+1)+': '+t.title);
        d.addEventListener('click',function(){ loadTrack(i,true); });
        dotsEl.appendChild(d); dots.push(d);
      });
      wrap.insertBefore(dotsEl,info);
    }
    if(opts.infoSlot){ opts.infoSlot.appendChild(info); }
    opts.place(wrap);
    var audio=wrap.querySelector('audio'), btn=wrap.querySelector('.pc-btn'), fill=wrap.querySelector('.pc-ring-fill'),
        status=info.querySelector('.pc-status'), seek=info.querySelector('.pc-seek'), speedBtn=info.querySelector('.pc-speed');
    var C=339.292, speeds=[1,1.25,1.5,0.75], si=0, lastSave=0, seeking=false;
    var loadedSrc=null;

    function fmt(s){ if(!isFinite(s)) return '0:00'; s=Math.max(0,Math.round(s)); var m=Math.floor(s/60), r=s%60; return m+':'+(r<10?'0':'')+r; }
    function savedPos(){ var v=0; try{ v=parseFloat(localStorage.getItem(store)||'0'); }catch(e){} return v||0; }
    function epTag(){ return (multi&&!capLabel&&!capDock)?('Ep '+(cur+1)+'/'+tracks.length+' · '):''; }
    function idleText(){
      var s=savedPos();
      if(s>5 && (!isFinite(audio.duration)||s<audio.duration-5)) return epTag()+'Resume from <b>'+fmt(s)+'</b>';
      if(isFinite(audio.duration)) return epTag()+'Listen · <b>'+fmt(audio.duration)+'</b>';
      return epTag()+(minutes?('Listen · <b>'+minutes+' min</b>'):'Listen now');
    }
    function setStarted(on){ wrap.classList.toggle('has-started',on); info.classList.toggle('has-started',on); if(capDock) capEl.textContent=on?(tracks[cur].label||tracks[cur].title):opts.caption; }
    function setPlaying(p){
      wrap.classList.toggle('is-playing',p); btn.setAttribute('aria-pressed',p?'true':'false');
      btn.setAttribute('aria-label',(p?'Pause':'Play')+' podcast episode: '+title);
    }
    function render(){
      var d=audio.duration, t=audio.currentTime, f=(d&&isFinite(d))?t/d:0;
      fill.style.strokeDashoffset=C*(1-f);
      if(!seeking) seek.value=Math.round(f*1000);
      if(wrap.classList.contains('has-started')) status.innerHTML=((multi&&!capLabel&&!capDock)?('<span class="pc-ep">'+esc(tracks[cur].label||tracks[cur].title)+'</span> · '):'')+'<b>'+fmt(t)+'</b> / '+fmt(d);
    }
    function makeCurrent(){
      if(!opts.infoSlot) return;
      var kids=opts.infoSlot.children; for(var i=0;i<kids.length;i++) kids[i].classList.remove('is-current');
      info.classList.add('is-current');
    }
    function ensureSrc(){ if(loadedSrc!==src){ audio.src=src; loadedSrc=src; } }
    function startPlay(){
      document.dispatchEvent(new CustomEvent('sss-podcast-play',{detail:wrap}));
      makeCurrent(); ensureSrc();
      if(!wrap.classList.contains('has-started')){
        var s=savedPos();
        var go=function(){ if(s>5 && (!isFinite(audio.duration)||s<audio.duration-5)) { try{audio.currentTime=s;}catch(e){} } };
        if(audio.readyState>0) go(); else audio.addEventListener('loadedmetadata',go,{once:true});
        try{ if(window.goatcounter&&window.goatcounter.count){ window.goatcounter.count({path:'podcast/'+src.split('/').pop().replace(/\.\w+$/,''),title:'Podcast play',event:true}); } }catch(e){}
      }
      var p=audio.play(); if(p&&p.catch) p.catch(function(){});
    }
    function loadTrack(i,autoplay){
      cur=i; var t=tracks[i]; src=t.src; title=t.title; minutes=t.minutes; store='sss-podcast-pos:'+src;
      audio.pause(); setStarted(false); wrap.classList.remove('is-unavailable'); btn.disabled=false;
      fill.style.strokeDashoffset=C; seek.value=0;
      if(loadedSrc!==null && loadedSrc!==src){ audio.removeAttribute('src'); loadedSrc=null; try{audio.load();}catch(e){} }   /* nothing is downloaded until play is pressed */
      dots.forEach(function(d,k){ d.classList.toggle('is-active',k===i); d.setAttribute('aria-pressed',k===i?'true':'false'); });
      if(capLabel) capEl.textContent=opts.caption+' · '+(t.label||t.title);
      setPlaying(false); status.innerHTML=idleText();
      if(autoplay) startPlay();
    }
    audio.addEventListener('loadedmetadata',function(){ if(!wrap.classList.contains('has-started')) status.innerHTML=idleText(); });
    audio.addEventListener('timeupdate',function(){
      render(); var nowT=Date.now();
      if(nowT-lastSave>4000){ lastSave=nowT; try{localStorage.setItem(store,String(audio.currentTime));}catch(e){} }
    });
    audio.addEventListener('play',function(){ setPlaying(true); setStarted(true); makeCurrent(); render(); });
    audio.addEventListener('pause',function(){ setPlaying(false); try{localStorage.setItem(store,String(audio.currentTime));}catch(e){} });
    audio.addEventListener('ended',function(){
      setPlaying(false); try{localStorage.removeItem(store);}catch(e){}
      if(multi && cur<tracks.length-1){ loadTrack(cur+1,true); return; }
      audio.currentTime=0; setStarted(false); fill.style.strokeDashoffset=C; seek.value=0;
      status.innerHTML=epTag()+'Listen again · <b>'+fmt(audio.duration)+'</b>';
    });
    audio.addEventListener('error',function(){ wrap.classList.add('is-unavailable'); btn.disabled=true; status.textContent='Episode coming soon'; });

    btn.addEventListener('click',function(){ if(audio.paused) startPlay(); else audio.pause(); });
    document.addEventListener('sss-podcast-play',function(e){ if(e.detail!==wrap && !audio.paused) audio.pause(); });
    info.querySelector('.pc-back').addEventListener('click',function(){ audio.currentTime=Math.max(0,audio.currentTime-15); });
    info.querySelector('.pc-fwd').addEventListener('click',function(){ audio.currentTime=Math.min(audio.duration||0,audio.currentTime+15); });
    speedBtn.addEventListener('click',function(){ si=(si+1)%speeds.length; audio.playbackRate=speeds[si]; speedBtn.textContent=speeds[si]+'×'; });
    seek.addEventListener('input',function(){ seeking=true; if(isFinite(audio.duration)){ audio.currentTime=(seek.value/1000)*audio.duration; render(); } });
    seek.addEventListener('change',function(){ seeking=false; });
    loadTrack(0,false);
    return wrap;
  }

  /* An entry in podcasts.json is either one episode {file,title,minutes}
     or several under one button: {tracks:[{file,title,label,minutes}, ...]} */
  function tracksFor(e,key,fallbackTitle){
    if(e.tracks&&e.tracks.length) return e.tracks.map(function(t,i){ return {src:BASE+t.file,title:t.title||(fallbackTitle+' – episode '+(i+1)),label:t.label,minutes:t.minutes}; });
    return [{src:BASE+(e.file||(key+'.mp3')),title:fallbackTitle,minutes:e.minutes}];
  }
  function heroParts(){
    var hero=document.querySelector('.topic-hero')||document.querySelector('.lesson-hero'); if(!hero) return null;
    return {hero:hero, inner:hero.querySelector('.topic-hero-inner')||hero.querySelector('.lesson-hero-inner')||hero};
  }

  /* ---------- keep the header at its ORIGINAL height ----------
     The podcast block floats over the header's own padding. If it would be taller than the header,
     the circles shrink (never the header grow) until the whole block - including the player strip - fits. */
  var fitters=[];
  function textRects(hero){
    var out=[], t=hero.querySelectorAll('h1,p');
    for(var i=0;i<t.length;i++){ var r=document.createRange(); r.selectNodeContents(t[i]); var rs=r.getClientRects(); for(var j=0;j<rs.length;j++) if(rs[j].width>0) out.push(rs[j]); }
    var pills=hero.querySelectorAll('.topic-meta > *, .lesson-eyebrow > *'); for(i=0;i<pills.length;i++) out.push(pills[i].getBoundingClientRect());
    return out;
  }
  function collides(rect,lines){
    for(var i=0;i<lines.length;i++){ var t=lines[i];
      if(t.right>rect.left-4 && t.left<rect.right+4 && t.bottom>rect.top-2 && t.top<rect.bottom+2) return true; }
    return false;
  }
  /* Centre the circles vertically on the header text block, in line with the title and paragraph on the left.
     The circles shrink until they fit without touching any text. On a page whose title runs so far right that
     centring is impossible, they sit in the free band above the title instead. */
  function registerFit(box,maxSize,hp){
    var f=function(){
      if(window.innerWidth<=640){ box.style.removeProperty('--pc-fit'); box.style.removeProperty('top'); box.style.removeProperty('--pc-low-top'); box.classList.remove('pc-strip-low'); return; }
      var hero=hp.hero, inner=hp.inner;
      var infos=box.querySelectorAll('.pc-info'), info0=infos[0], saved=[], lines=textRects(hero);
      for(var i=0;i<infos.length;i++) saved.push(infos[i].className);
      if(info0) info0.classList.add('has-started','is-current');       /* measure with the player strip showing, as in real use */
      function place(mode,size){
        box.style.setProperty('--pc-fit',size+'px');
        var hr=hero.getBoundingClientRect(), ir=inner.getBoundingClientRect();
        if(mode==='center'){
          box.style.top='0px';
          /* centre the whole group of circles (with their captions and episode dots) on the text midline */
          var gEls=box.classList.contains('pc-wrap')?box.querySelectorAll('.pc-btn,.pc-cap,.pc-dots'):[box.querySelector('.pc-dock-row')];
          var gt=1e9,gb=-1e9; for(var g=0;g<gEls.length;g++){ var gr=gEls[g].getBoundingClientRect(); if(!gr.height) continue; gt=Math.min(gt,gr.top); gb=Math.max(gb,gr.bottom); }
          var bt={top:gt,height:gb-gt};
          box.style.top=((ir.top+ir.height/2)-(bt.top+bt.height/2))+'px';
        } else { box.style.top=(8-(ir.top-hr.top))+'px'; }
      }
      function fits(){
        var hr=hero.getBoundingClientRect(), r=box.getBoundingClientRect();
        if(r.top<hr.top+8 || r.bottom>hr.bottom-8) return false;
        var parts=box.querySelectorAll('.pc-dock-row,.pc-btn,.pc-cap,.pc-dots,.pc-info');
        for(var k=0;k<parts.length;k++){ var pr=parts[k].getBoundingClientRect(); if((pr.width||pr.height) && collides(pr,lines)) return false; }
        return true;
      }
      box.classList.remove('pc-strip-low'); box.style.removeProperty('--pc-low-top');
      var done=false, modes=['center','top'], usedMode='center';
      for(var m=0;m<modes.length && !done;m++){
        for(var size=maxSize; size>=44; size-=4){ place(modes[m],size); usedMode=modes[m]; if(fits()){ done=true; break; } }
      }
      if(!done){ place('top',44); usedMode='top'; }
      /* top-band fallback: if the player strip would run into the title, tuck it into the bottom-right corner */
      if(usedMode==='top' && info0){
        var ir=info0.getBoundingClientRect(), hr0=hero.getBoundingClientRect(), bx=box.getBoundingClientRect();
        if(collides(ir,lines) || bx.bottom>hr0.bottom-8){
          box.classList.add('pc-strip-low');
          var bb=box.getBoundingClientRect();
          box.style.setProperty('--pc-low-top',Math.max(0,(hr0.bottom-8-ir.height)-bb.top)+'px');
        }
      }
      for(i=0;i<infos.length;i++) infos[i].className=saved[i];
    };
    fitters.push(f); f();
  }
  var fitTimer=null;
  function refit(){ clearTimeout(fitTimer); fitTimer=setTimeout(function(){ fitters.forEach(function(f){ f(); }); },120); }
  window.addEventListener('resize',refit);
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(refit);
  window.addEventListener('load',refit);

  /* ---------- IB: one button per presentation, all in the header ---------- */
  function deckKey(block,blocks){
    var d=block.querySelector('.deck'), id=d&&d.id;
    try{
      if(typeof DECKS!=='undefined'){
        for(var i=0;i<DECKS.length;i++){
          if(DECKS[i].id===id && DECKS[i].slides && DECKS[i].slides[0]){
            var m=/presentations\/([^\/]+)\//.exec(DECKS[i].slides[0]); if(m) return m[1];
          }
        }
      }
    }catch(e){}
    return blocks.length===1?pageKey():null;
  }
  function codeOf(text){ var m=/^[A-D]\.\d+(?:\.\d+){0,2}/.exec(text); return m?m[0]:text.split(' ')[0]; }
  function initIB(manifest){
    var hp=heroParts(); if(!hp) return;
    var blocks=document.querySelectorAll('.deck-block'); if(!blocks.length) return;
    var list=[]; for(var i=0;i<blocks.length;i++) list.push(blocks[i]);
    var items=[];
    list.forEach(function(block){
      var key=deckKey(block,list); if(!key) return;
      var e=manifest.episodes[key]; if(!e) return;
      var h3=block.querySelector('h3'); if(!h3) return;
      var text=h3.textContent.trim();
      items.push({tracks:tracksFor(e,key,text),code:codeOf(text)});
    });
    /* AS Level: a whole-topic episode (named after the page, e.g. cam-3) gets its own button, shown first */
    var hasTopic=false, topicE=/^cam-/.test(file)?manifest.episodes[pageKey()]:null;
    if(topicE){ var th1=hp.hero.querySelector('h1'); items.unshift({tracks:tracksFor(topicE,pageKey(),th1?th1.textContent.trim():'this topic'),code:'Topic'}); hasTopic=true; }
    if(!items.length) return;
    var multiPage=list.length>1;
    var anyMulti=items.some(function(x){ return x.tracks.length>1; });
    if(items.length===1){
      var it=items[0];
      var w1=build(it.tracks,{caption:(multiPage&&!(hasTopic&&items.length===1))?it.code:null,place:function(w){ hp.inner.insertBefore(w,hp.inner.firstChild); hp.hero.classList.add('has-podcast'); }});
      registerFit(w1,it.tracks.length>1?84:116,hp);
      return;
    }
    var n=Math.min(items.length,6);
    var dock=document.createElement('div'); dock.className='pc-dock pc-n'+n;
    var row=document.createElement('div'); row.className='pc-dock-row';
    var slot=document.createElement('div'); slot.className='pc-dock-info';
    dock.appendChild(row); dock.appendChild(slot);
    items.forEach(function(it){
      build(it.tracks,{caption:it.code,infoSlot:slot,place:function(w){ row.appendChild(w); }});
    });
    hp.inner.insertBefore(dock,hp.inner.firstChild); hp.hero.classList.add('has-podcast-dock','pc-n'+n);
    registerFit(dock,{2:92,3:72,4:60,5:52,6:52}[n],hp);
  }

  /* ---------- BTEC (and any other header page): one button in the header ---------- */
  function initHero(manifest){
    var hp=heroParts(); if(!hp) return;
    var h1=hp.hero.querySelector('h1'); var title=hp.hero.getAttribute('data-podcast-title')||(h1?h1.textContent.trim():'this topic');
    var forced=hp.hero.getAttribute('data-podcast-src'), key=pageKey(), e=manifest&&manifest.episodes&&manifest.episodes[key];
    var tr=forced?[{src:forced,title:title}]:(e?tracksFor(e,key,title):null); if(!tr) return;
    var w2=build(tr,{place:function(w){ hp.inner.insertBefore(w,hp.inner.firstChild); hp.hero.classList.add('has-podcast'); }});
    registerFit(w2,tr.length>1?84:116,hp);
  }

  if(!window.fetch) return;
  fetch(BASE+'podcasts.json?v='+Math.floor(Date.now()/300000),{cache:'no-cache'})
    .then(function(r){ return r.ok?r.json():null; })
    .then(function(m){ if(!m||!m.episodes) m={episodes:{}}; if(isIB) initIB(m); else initHero(m); })
    .catch(function(){});
})();
