const STAR_PATH='M12 2.4l2.47 5.01 5.53.8-4 3.9.94 5.49L12 15.27l-4.94 2.33.94-5.49-4-3.9 5.53-.8L12 2.4z';

    function buildGiantStarSVG(r){
      const p=Math.max(0,Math.min(100,(r/5)*100)),u='gs-'+Math.random().toString(36).substr(2,9);
      return`<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="${u}"><rect x="0" y="0" width="${p}%" height="24"/></clipPath></defs><path d="${STAR_PATH}" fill="var(--star-empty)" stroke="var(--star-empty)" stroke-width="0.5" stroke-linejoin="round"/><path d="${STAR_PATH}" fill="var(--star-fill)" clip-path="url(#${u})" stroke="var(--star-fill)" stroke-width="0.3" stroke-linejoin="round"/></svg>`;
    }

    function buildGiantRating(r){
      const v=Math.max(0,Math.min(5,r)),d=v%1===0?v.toFixed(0):v.toFixed(1);
      return`<div class="giant-rating"><span class="rating-num-display">${d}</span><div class="giant-star-wrap">${buildGiantStarSVG(v)}</div></div>`;
    }

    const TRUSTPILOT_LOGO=`<svg class="trustpilot-star" viewBox="0 0 24 24" fill="#00b67a" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.1l2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 16.2l-5.4 2.7 1-6.1-4.4-4.3 6.1-.9z"/></svg><span class="trustpilot-wordmark">Trustpilot</span>`;

    function getDomain(url){
      try{ return new URL(url).hostname.replace(/^www\./,''); }catch(e){ return ''; }
    }

    function buildFaviconHTML(url){
      const domain=getDomain(url);
      const src=domain?`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`:'';
      if(!src) return `<div class="curated-link-favicon"><div class="favicon-fallback"></div></div>`;
      return `<div class="curated-link-favicon"><img src="${src}" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><div class="favicon-fallback" style="display:none"></div></div>`;
    }

    function showToast(m){const t=document.getElementById('toastNotif');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2400);}

    function initTheme(){
      const s=localStorage.getItem('theme')||'dark';document.documentElement.setAttribute('data-theme',s);
      const tt=document.getElementById('theme-toggle'),k=tt.querySelector('svg');
      function u(t){k.innerHTML=t==='dark'?'<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>':'<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';}
      u(s);tt.addEventListener('click',()=>{const c=document.documentElement.getAttribute('data-theme'),n=c==='dark'?'light':'dark';document.documentElement.setAttribute('data-theme',n);localStorage.setItem('theme',n);u(n);});
    }

    function showHamburgerMenu(){document.getElementById('hamburger-menu').classList.add('show');document.getElementById('hamburger-overlay').classList.add('show');}
    function hideHamburgerMenu(){document.getElementById('hamburger-menu').classList.remove('show');document.getElementById('hamburger-overlay').classList.remove('show');}
    document.getElementById('hamburger-btn').addEventListener('click',showHamburgerMenu);
    document.getElementById('hamburger-close').addEventListener('click',hideHamburgerMenu);
    document.getElementById('hamburger-overlay').addEventListener('click',hideHamburgerMenu);

    const CREATORS_DATA=[
      {id:1,name:"Cyber Maddy",handle:"@cybermaddy",initials:"CM",avatar:"creators/img/cyb3rmaddy-pdp.png",verified:true,category:"Security",bio:"Security researcher & content creator focused on cybersecurity education, threat intelligence, and career development resources.",links:15,url:"creators/cyb3rmaddy.html",socials:{x:"https://x.com/Cyb3rMaddy",youtube:"https://www.youtube.com/channel/UCgd5-BWtbgOw5Hx2wP3qxzg",github:"https://github.com/Cyb3rMaddy",website:"https://linktr.ee/Cyb3rMaddy"}},
      {id:2,name:"Dr. Chengdiao Fan",handle:"@chengdiaofan",initials:"CF",avatar:"https://cdn-ilehkna.nitrocdn.com/HWkhaRwUyufobGYsEqsSlFCDqvvZeqjw/assets/images/optimized/rev-a54c932/minepi.com/wp-content/uploads/2022/09/Dr.-Chengdiao-Fan-1-1.jpg",verified:true,category:"Anthropological Sciences",bio:"Dr. Chengdiao Fan is a Stanford-trained PhD in Anthropological Sciences and the co-founder and Head of Product of Pi Network.",links:0,url:"creators/chengdiaofan.html",socials:{x:"https://x.com/Chengdiao",youtube:"https://www.youtube.com/hashtag/drchengdiaofan"}},
      {id:3,name:"John Hammond",handle:"@johnhammond010",initials:"JH",avatar:"creators/img/johnammond.jpg",verified:true,category:"Hacking",bio:"Cybersecurity researcher, educator and content creator.",links:24,url:"creators/johnhammond.html",socials:{x:"https://x.com/JohnHammond010",youtube:"https://www.youtube.com/c/JohnHammond010",github:"https://github.com/JohnHammond"}},
      {id:4,name:"Cleo Abram",handle:"@cleoabram",initials:"CA",avatar:"img/cleoabram.jpg",verified:true,category:"Tech / Journalism",bio:"Video journalist making optimistic tech explainers. Huge If True.",links:0,url:"creators/cleoabram.html",socials:{x:"https://x.com/cleoabram",youtube:"https://www.youtube.com/@CleoAbram",instagram:"https://www.instagram.com/cleoabram/",tiktok:"https://www.tiktok.com/@cleoabram"}},
      {id:5,name:"Natalie Brunell",handle:"@natbrunell",initials:"NB",avatar:"creators/img/natpfp.jpg",verified:true,category:"Crypto",bio:"Investing journalist, podcaster and Bitcoin educator.",links:15,url:"creators/nataliebrunell.html",socials:{x:"https://www.x.com/natbrunell",youtube:"https://www.youtube.com/@nataliebrunell",spotify:"https://open.spotify.com/show/0YOEwxAR1uIx1a15QpqE0l",apple_podcast:"https://podcasts.apple.com/us/podcast/coin-stories-with-natalie-brunell/id1569130932"}},
      {id:6,name:"Ebolaman",handle:"@ebolaman",initials:"EM",avatar:"creators/img/ebolamanpic.jpg",verified:true,category:"Hacking",bio:"I develop and showcase practical scripts to teach how modern systems can be tested, understood, and secured.",links:15,url:"creators/ebolaman.html",socials:{youtube:"https://www.youtube.com/@ebolaman_",github:"https://github.com/EbolaMan-YT"}}
    ];

    const ICONS={
      x:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
      youtube:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
      github:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.5 11.5 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>',
      instagram:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.75 2h8.5A5.76 5.76 0 0 1 22 7.75v8.5A5.76 5.76 0 0 1 16.25 22h-8.5A5.76 5.76 0 0 1 2 16.25v-8.5A5.76 5.76 0 0 1 7.75 2Zm0 2A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4h-8.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.25-2.15a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3Z"/></svg>',
      tiktok:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 5.82A5.56 5.56 0 0 0 20 7V3.4a5.6 5.6 0 0 1-3.4-1.16A5.6 5.6 0 0 1 14.7 0h-3.6v15.25a3.05 3.05 0 1 1-2.1-2.9V8.68a6.65 6.65 0 1 0 5.7 6.57V7.66a9.1 9.1 0 0 0 5.3 1.7V5.75a5.56 5.56 0 0 1-3.4-1.13Z"/></svg>',
      spotify:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>',
      apple_podcast:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>',
      website:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
      pencil:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>'
    };

    const CONFIG={itemsPerPage:8,animationDelay:0.05,visibleCurated:4};
    let state={currentPage:1,filteredData:[...CREATORS_DATA],searchQuery:''};
    const el={grid:document.getElementById('creatorsGrid'),pagination:document.getElementById('pagination'),searchInput:document.getElementById('searchInput'),totalCreators:document.getElementById('totalCreatorsHeader'),totalLinks:document.getElementById('totalLinksHeader'),scrollProgress:document.getElementById('scrollProgress'),backToTop:document.getElementById('backToTop'),glassContainer:document.getElementById('glassContainer'),tabCreators:document.getElementById('tabCreators'),tabCurators:document.getElementById('tabCurators'),viewsTrack:document.getElementById('viewsTrack'),curatorsGrid:document.getElementById('curatorsGrid')};

    function debounce(f,w){let t;return function(...a){clearTimeout(t);t=setTimeout(()=>f.apply(this,a),w);};}

    function createSocialLinks(c){
      if(!c.socials)return'';
      const o=[['x','X'],['youtube','YouTube'],['instagram','Instagram'],['tiktok','TikTok'],['github','GitHub'],['spotify','Spotify'],['apple_podcast','Apple Podcasts'],['website','Website']];
      let h='<div class="social-links">';
      o.forEach(([k,l])=>{const u=c.socials[k];if(u&&u!=='#'&&ICONS[k])h+=`<a href="${u}" class="social-link" title="${l}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">${ICONS[k]}</a>`;});
      return h+'</div>';
    }

    function createCreatorCard(cr,i){
      const c=document.createElement('article');c.className='creator-card';c.style.transitionDelay=`${i*CONFIG.animationDelay}s`;
      if(cr.url&&cr.url!=='#')c.onclick=()=>window.location.href=cr.url;
      const av=cr.avatar?`<img src="${cr.avatar}" alt="${cr.name}">`:cr.initials;
      const vb=cr.verified?'<div class="avatar-badge"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg></div>':'';
      c.innerHTML=`<div class="card-inner"><div class="creator-avatar"><div class="avatar-ring"><div class="avatar-img">${av}</div></div>${vb}</div><div class="card-content"><div class="creator-header"><span class="creator-name">${cr.name}</span>${createSocialLinks(cr)}</div><div class="creator-handle">${cr.handle}</div><p class="creator-bio">${cr.bio}</p><div class="creator-meta"><span class="category-tag">${cr.category}</span><span class="meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg><strong>${cr.links}+</strong> links</span></div></div><div class="card-actions"><a href="${cr.url||'#'}" class="btn-action btn-primary" onclick="event.stopPropagation()"><span>View</span><span class="arrow">\u2192</span></a><a href="edit.html" class="btn-action btn-secondary" onclick="event.stopPropagation()">${ICONS.pencil}<span>Edit</span></a></div></div>`;
      return c;
    }

const CURATORS_DATA=[
  {
    name:"Marvyn George",
    handle:"@marvyn.george",
    avatar:"https://avatars.githubusercontent.com/u/206639457?v=4",
    badges:[
      {text:"Admin",type:"admin"},
      {text:"Founder Curator",type:"default"},
      {text:"Vibecoder",type:"vibecoder"}
    ],
    desc:"Founder-side curation for Bookmarks. This section is the heart of the project: explicit, human-picked links proposed by curators, with context, taste, and signal.",
    links:[]
  }
];

    function buildCuratedLinkHTML(l,av,n,role){
      const tp='https://www.trustpilot.com/search?q='+encodeURIComponent(l.title);
      return`<div class="curated-link" data-url="${l.url}" onclick="if(!event.target.closest('.expand-zone')&&!event.target.closest('.trustpilot-link'))window.open('${l.url}','_blank')">
        <div class="curated-link-top">
          <div class="curated-link-left">
            <div class="curated-link-title-row">
              ${buildFaviconHTML(l.url)}
              <div class="curated-link-title">${l.title}</div>
            </div>
            <div class="curated-link-desc">${l.desc}</div>
          </div>
          <div class="curated-link-right">
            <span class="curated-link-tag">${l.tag}</span>
            ${buildGiantRating(l.rating)}
            <a class="trustpilot-link" href="${tp}" target="_blank" rel="noopener noreferrer" title="View ${l.title} on Trustpilot" onclick="event.stopPropagation()">${TRUSTPILOT_LOGO}</a>
          </div>
        </div>
        <div class="expand-zone" onclick="event.stopPropagation()">
          <div class="curator-post">
            <div class="curator-post-header">
              <img class="curator-post-avatar" src="${av}" alt="${n}" onerror="this.style.display='none'">
              <div><div class="curator-post-name">${n}</div><div class="curator-post-role">${role}</div></div>
            </div>
            <p class="curator-post-text">${l.note}</p>
          </div>
        </div>
      </div>`;
    }

    function escapeHTML(value){
      return String(value ?? '')
        .replaceAll('&','&amp;')
        .replaceAll('<','&lt;')
        .replaceAll('>','&gt;')
        .replaceAll('"','&quot;')
        .replaceAll("'",'&#39;');
    }

    function getListPostsData(){
      const fallback = {
        profile: 'Marvyn George',
        posts: [
          {
            label: 'Current post',
            content: 'Edit listposts/marvyn-george.js to update this post.\n\nMove an older post into the archive array to keep it selectable here.',
          }
        ]
      };
      const data = window.CURATOR_LISTPOSTS;
      if(!data || !Array.isArray(data.posts) || !data.posts.length) return fallback;
      return {
        profile: data.profile || fallback.profile,
        posts: data.posts.map((post, index) => ({
          label: post.label || `Post ${index + 1}`,
          content: post.content || '',
        }))
      };
    }

    function buildListPostEditorHTML(){
      const data = getListPostsData();
      const options = data.posts.map((post, index) => `<option value="${index}">${escapeHTML(post.label)}</option>`).join('');
      const first = data.posts[0] || { label: 'Current post', content: '' };
      return `<div class="curator-post-toolbar">
        <div>
          <div class="curator-post-kicker">${escapeHTML(data.profile)}</div>
          <div class="curator-post-title" id="curatorListPostTitle">${escapeHTML(first.label)}</div>
        </div>
        <label class="curator-post-label">
          <span>Archive / current</span>
          <span class="curator-post-select-shell">
            <select class="curator-post-select" id="curatorListPostSelect" aria-label="Select curator post">${options}</select>
            <span class="curator-post-select-icon" aria-hidden="true"></span>
          </span>
        </label>
      </div>
      <pre class="curator-post-pre" id="curatorListPostPre"></pre>
      <div class="curator-post-foot">Edit <code>listposts/marvyn-george.js</code> to change the post content. Move an older post into <code>posts</code> to archive it and keep it selectable here.</div>`;
    }

    function renderCurators(){
      let h='';
      CURATORS_DATA.forEach((c)=>{
        const bh=(c.badges||[]).map(b=>'<span class="curator-badge '+(b.type==='admin'?'admin':'')+'">'+b.text+'</span>').join('');
        h+=`<article class="curator-card"><div class="curator-top"><div class="curator-avatar"><img src="${c.avatar}" alt="${c.name}"></div><div><div class="curator-name">${c.name}</div><div class="curator-handle">${c.handle}</div><div class="curator-badges">${bh}</div></div></div><p class="curator-desc">${c.desc||''}</p>${buildListPostEditorHTML()}</article>`;
      });
      el.curatorsGrid.innerHTML=h;
    }

    function initListPostEditor(){
      const select = document.getElementById('curatorListPostSelect');
      const pre = document.getElementById('curatorListPostPre');
      const title = document.getElementById('curatorListPostTitle');
      const data = getListPostsData();
      if(!select || !pre || !data.posts.length) return;
      const update = () => {
        const index = Number(select.value || 0);
        const post = data.posts[index] || data.posts[0];
        pre.textContent = post.content || '';
        if(title) title.textContent = post.label || 'Current post';
      };
      select.addEventListener('change', update);
      update();
    }
    function initScrollChaining(){
      const gc=el.glassContainer;
      gc.addEventListener('wheel',(e)=>{
        const atTop=gc.scrollTop<=0;
        const atBottom=Math.ceil(gc.scrollTop+gc.clientHeight)>=gc.scrollHeight;
        const goingUp=e.deltaY<0;
        const goingDown=e.deltaY>0;

        if((goingDown&&atBottom)||(goingUp&&atTop)){
          window.scrollBy({top:e.deltaY,behavior:'auto'});
        }
      },{passive:true});
    }

    function renderPage(){
      const tp=Math.ceil(state.filteredData.length/CONFIG.itemsPerPage),si=(state.currentPage-1)*CONFIG.itemsPerPage,pd=state.filteredData.slice(si,si+CONFIG.itemsPerPage);
      el.grid.innerHTML='';
      if(!pd.length){el.grid.innerHTML='<div style="text-align:center;padding:40px;color:var(--text-dim);">No creators found.</div>';el.pagination.innerHTML='';updateStats();return;}
      const obs=new IntersectionObserver(e=>{e.forEach(en=>{if(en.isIntersecting){en.target.classList.add('visible');obs.unobserve(en.target);}});},{threshold:0.1,root:el.glassContainer});
      pd.forEach((c,i)=>{const cd=createCreatorCard(c,i);el.grid.appendChild(cd);obs.observe(cd);});
      updateStats();renderPagination(tp);
    }

    function renderPagination(tp){
      el.pagination.innerHTML='';if(tp<=1)return;
      const pb=document.createElement('button');pb.className='page-btn';pb.textContent='\u2039';pb.disabled=state.currentPage===1;pb.onclick=()=>changePage(state.currentPage-1);el.pagination.appendChild(pb);
      for(let i=1;i<=tp;i++){const b=document.createElement('button');b.className='page-btn '+(i===state.currentPage?'active':'');b.textContent=i;b.onclick=()=>changePage(i);el.pagination.appendChild(b);}
      const nb=document.createElement('button');nb.className='page-btn';nb.textContent='\u203A';nb.disabled=state.currentPage===tp;nb.onclick=()=>changePage(state.currentPage+1);el.pagination.appendChild(nb);
    }

    function changePage(p){const tp=Math.ceil(state.filteredData.length/CONFIG.itemsPerPage);if(p<1||p>tp)return;state.currentPage=p;renderPage();el.glassContainer.scrollTo({top:0,behavior:'smooth'});}
    function updateStats(){el.totalCreators.textContent=CREATORS_DATA.length;el.totalLinks.textContent=CREATORS_DATA.reduce((s,c)=>s+c.links,0);}
    function handleSearch(q){state.searchQuery=q.toLowerCase().trim();state.currentPage=1;state.filteredData=state.searchQuery===''?[...CREATORS_DATA]:CREATORS_DATA.filter(c=>c.name.toLowerCase().includes(state.searchQuery)||c.category.toLowerCase().includes(state.searchQuery)||c.handle.toLowerCase().includes(state.searchQuery)||c.bio.toLowerCase().includes(state.searchQuery));renderPage();}
    function handleScroll(){const sy=window.scrollY,dh=document.documentElement.scrollHeight-window.innerHeight;el.scrollProgress.style.width=(dh>0?(sy/dh)*100:0)+'%';el.backToTop.classList.toggle('visible',sy>200);}
    function initTabs(){el.tabCreators.addEventListener('click',()=>{el.tabCreators.classList.add('active');el.tabCurators.classList.remove('active');el.viewsTrack.classList.remove('show-curators');});el.tabCurators.addEventListener('click',()=>{el.tabCurators.classList.add('active');el.tabCreators.classList.remove('active');el.viewsTrack.classList.add('show-curators');});}

function init(){initTheme();initTabs();renderCurators();initListPostEditor();initScrollChaining();el.searchInput.addEventListener('input',debounce(e=>handleSearch(e.target.value),300));window.addEventListener('scroll',debounce(handleScroll,15));el.backToTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));renderPage();handleScroll();}
    document.addEventListener('DOMContentLoaded',init);