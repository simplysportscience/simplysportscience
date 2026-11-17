/* Simply Sport Science – podcast panel (production)
   A neat stacked panel on the right of the page header, shown only when an episode exists.
   One row per presentation (IB / AS Level), or a single row (BTEC). A row with several episodes shows numbered squares.
   One shared player for the page: the panel's title line becomes the player (time + controls) while something plays,
   and a slim bar at the bottom of the screen keeps the controls in reach once the panel has scrolled out of view.
   Episodes live in the separate audio site; podcasts.json there lists which episodes exist.
   BTEC pages → one row                       (btec-learn-u01-… → btec-u01 | btec-unit-08-… → btec-old-08)
   IB / AS Level pages → one row per presentation (named after the slide folder, e.g. ib-a2-3-2 or cam-1-1-synovial-joints);
                AS Level topics may also have one whole-topic episode, named cam-N, shown as the first row.
   Change window.SSS_PODCAST_BASE (before this script) or the default below to move the audio to a new host. */
(function(){
  var BASE=window.SSS_PODCAST_BASE||'https://simplysportscience.github.io/podcasts/';
  if(BASE.slice(-1)!=='/') BASE+='/';
  var file=(location.pathname.split('/').pop()||'index.html').replace(/\.html?$/,'');
  var isIB=/^(ib-[a-d]\d+-\d+|cam-\d+)-/.test(file);

  function pageKey(){
    var m=file.match(/^btec-learn-u(\d+)-/); if(m) return 'btec-u'+m[1];
    m=file.match(/^btec-unit-(\d+)-/); if(m) return 'btec-old-'+m[1];
    m=file.match(/^(ib-[a-d]\d+-\d+)-/); if(m) return m[1];
    m=file.match(/^(cam-\d+)-/); if(m) return m[1];
    return file;
  }
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
  function fmt(s){ if(!isFinite(s)) return '0:00'; s=Math.max(0,Math.round(s)); var m=Math.floor(s/60), r=s%60; return m+':'+(r<10?'0':'')+r; }

  var MARK='<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path d="M15.15 39.14A22 22 0 1 1 48.85 39.14" fill="none" stroke="#C9F6FF" stroke-width="5.2" stroke-linecap="round"/><path d="M21.66 33.68A13.5 13.5 0 1 1 42.34 33.68" fill="none" stroke="#fff" stroke-width="5.2" stroke-linecap="round"/><circle cx="32" cy="25" r="6.6" fill="#FFD66B"/><path d="M32 33.8c-2.5 0-4.2 1.7-4.4 4.1l-.8 12.4c-.2 2.9 2 5.2 5.2 5.2s5.4-2.3 5.2-5.2l-.8-12.4c-.2-2.4-1.9-4.1-4.4-4.1z" fill="#FFD66B"/></svg>';
  var I_PLAY='<svg class="pc-i-play" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';
  var I_PAUSE='<svg class="pc-i-pause" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="6" y="5" width="4" height="14" rx="1.2" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1.2" fill="currentColor"/></svg>';

  /* An entry in podcasts.json is either one episode {file,title,minutes}
     or several under one row: {tracks:[{file,title,label,minutes}, ...]} */
  function tracksFor(e,key,fallbackTitle){
    if(e.tracks&&e.tracks.length) return e.tracks.map(function(t,i){ return {src:BASE+t.file,title:t.title||(fallbackTitle+' – episode '+(i+1)),label:t.label,minutes:t.minutes}; });
    return [{src:BASE+(e.file||(key+'.mp3')),title:e.title||fallbackTitle,minutes:e.minutes}];
  }
  function heroParts(){
    var hero=document.querySelector('.topic-hero')||document.querySelector('.lesson-hero'); if(!hero) return null;
    return {hero:hero, inner:hero.querySelector('.topic-hero-inner')||hero.querySelector('.lesson-hero-inner')||hero};
  }

  /* ---------- the panel ----------
     items = [{code:'B.2.1.1', name:'Newton\'s Laws of Motion', tracks:[{src,title,label,minutes}, ...]}, ...] */
  function buildPanel(items,hp){
    var total=0; items.forEach(function(it){ total+=it.tracks.length; });
    var panel=document.createElement('div'); panel.className='pc-panel'; panel.setAttribute('role','group'); panel.setAttribute('aria-label','Podcast episodes');
    var html=
      '<div class="pc-head"><span class="pc-mark">'+MARK+'</span><span class="pc-htxt">Podcast</span><span class="pc-count">'+total+(total===1?' episode':' episodes')+'</span>'+
        '<span class="pc-live"><span class="pc-time" role="status" aria-live="off"></span>'+
          '<button class="pc-mini pc-back" type="button" aria-label="Back 15 seconds">−15</button>'+
          '<button class="pc-mini pc-speed" type="button" aria-label="Playback speed">1×</button>'+
          '<button class="pc-mini pc-fwd" type="button" aria-label="Forward 15 seconds">+15</button></span>'+
        '<input class="pc-seek" type="range" min="0" max="1000" value="0" step="1" aria-label="Seek within podcast episode"></div>';
    items.forEach(function(it,i){
      var multi=it.tracks.length>1, mins=it.tracks[0].minutes;
      var sub=[it.code, multi?(it.tracks.length+' episodes'):(mins?(mins+' min'):'')].filter(Boolean).join(' · ');
      var btns='';
      it.tracks.forEach(function(t,k){
        var tip=(t.label||t.title)+(t.minutes?' · '+t.minutes+' min':'');
        btns+= multi
          ? '<button class="pc-sq pc-n" type="button" data-i="'+i+'" data-k="'+k+'" title="'+esc(tip)+'" aria-label="Play episode '+(k+1)+': '+esc(t.title)+'">'+(k+1)+'</button>'
          : '<button class="pc-sq pc-p" type="button" data-i="'+i+'" data-k="'+k+'" aria-label="Play podcast episode: '+esc(t.title)+'">'+I_PLAY+I_PAUSE+'</button>';
      });
      html+='<div class="pc-row" data-i="'+i+'"><div class="pc-tx"><span class="pc-cd">'+esc(sub)+'</span>'+(it.name?'<span class="pc-nm" title="'+esc(it.name)+'">'+esc(it.name)+'</span>':'')+'</div><div class="pc-btns">'+btns+'</div></div>';
    });
    html+='<audio preload="none"></audio>';
    panel.innerHTML=html;

    /* slim bar fixed to the bottom of the screen: appears while playing once the panel is scrolled out of view */
    var bar=document.createElement('div'); bar.className='pc-fixed'; bar.setAttribute('role','group'); bar.setAttribute('aria-label','Podcast player');
    bar.innerHTML='<button class="pc-sq pc-p pc-fp" type="button" aria-label="Play or pause podcast">'+I_PLAY+I_PAUSE+'</button>'+
      '<div class="pc-ftx"><span class="pc-fnm"></span><span class="pc-ftm"></span></div>'+
      '<button class="pc-mini pc-fback" type="button" aria-label="Back 15 seconds">−15</button><button class="pc-mini pc-ffwd" type="button" aria-label="Forward 15 seconds">+15</button>'+
      '<input class="pc-seek pc-fseek" type="range" min="0" max="1000" value="0" step="1" aria-label="Seek within podcast episode">';
    document.body.appendChild(bar);

    var audio=panel.querySelector('audio'), head=panel.querySelector('.pc-head'), htxt=panel.querySelector('.pc-htxt'),
        timeEl=panel.querySelector('.pc-time'), seek=panel.querySelector('.pc-seek'), speedBtn=panel.querySelector('.pc-speed'),
        fseek=bar.querySelector('.pc-fseek'), fnm=bar.querySelector('.pc-fnm'), ftm=bar.querySelector('.pc-ftm');
    var rows=panel.querySelectorAll('.pc-row'), sqs=panel.querySelectorAll('.pc-row .pc-sq');
    var cur={i:-1,k:0}, loaded=null, started=false, seeking=false, lastSave=0, speeds=[1,1.25,1.5,0.75], si=0, countedSrc={};
    function track(){ return cur.i<0?null:items[cur.i].tracks[cur.k]; }
    function store(t){ return 'sss-podcast-pos:'+t.src; }
    function savedPos(t){ var v=0; try{ v=parseFloat(localStorage.getItem(store(t))||'0'); }catch(e){} return v||0; }
    function savePos(){ var t=track(); if(t){ try{ localStorage.setItem(store(t),String(audio.currentTime)); }catch(e){} } }

    function paint(){
      var playing=!audio.paused && started, t=track();
      panel.classList.toggle('is-started',started); panel.classList.toggle('is-playing',playing);
      bar.classList.toggle('is-playing',playing);
      htxt.textContent=started?(playing?'Playing':'Paused'):'Podcast';
      for(var r=0;r<rows.length;r++){ var on=(r===cur.i); rows[r].classList.toggle('is-on',on); rows[r].classList.toggle('is-playing',on&&playing); }
      for(var s=0;s<sqs.length;s++){
        var si_=+sqs[s].getAttribute('data-i'), sk=+sqs[s].getAttribute('data-k'), me=(si_===cur.i&&sk===cur.k);
        sqs[s].classList.toggle('is-on',me); sqs[s].setAttribute('aria-pressed',(me&&playing)?'true':'false');
      }
      if(t){ fnm.textContent=(items[cur.i].code?items[cur.i].code+' · ':'')+(t.label||t.title); }
    }
    function render(){
      var d=audio.duration, tm=audio.currentTime, f=(d&&isFinite(d))?tm/d:0;
      if(!seeking){ seek.value=Math.round(f*1000); fseek.value=Math.round(f*1000); }
      var txt=fmt(tm)+' / '+fmt(d);
      timeEl.textContent=txt; ftm.textContent=txt;
      seek.style.setProperty('--pc-f',(f*100)+'%'); fseek.style.setProperty('--pc-f',(f*100)+'%');
    }
    function ensureSrc(t){ if(loaded!==t.src){ audio.src=t.src; loaded=t.src; } }
    function startPlay(){
      var t=track(); if(!t) return;
      if(loaded!==t.src){
        var s=savedPos(t);
        var go=function(){ if(s>5 && (!isFinite(audio.duration)||s<audio.duration-5)){ try{audio.currentTime=s;}catch(e){} } };
        ensureSrc(t); audio.addEventListener('loadedmetadata',go,{once:true});
      }
      if(!countedSrc[t.src]){ countedSrc[t.src]=1; try{ if(window.goatcounter&&window.goatcounter.count){ window.goatcounter.count({path:'podcast/'+t.src.split('/').pop().replace(/\.\w+$/,''),title:'Podcast play',event:true}); } }catch(e){} }
      var p=audio.play(); if(p&&p.catch) p.catch(function(){});
    }
    function choose(i,k){
      if(cur.i===i && cur.k===k && loaded){ if(audio.paused) startPlay(); else audio.pause(); return; }
      if(!audio.paused) audio.pause();
      savePos();
      cur={i:i,k:k}; started=false; loaded=null; audio.removeAttribute('src'); try{audio.load();}catch(e){}
      seek.value=0; fseek.value=0; timeEl.textContent=''; ftm.textContent='';
      panel.classList.remove('is-unavailable');
      paint(); startPlay();
    }
    panel.addEventListener('click',function(e){
      var b=e.target.closest&&e.target.closest('.pc-sq'); if(!b||b.disabled) return;
      choose(+b.getAttribute('data-i'),+b.getAttribute('data-k'));
    });
    bar.querySelector('.pc-fp').addEventListener('click',function(){ if(audio.paused) startPlay(); else audio.pause(); });

    audio.addEventListener('play',function(){ started=true; paint(); render(); });
    audio.addEventListener('pause',function(){ savePos(); paint(); });
    audio.addEventListener('loadedmetadata',render);
    audio.addEventListener('timeupdate',function(){ render(); var n=Date.now(); if(n-lastSave>4000){ lastSave=n; savePos(); } });
    audio.addEventListener('ended',function(){
      var t=track(); try{ localStorage.removeItem(store(t)); }catch(e){}
      var it=items[cur.i];
      if(it.tracks.length>1 && cur.k<it.tracks.length-1){ var nk=cur.k+1; loaded=null; cur={i:cur.i,k:nk}; started=false; audio.removeAttribute('src'); paint(); startPlay(); return; }
      audio.currentTime=0; started=false; paint(); seek.value=0; fseek.value=0;
      seek.style.setProperty('--pc-f','0%'); fseek.style.setProperty('--pc-f','0%');
    });
    audio.addEventListener('error',function(){
      if(!audio.getAttribute('src')) return;
      panel.classList.add('is-unavailable'); started=false; paint(); htxt.textContent='Episode coming soon';
    });
    function back(){ audio.currentTime=Math.max(0,audio.currentTime-15); }
    function fwd(){ audio.currentTime=Math.min(audio.duration||0,audio.currentTime+15); }
    panel.querySelector('.pc-back').addEventListener('click',back); panel.querySelector('.pc-fwd').addEventListener('click',fwd);
    bar.querySelector('.pc-fback').addEventListener('click',back); bar.querySelector('.pc-ffwd').addEventListener('click',fwd);
    speedBtn.addEventListener('click',function(){ si=(si+1)%speeds.length; audio.playbackRate=speeds[si]; speedBtn.textContent=speeds[si]+'×'; });
    [seek,fseek].forEach(function(el){
      el.addEventListener('input',function(){ seeking=true; if(isFinite(audio.duration)){ audio.currentTime=(el.value/1000)*audio.duration; render(); } });
      el.addEventListener('change',function(){ seeking=false; });
    });

    /* the bottom bar shows only while an episode has started and the panel itself is off screen */
    var panelVisible=true;
    function syncBar(){ bar.classList.toggle('is-shown',started && !panelVisible); }
    audio.addEventListener('play',syncBar); audio.addEventListener('pause',syncBar); audio.addEventListener('ended',syncBar);
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(en){ panelVisible=en[0].isIntersecting; syncBar(); },{threshold:0.05}).observe(panel);
    }

    /* place in the header: first on wide screens (floats right), after the text on phones */
    function place(){
      var phone=window.matchMedia&&window.matchMedia('(max-width:640px)').matches;
      if(phone){ if(panel.parentNode!==hp.inner||panel.nextSibling) hp.inner.appendChild(panel); }
      else if(hp.inner.firstChild!==panel) hp.inner.insertBefore(panel,hp.inner.firstChild);
    }
    hp.hero.classList.add('has-podcast'); place();
    window.addEventListener('resize',function(){ place(); });
    paint();
  }

  /* ---------- IB / AS Level: one row per presentation ---------- */
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
  function splitHeading(text){
    var m=/^([A-D]\.\d+(?:\.\d+){0,2})\s*(.*)$/.exec(text)||/^(\d+[a-z]?(?:\.\d+[a-z]?)?)\s+(.*)$/.exec(text);
    return m?{code:m[1],name:m[2]||''}:{code:'',name:text};
  }
  function initIB(manifest){
    var hp=heroParts(); if(!hp) return;
    var blocks=document.querySelectorAll('.deck-block'); if(!blocks.length) return;
    var list=[]; for(var i=0;i<blocks.length;i++) list.push(blocks[i]);
    var items=[];
    list.forEach(function(block){
      var key=deckKey(block,list); if(!key) return;
      var e=manifest.episodes[key]; if(!e) return;
      var h3=block.querySelector('h3'); if(!h3) return;
      var text=h3.textContent.replace(/\s+/g,' ').trim(), sp=splitHeading(text);
      items.push({tracks:tracksFor(e,key,text),code:sp.code,name:sp.name});
    });
    /* AS Level: a whole-topic episode (named after the page, e.g. cam-3) is the first row */
    var topicE=/^cam-/.test(file)?manifest.episodes[pageKey()]:null;
    if(topicE){ var th1=hp.hero.querySelector('h1'), tt=th1?th1.textContent.trim():'this topic'; items.unshift({tracks:tracksFor(topicE,pageKey(),tt),code:'Topic',name:tt}); }
    if(!items.length) return;
    buildPanel(items,hp);
  }

  /* ---------- BTEC (and any other header page): one row ---------- */
  function initHero(manifest){
    var hp=heroParts(); if(!hp) return;
    var h1=hp.hero.querySelector('h1'); var title=hp.hero.getAttribute('data-podcast-title')||(h1?h1.textContent.trim():'this topic');
    var forced=hp.hero.getAttribute('data-podcast-src'), key=pageKey(), e=manifest&&manifest.episodes&&manifest.episodes[key];
    var tr=forced?[{src:forced,title:title}]:(e?tracksFor(e,key,title):null); if(!tr) return;
    var m=/^btec-(?:u|old-)(\d+)$/.exec(key), code=m?('Unit '+parseInt(m[1],10)):'';
    buildPanel([{tracks:tr,code:code,name:tr.length>1?title:tr[0].title}],hp);
  }

  if(!window.fetch) return;
  fetch(BASE+'podcasts.json?v='+Math.floor(Date.now()/300000),{cache:'no-cache'})
    .then(function(r){ return r.ok?r.json():null; })
    .then(function(m){ if(!m||!m.episodes) m={episodes:{}}; if(isIB) initIB(m); else initHero(m); })
    .catch(function(){});
})();
