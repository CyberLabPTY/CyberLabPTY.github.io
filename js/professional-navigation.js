/* CYBER LAB - PROFESSIONAL NAVIGATION & IDENTITY v1.14 */
(function(){
  var nav=null;
  var footer=null;
  var observer=null;

  var destinations=[
    {id:'cyber-home',label:'INICIO'},
    {id:'cyber-explore',label:'EXPLORAR'},
    {id:'ops-core',label:'LABORATORIOS'},
    {id:'professional-portfolio',label:'CAPACIDADES'},
    {id:'professional-contact',label:'CONTACTO'}
  ];

  function prepareTargets(){
    var hero=document.querySelector('.hero');
    var categories=document.querySelector('.categories');

    if(hero && !hero.id) hero.id='cyber-home';
    if(categories && !categories.id) categories.id='cyber-explore';
  }

  function createNav(){
    if(document.getElementById('cyber-professional-nav')){
      nav=document.getElementById('cyber-professional-nav');
      return true;
    }

    var header=document.querySelector('.topbar');
    if(!header) return false;

    nav=document.createElement('nav');
    nav.id='cyber-professional-nav';
    nav.className='cyber-pro-nav';
    nav.setAttribute('aria-label','Navegación principal de Cyber Lab');

    var links='';

    for(var i=0;i<destinations.length;i++){
      links+='<a class="cyber-nav-link'+(i===0?' active':'')+'" href="#'+destinations[i].id+'" data-nav-target="'+destinations[i].id+'">'+destinations[i].label+'</a>';
    }

    nav.innerHTML=
      '<div class="cyber-pro-nav-inner">'+
        '<div class="cyber-nav-id"><span class="cyber-nav-id-dot"></span><span>CYBER LAB</span></div>'+
        '<div class="cyber-nav-links">'+links+'</div>'+
      '</div>';

    header.insertAdjacentElement('afterend',nav);
    return true;
  }

  function createFooter(){
    if(document.getElementById('professional-contact')){
      footer=document.getElementById('professional-contact');
      return true;
    }

    var app=document.getElementById('cyber-app');
    if(!app) return false;

    footer=document.createElement('footer');
    footer.id='professional-contact';
    footer.className='cyber-footer';
    footer.setAttribute('aria-label','Contacto e identidad profesional');

    footer.innerHTML=
      '<div class="cyber-footer-inner">'+
        '<div>'+
          '<span class="cyber-footer-kicker">CYBER LAB // TECHNICAL SECURITY PORTFOLIO</span>'+
          '<h2>Ciberseguridad, sistemas y tecnología interactiva</h2>'+
          '<p>Proyecto de portafolio construido para demostrar conceptos de seguridad defensiva, redes, sistemas, análisis geográfico, criptografía local y laboratorios educativos mediante una arquitectura web modular.</p>'+
          '<div class="cyber-footer-tech">'+
            '<span>HTML5</span>'+
            '<span>CSS3</span>'+
            '<span>JAVASCRIPT</span>'+
            '<span>THREE.JS</span>'+
            '<span>WEB CRYPTO</span>'+
            '<span>GEOJSON</span>'+
          '</div>'+
        '</div>'+
        '<div class="cyber-footer-actions">'+
          '<a class="cyber-footer-action primary" href="https://www.linkedin.com/in/kcc4" target="_blank" rel="noopener noreferrer">PERFIL PROFESIONAL EN LINKEDIN</a>'+
          '<a class="cyber-footer-action" href="#cyber-home">VOLVER AL INICIO</a>'+
        '</div>'+
      '</div>'+
      '<div class="cyber-footer-bottom">'+
        '<span>CYBER LAB · PROFESSIONAL PORTFOLIO</span>'+
        '<span>REAL LOCAL FUNCTIONS · EDUCATIONAL SIMULATIONS</span>'+
      '</div>';

    app.appendChild(footer);
    return true;
  }

  function scrollToTarget(id){
    var target=document.getElementById(id);
    if(!target) return false;

    target.scrollIntoView({
      behavior:'smooth',
      block:'start'
    });

    return true;
  }

  function keepLinkVisible(link){
    if(!link || !nav) return;

    var strip=nav.querySelector('.cyber-nav-links');
    if(!strip || strip.scrollWidth<=strip.clientWidth) return;

    var left=link.offsetLeft-(strip.clientWidth-link.offsetWidth)/2;

    if(typeof strip.scrollTo==='function'){
      strip.scrollTo({
        left:Math.max(0,left),
        behavior:'smooth'
      });
    }else{
      strip.scrollLeft=Math.max(0,left);
    }
  }

  function setActive(id){
    if(!nav) return;

    var links=nav.querySelectorAll('[data-nav-target]');
    var activeLink=null;

    for(var i=0;i<links.length;i++){
      var isActive=links[i].getAttribute('data-nav-target')===id;

      links[i].classList.toggle('active',isActive);

      if(isActive){
        links[i].setAttribute('aria-current','location');
        activeLink=links[i];
      }else{
        links[i].removeAttribute('aria-current');
      }
    }

    if(activeLink) keepLinkVisible(activeLink);
  }

  function bindClicks(){
    if(!nav || nav.getAttribute('data-bound')==='1') return;

    nav.setAttribute('data-bound','1');

    nav.addEventListener('click',function(event){
      var link=event.target.closest('[data-nav-target]');
      if(!link) return;

      var id=link.getAttribute('data-nav-target');
      if(!document.getElementById(id)) return;

      event.preventDefault();
      setActive(id);
      scrollToTarget(id);
    });

    document.addEventListener('click',function(event){
      var topLink=event.target.closest('.cyber-footer-action[href="#cyber-home"]');
      if(!topLink) return;

      event.preventDefault();
      setActive('cyber-home');
      scrollToTarget('cyber-home');
    });
  }

  function observeSections(){
    if(!('IntersectionObserver' in window)) return;

    if(observer) observer.disconnect();

    observer=new IntersectionObserver(function(entries){
      var best=null;

      for(var i=0;i<entries.length;i++){
        if(!entries[i].isIntersecting) continue;

        if(!best || entries[i].intersectionRatio>best.intersectionRatio){
          best=entries[i];
        }
      }

      if(best && best.target && best.target.id){
        setActive(best.target.id);
      }
    },{
      root:null,
      rootMargin:'-18% 0px -58% 0px',
      threshold:[0,.15,.35,.6]
    });

    for(var i=0;i<destinations.length;i++){
      var target=document.getElementById(destinations[i].id);
      if(target) observer.observe(target);
    }
  }

  function init(){
    prepareTargets();

    var attempts=0;
    var timer=setInterval(function(){
      attempts++;
      prepareTargets();

      var navReady=createNav();
      var footerReady=createFooter();
      var portfolioReady=!!document.getElementById('professional-portfolio');

      if(navReady && footerReady && portfolioReady){
        clearInterval(timer);
        bindClicks();
        setTimeout(observeSections,150);
        return;
      }

      if(attempts>60){
        clearInterval(timer);

        if(navReady && footerReady){
          bindClicks();
          observeSections();
        }
      }
    },100);
  }

  window.CyberProfessionalNavigation={
    scrollTo:scrollToTarget,
    setActive:setActive,
    refresh:observeSections
  };

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init);
  }else{
    init();
  }
})();
