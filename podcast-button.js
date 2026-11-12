/* Simply Sport Science – podcast button (production)
   Shows a circular "Podcast" button in the page header when an episode exists for the page.
   Episodes live in the separate audio site; podcasts.json there lists which episodes exist.
   Page → episode name:  btec-learn-u01-…  → btec-u01   |   btec-unit-08-…  → btec-old-08   |  anything else → its own file name.
   Change window.SSS_PODCAST_BASE (before this script) or the default below to move the audio to a new host. */
(function(){
  var BASE=window.SSS_PODCAST_BASE||'https://simplysportscience.github.io/podcasts/';
  if(BASE.slice(-1)!=='/') BASE+='/';
  var hero=document.querySelector('.topic-hero')||document.querySelector('.lesson-hero');
  if(!hero) return;
  var inner=hero.querySelector('.topic-hero-inner')||hero.querySelector('.lesson-hero-inner')||hero;
  var h1=hero.querySelector('h1');
  var title=hero.getAttribute('data-podcast-title')||(h1?h1.textContent.trim():'this topic');

  function episodeKey(){
    var f=(location.pathname.split('/').pop()||'index.html').replace(/\.html?$/,'');
    var m=f.match(/^btec-learn-u(\d+)-/); if(m) return 'btec-u'+m[1];
    m=f.match(/^btec-unit-(\d+)-/); if(m) return 'btec-old-'+m[1];
    return f;
  }
  var ICON_PODCAST='<svg class="pc-icon pc-icon-podcast" viewBox="0 0 64 64" aria-hidden="true" focusable="false">'+
    '<path class="pc-arc pc-arc-outer" d="M15.15 39.14A22 22 0 1 1 48.85 39.14" fill="none" stroke="url(#pc-ag)" stroke-width="4.6" stroke-linecap="round"/>'+
    '<path class="pc-arc pc-arc-inner" d="M21.66 33.68A13.5 13.5 0 1 1 42.34 33.68" fill="none" stroke="#FFFFFF" stroke-width="4.6" stroke-linecap="round"/>'+
    '<circle cx="32" cy="25" r="6.6" fill="url(#pc-ig)"/>'+
    '<path d="M32 33.8c-2.5 0-4.2 1.7-4.4 4.1l-.8 12.4c-.2 2.9 2 5.2 5.2 5.2s5.4-2.3 5.2-5.2l-.8-12.4c-.2-2.4-1.9-4.1-4.4-4.1z" fill="url(#pc-ig)"/></svg>';
  var ICON_PAUSE='<svg class="pc-icon pc-icon-pause" viewBox="0 0 64 64" aria-hidden="true" focusable="false">'+
    '<rect x="16" y="13" width="12" height="38" rx="3.6" fill="url(#pc-ig)"/><rect x="36" y="13" width="12" height="38" rx="3.6" fill="url(#pc-ig)"/></svg>';


  function init(src){
    var key='sss-podcast-pos:'+src;
  var wrap=document.createElement('div'); wrap.className='pc-wrap';
  wrap.innerHTML=
    '<button class="pc-btn" type="button" aria-pressed="false" aria-label="Play podcast episode: '+title.replace(/"/g,'&quot;')+'">'+
      '<svg class="pc-ring" viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="pc-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F5C866"/><stop offset="1" stop-color="#22D3EE"/></linearGradient><linearGradient id="pc-ig" gradientUnits="userSpaceOnUse" x1="14" y1="8" x2="50" y2="58"><stop offset="0" stop-color="#FFF6D6"/><stop offset="1" stop-color="#F5B840"/></linearGradient><linearGradient id="pc-ag" gradientUnits="userSpaceOnUse" x1="10" y1="0" x2="54" y2="0"><stop offset="0" stop-color="#E0FBFF"/><stop offset="1" stop-color="#22D3EE"/></linearGradient></defs>'+
      '<circle class="pc-ring-track" cx="60" cy="60" r="54"/><circle class="pc-ring-fill" cx="60" cy="60" r="54"/></svg>'+
      '<span class="pc-face">'+ICON_PODCAST+ICON_PAUSE+'<span class="pc-label">Podcast</span></span>'+
    '</button>'+
    '<div class="pc-status" role="status" aria-live="polite">Listen now</div>'+
    '<input class="pc-seek" type="range" min="0" max="1000" value="0" step="1" aria-label="Seek within podcast episode">'+
    '<div class="pc-controls"><button class="pc-mini pc-back" type="button" aria-label="Back 15 seconds">−15s</button>'+
      '<button class="pc-mini pc-speed" type="button" aria-label="Playback speed">1×</button>'+
      '<button class="pc-mini pc-fwd" type="button" aria-label="Forward 15 seconds">+15s</button></div>'+
    '<audio preload="metadata"></audio>';
  inner.insertBefore(wrap,inner.firstChild); hero.classList.add('has-podcast');

  var audio=wrap.querySelector('audio'), btn=wrap.querySelector('.pc-btn'), fill=wrap.querySelector('.pc-ring-fill'),
      status=wrap.querySelector('.pc-status'), seek=wrap.querySelector('.pc-seek'), speedBtn=wrap.querySelector('.pc-speed');
  var C=339.292, speeds=[1,1.25,1.5,0.75], si=0, lastSave=0, seeking=false;
  audio.src=src;

  function fmt(s){ if(!isFinite(s)) return '0:00'; s=Math.max(0,Math.round(s)); var m=Math.floor(s/60), r=s%60; return m+':'+(r<10?'0':'')+r; }
  function idleText(){
    if(!isFinite(audio.duration)) return 'Listen now';
    var saved=parseFloat(localStorage.getItem(key)||'0');
    if(saved>5 && saved<audio.duration-5) return 'Resume from <b>'+fmt(saved)+'</b>';
    return 'Listen · <b>'+fmt(audio.duration)+'</b>';
  }
  function setPlaying(p){
    wrap.classList.toggle('is-playing',p); btn.setAttribute('aria-pressed',p?'true':'false');
    btn.setAttribute('aria-label',(p?'Pause':'Play')+' podcast episode: '+title);
  }
  function render(){
    var d=audio.duration, t=audio.currentTime, f=(d&&isFinite(d))?t/d:0;
    fill.style.strokeDashoffset=C*(1-f);
    if(!seeking) seek.value=Math.round(f*1000);
    if(wrap.classList.contains('has-started')) status.innerHTML='<b>'+fmt(t)+'</b> / '+fmt(d);
  }
  audio.addEventListener('loadedmetadata',function(){ status.innerHTML=idleText(); });
  audio.addEventListener('timeupdate',function(){
    render();
    var now=Date.now(); if(now-lastSave>4000){ lastSave=now; try{localStorage.setItem(key,String(audio.currentTime));}catch(e){} }
  });
  audio.addEventListener('play',function(){ setPlaying(true); wrap.classList.add('has-started'); render(); });
  audio.addEventListener('pause',function(){ setPlaying(false); try{localStorage.setItem(key,String(audio.currentTime));}catch(e){} });
  audio.addEventListener('ended',function(){ setPlaying(false); try{localStorage.removeItem(key);}catch(e){} audio.currentTime=0; wrap.classList.remove('has-started'); fill.style.strokeDashoffset=C; seek.value=0; status.innerHTML='Listen again · <b>'+fmt(audio.duration)+'</b>'; });
  audio.addEventListener('error',function(){ wrap.classList.add('is-unavailable'); btn.disabled=true; status.textContent='Episode coming soon'; });

  btn.addEventListener('click',function(){
    if(audio.paused){
      document.dispatchEvent(new CustomEvent('sss-podcast-play',{detail:wrap}));
      if(!wrap.classList.contains('has-started')){
        var saved=parseFloat(localStorage.getItem(key)||'0');
        if(saved>5 && isFinite(audio.duration) && saved<audio.duration-5) audio.currentTime=saved;
        try{ if(window.goatcounter&&window.goatcounter.count){ window.goatcounter.count({path:'podcast/'+src.split('/').pop().replace(/\.\w+$/,''),title:'Podcast play',event:true}); } }catch(e){}
      }
      var p=audio.play(); if(p&&p.catch) p.catch(function(){});
    } else { audio.pause(); }
  });
  document.addEventListener('sss-podcast-play',function(e){ if(e.detail!==wrap && !audio.paused) audio.pause(); });

  wrap.querySelector('.pc-back').addEventListener('click',function(){ audio.currentTime=Math.max(0,audio.currentTime-15); });
  wrap.querySelector('.pc-fwd').addEventListener('click',function(){ audio.currentTime=Math.min(audio.duration||0,audio.currentTime+15); });
  speedBtn.addEventListener('click',function(){ si=(si+1)%speeds.length; audio.playbackRate=speeds[si]; speedBtn.textContent=speeds[si]+'×'; });
  seek.addEventListener('input',function(){ seeking=true; if(isFinite(audio.duration)){ audio.currentTime=(seek.value/1000)*audio.duration; render(); } });
  seek.addEventListener('change',function(){ seeking=false; });

  }

  var forced=hero.getAttribute('data-podcast-src');
  if(forced){ init(forced); return; }
  var k=episodeKey();
  if(!window.fetch) return;
  fetch(BASE+'podcasts.json?v='+Math.floor(Date.now()/300000),{cache:'no-cache'})
    .then(function(r){ return r.ok?r.json():null; })
    .then(function(m){ if(m&&m.episodes&&m.episodes[k]){ var e=m.episodes[k]; init(BASE+(e.file||(k+'.mp3'))); } })
    .catch(function(){});
})();
