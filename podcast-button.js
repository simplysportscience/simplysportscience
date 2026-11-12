/* Simply Sport Science – podcast button (production)
   Shows circular "Podcast" buttons when episodes exist. Episodes live in the separate audio site;
   podcasts.json there lists which episodes exist.
   BTEC pages  → one button in the page header     (btec-learn-u01-… → btec-u01 | btec-unit-08-… → btec-old-08)
   IB pages    → one button per presentation, on the right of each presentation title
                 (named after the presentation's slide folder, e.g. ib-a2-3-2)
   Change window.SSS_PODCAST_BASE (before this script) or the default below to move the audio to a new host. */
(function(){
  var BASE=window.SSS_PODCAST_BASE||'https://simplysportscience.github.io/podcasts/';
  if(BASE.slice(-1)!=='/') BASE+='/';
  var file=(location.pathname.split('/').pop()||'index.html').replace(/\.html?$/,'');
  var isIB=/^ib-[a-d]\d+-\d+-/.test(file);
  var uidN=0;

  function pageKey(){
    var m=file.match(/^btec-learn-u(\d+)-/); if(m) return 'btec-u'+m[1];
    m=file.match(/^btec-unit-(\d+)-/); if(m) return 'btec-old-'+m[1];
    m=file.match(/^(ib-[a-d]\d+-\d+)-/); if(m) return m[1];
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

  /* Builds one button + audio. tracks = [{src,title,label,minutes}, ...] (one or more episodes).
     place(wrap, tracksEl) puts it in the page; tracksEl is only provided when there is more than one episode. */
  function build(tracks,place,inline){
    var u=++uidN, cur=0, store='', title=tracks[0].title, minutes=tracks[0].minutes, src=tracks[0].src, multi=tracks.length>1;
    var wrap=document.createElement('div'); wrap.className='pc-wrap'+(inline?' pc-inline':'');
    wrap.innerHTML=
      '<button class="pc-btn" type="button" aria-pressed="false" aria-label="Play podcast episode: '+esc(title)+'">'+ringSvg(u)+
        '<span class="pc-face">'+iconPodcast(u)+iconPause(u)+'<span class="pc-label">Podcast</span></span></button>'+
      '<div class="pc-info">'+
        '<div class="pc-status" role="status" aria-live="polite"></div>'+
        '<input class="pc-seek" type="range" min="0" max="1000" value="0" step="1" aria-label="Seek within podcast episode">'+
        '<div class="pc-controls"><button class="pc-mini pc-back" type="button" aria-label="Back 15 seconds">−15s</button>'+
          '<button class="pc-mini pc-speed" type="button" aria-label="Playback speed">1×</button>'+
          '<button class="pc-mini pc-fwd" type="button" aria-label="Forward 15 seconds">+15s</button></div></div>'+
      '<audio preload="'+(inline?'none':'metadata')+'"></audio>';
    var tracksEl=null, chips=[];
    if(multi){
      tracksEl=document.createElement('div'); tracksEl.className='pc-tracks'; tracksEl.setAttribute('role','group'); tracksEl.setAttribute('aria-label','Podcast episodes');
      tracksEl.innerHTML='<span class="pc-tracks-label">'+tracks.length+' episodes</span>';
      tracks.forEach(function(t,i){
        var c=document.createElement('button'); c.type='button'; c.className='pc-chip'; c.title=t.title;
        c.innerHTML='<span class="pc-chip-n">'+(i+1)+'</span>'+esc(t.label||t.title)+(t.minutes?'<small>'+t.minutes+' min</small>':'');
        c.addEventListener('click',function(){ loadTrack(i,true); });
        tracksEl.appendChild(c); chips.push(c);
      });
    }
    place(wrap,tracksEl);
    var audio=wrap.querySelector('audio'), btn=wrap.querySelector('.pc-btn'), fill=wrap.querySelector('.pc-ring-fill'),
        status=wrap.querySelector('.pc-status'), seek=wrap.querySelector('.pc-seek'), speedBtn=wrap.querySelector('.pc-speed');
    var C=339.292, speeds=[1,1.25,1.5,0.75], si=0, lastSave=0, seeking=false;

    function fmt(s){ if(!isFinite(s)) return '0:00'; s=Math.max(0,Math.round(s)); var m=Math.floor(s/60), r=s%60; return m+':'+(r<10?'0':'')+r; }
    function savedPos(){ var v=0; try{ v=parseFloat(localStorage.getItem(store)||'0'); }catch(e){} return v||0; }
    function epTag(){ return multi?('Ep '+(cur+1)+'/'+tracks.length+' · '):''; }
    function idleText(){
      var s=savedPos();
      if(s>5 && (!isFinite(audio.duration)||s<audio.duration-5)) return epTag()+'Resume from <b>'+fmt(s)+'</b>';
      if(isFinite(audio.duration)) return epTag()+'Listen · <b>'+fmt(audio.duration)+'</b>';
      return epTag()+(minutes?('Listen · <b>'+minutes+' min</b>'):'Listen now');
    }
    function setPlaying(p){
      wrap.classList.toggle('is-playing',p); btn.setAttribute('aria-pressed',p?'true':'false');
      btn.setAttribute('aria-label',(p?'Pause':'Play')+' podcast episode: '+title);
    }
    function render(){
      var d=audio.duration, t=audio.currentTime, f=(d&&isFinite(d))?t/d:0;
      fill.style.strokeDashoffset=C*(1-f);
      if(!seeking) seek.value=Math.round(f*1000);
      if(wrap.classList.contains('has-started')) status.innerHTML=epTag()+'<b>'+fmt(t)+'</b> / '+fmt(d);
    }
    function startPlay(){
      document.dispatchEvent(new CustomEvent('sss-podcast-play',{detail:wrap}));
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
      audio.pause(); wrap.classList.remove('has-started','is-unavailable'); btn.disabled=false;
      fill.style.strokeDashoffset=C; seek.value=0; audio.src=src; try{audio.load();}catch(e){}
      chips.forEach(function(c,k){ c.classList.toggle('is-active',k===i); c.setAttribute('aria-pressed',k===i?'true':'false'); });
      setPlaying(false); status.innerHTML=idleText();
      if(autoplay) startPlay();
    }
    audio.addEventListener('loadedmetadata',function(){ if(!wrap.classList.contains('has-started')) status.innerHTML=idleText(); });
    audio.addEventListener('timeupdate',function(){
      render(); var now=Date.now();
      if(now-lastSave>4000){ lastSave=now; try{localStorage.setItem(store,String(audio.currentTime));}catch(e){} }
    });
    audio.addEventListener('play',function(){ setPlaying(true); wrap.classList.add('has-started'); render(); });
    audio.addEventListener('pause',function(){ setPlaying(false); try{localStorage.setItem(store,String(audio.currentTime));}catch(e){} });
    audio.addEventListener('ended',function(){
      setPlaying(false); try{localStorage.removeItem(store);}catch(e){}
      if(multi && cur<tracks.length-1){ loadTrack(cur+1,true); return; }
      audio.currentTime=0; wrap.classList.remove('has-started'); fill.style.strokeDashoffset=C; seek.value=0;
      status.innerHTML=epTag()+'Listen again · <b>'+fmt(audio.duration)+'</b>';
    });
    audio.addEventListener('error',function(){ wrap.classList.add('is-unavailable'); btn.disabled=true; status.textContent='Episode coming soon'; });

    btn.addEventListener('click',function(){ if(audio.paused) startPlay(); else audio.pause(); });
    document.addEventListener('sss-podcast-play',function(e){ if(e.detail!==wrap && !audio.paused) audio.pause(); });
    wrap.querySelector('.pc-back').addEventListener('click',function(){ audio.currentTime=Math.max(0,audio.currentTime-15); });
    wrap.querySelector('.pc-fwd').addEventListener('click',function(){ audio.currentTime=Math.min(audio.duration||0,audio.currentTime+15); });
    speedBtn.addEventListener('click',function(){ si=(si+1)%speeds.length; audio.playbackRate=speeds[si]; speedBtn.textContent=speeds[si]+'×'; });
    seek.addEventListener('input',function(){ seeking=true; if(isFinite(audio.duration)){ audio.currentTime=(seek.value/1000)*audio.duration; render(); } });
    seek.addEventListener('change',function(){ seeking=false; });
    loadTrack(0,false);
    return wrap;
  }

  /* An episode-list entry in podcasts.json is either a single episode {file,title,minutes}
     or several: {tracks:[{file,title,label,minutes}, ...]} */
  function tracksFor(e,key,fallbackTitle){
    if(e.tracks&&e.tracks.length) return e.tracks.map(function(t,i){ return {src:BASE+t.file,title:t.title||(fallbackTitle+' – episode '+(i+1)),label:t.label,minutes:t.minutes}; });
    return [{src:BASE+(e.file||(key+'.mp3')),title:fallbackTitle,minutes:e.minutes}];
  }

  /* ---------- IB: one button per presentation ---------- */
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
  function initIB(manifest){
    var blocks=document.querySelectorAll('.deck-block'); if(!blocks.length) return;
    var list=[]; for(var i=0;i<blocks.length;i++) list.push(blocks[i]);
    list.forEach(function(block){
      var key=deckKey(block,list); if(!key) return;
      var e=manifest.episodes[key]; if(!e) return;
      var h3=block.querySelector('h3'); if(!h3) return;
      var head=document.createElement('div'); head.className='pc-deckhead';
      block.insertBefore(head,h3); head.appendChild(h3);
      build(tracksFor(e,key,h3.textContent.trim()),function(w,tEl){ head.appendChild(w); if(tEl) block.insertBefore(tEl,head.nextSibling); },true);
    });
  }

  /* ---------- BTEC (and any other page with a header): one button in the header ---------- */
  function initHero(manifest){
    var hero=document.querySelector('.topic-hero')||document.querySelector('.lesson-hero'); if(!hero) return;
    var inner=hero.querySelector('.topic-hero-inner')||hero.querySelector('.lesson-hero-inner')||hero;
    var h1=hero.querySelector('h1'); var title=hero.getAttribute('data-podcast-title')||(h1?h1.textContent.trim():'this topic');
    var forced=hero.getAttribute('data-podcast-src'), key=pageKey(), e=manifest&&manifest.episodes&&manifest.episodes[key];
    var tr=forced?[{src:forced,title:title}]:(e?tracksFor(e,key,title):null); if(!tr) return;
    build(tr,function(w,tEl){ inner.insertBefore(w,inner.firstChild); hero.classList.add('has-podcast'); if(tEl) inner.appendChild(tEl); },false);
  }

  if(!window.fetch) return;
  fetch(BASE+'podcasts.json?v='+Math.floor(Date.now()/300000),{cache:'no-cache'})
    .then(function(r){ return r.ok?r.json():null; })
    .then(function(m){ if(!m||!m.episodes) m={episodes:{}}; if(isIB) initIB(m); else initHero(m); })
    .catch(function(){});
})();
