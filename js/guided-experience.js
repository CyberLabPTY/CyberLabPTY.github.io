/* CYBER LAB - GUIDED EXPERIENCE v1.10 */
(function(){
  var root=null;

  var categoryHelp={
    all:{title:"Exploración global",simple:"Vista general de todas las áreas de Cyber Lab.",technical:"Contexto global sin filtro especializado."},
    threats:{title:"Amenazas digitales",simple:"Explora cómo se analizan señales, indicadores y posibles amenazas.",technical:"Threat Intelligence / IOC correlation / defensive analysis."},
    privacy:{title:"Privacidad y criptografía",simple:"Aprende cómo se protege la información y cómo funcionan los hashes y valores seguros.",technical:"Cryptography / privacy / SHA-256 / CSPRNG."},
    networks:{title:"Redes",simple:"Explora conexiones, rutas, firewalls y comunicaciones entre sistemas.",technical:"Routing / DNS / firewall / segmentation / telemetry."},
    osint:{title:"OSINT",simple:"Aprende a relacionar información procedente de fuentes públicas.",technical:"Open Source Intelligence / source verification / entity linking."},
    cloud:{title:"Nube e identidad",simple:"Explora usuarios, permisos, sesiones y controles de acceso.",technical:"Cloud IAM / RBAC / MFA / least privilege / Zero Trust."},
    education:{title:"Aprendizaje técnico",simple:"Área orientada a comprender sistemas y conceptos de ciberseguridad.",technical:"Systems administration and cybersecurity training context."},
    oceans:{title:"Infraestructura marítima",simple:"Explora el contexto digital relacionado con océanos y comunicaciones submarinas.",technical:"Subsea communications / marine infrastructure / global connectivity."},
    orbital:{title:"Seguridad orbital",simple:"Explora comunicaciones, satélites y sistemas digitales relacionados con el espacio.",technical:"Orbital systems / satellite links / navigation / communications."}
  };

  var moduleLabels={
    systems:"Systems: servicios, procesos, usuarios y registros.",
    network:"Networks: rutas, DNS, firewalls y segmentación.",
    soc:"SOC: detección y respuesta defensiva ante incidentes.",
    threat:"Threat Intelligence: análisis defensivo de amenazas e indicadores.",
    osint:"OSINT: investigación con fuentes públicas.",
    cloud:"Cloud & Identity: identidades, permisos y políticas de acceso.",
    crypto:"Cryptography & Privacy: hashes y aleatoriedad segura local.",
    forensics:"Digital Forensics: evidencias, integridad y línea temporal."
  };

  function create(){
    if(document.getElementById("guided-experience")){
      root=document.getElementById("guided-experience");
      return true;
    }

    var categories=document.querySelector(".categories");
    if(!categories) return false;

    root=document.createElement("section");
    root.id="guided-experience";
    root.className="guide-experience";
    root.setAttribute("aria-label","Guía para usar Cyber Lab");

    root.innerHTML=
      "<div class=\"guide-head\">"+
        "<div><span class=\"guide-kicker\">GUÍA DE EXPLORACIÓN // v1.10</span><h2>¿Cómo usar Cyber Lab?</h2></div>"+
        "<div class=\"guide-mode\">"+
          "<button type=\"button\" class=\"guide-mode-btn active\" data-guide-mode=\"simple\">MODO SIMPLE</button>"+
          "<button type=\"button\" class=\"guide-mode-btn\" data-guide-mode=\"technical\">MODO TÉCNICO</button>"+
        "</div>"+
      "</div>"+
      "<p class=\"guide-summary guide-simple-only\">Cyber Lab es un portafolio interactivo para explorar conceptos de ciberseguridad. Algunas funciones son simulaciones educativas y otras, como SHA-256 y generación criptográfica aleatoria, funcionan realmente de forma local en tu navegador.</p>"+
      "<p class=\"guide-summary guide-technical-only\">Interactive cybersecurity portfolio combining a 3D geographic interface, defensive simulations, systems administration laboratories and selected browser-native cryptographic functions.</p>"+
      "<div class=\"guide-steps\">"+
        "<div class=\"guide-step\"><span class=\"guide-step-num\">01</span><b>Elige un tema</b><span>Selecciona THREATS, NETWORKS, OSINT, CLOUD u otra categoría.</span></div>"+
        "<div class=\"guide-step\"><span class=\"guide-step-num\">02</span><b>Explora el globo</b><span>Toca una región para obtener un contexto geográfico interactivo.</span></div>"+
        "<div class=\"guide-step\"><span class=\"guide-step-num\">03</span><b>Abre un laboratorio</b><span>Operations Core contiene los módulos técnicos y simulaciones.</span></div>"+
      "</div>"+
      "<div class=\"guide-live\">"+
        "<small>ÁREA SELECCIONADA</small>"+
        "<b id=\"guide-live-title\">Exploración global</b>"+
        "<p id=\"guide-live-text\">Vista general de todas las áreas de Cyber Lab.</p>"+
      "</div>"+
      "<div class=\"guide-actions\">"+
        "<button type=\"button\" class=\"guide-action primary\" id=\"guide-start\">COMENZAR EXPLORACIÓN</button>"+
        "<button type=\"button\" class=\"guide-action\" id=\"guide-glossary-toggle\">VER GLOSARIO</button>"+
      "</div>"+
      "<div class=\"guide-glossary\" id=\"guide-glossary\">"+
        "<div class=\"guide-glossary-title\">TÉRMINOS PRINCIPALES</div>"+
        "<div class=\"guide-term\"><b>SOC</b><span>Centro de Operaciones de Seguridad. Supervisa y responde a incidentes.</span></div>"+
        "<div class=\"guide-term\"><b>OSINT</b><span>Inteligencia obtenida a partir de fuentes públicas.</span></div>"+
        "<div class=\"guide-term\"><b>DFIR</b><span>Forense digital y respuesta ante incidentes.</span></div>"+
        "<div class=\"guide-term\"><b>IOC</b><span>Indicador de compromiso: una señal técnica utilizada durante un análisis defensivo.</span></div>"+
        "<div class=\"guide-term\"><b>CSPRNG</b><span>Generador criptográficamente seguro de valores aleatorios.</span></div>"+
      "</div>";

    categories.parentNode.insertBefore(root,categories);
    return true;
  }

  function setMode(mode){
    var technical=mode==="technical";

    document.body.classList.toggle("guide-technical",technical);
    document.body.classList.toggle("guide-simple",!technical);

    if(root){
      var buttons=root.querySelectorAll("[data-guide-mode]");
      for(var i=0;i<buttons.length;i++){
        buttons[i].classList.toggle("active",buttons[i].getAttribute("data-guide-mode")===mode);
      }
    }

    try{localStorage.setItem("cyberlab-guide-mode",mode);}catch(error){}
    updateCategory();
  }

  function currentMode(){
    return document.body.classList.contains("guide-technical") ? "technical" : "simple";
  }

  function activeCategory(){
    var button=document.querySelector(".category.active[data-category]");
    return button ? button.getAttribute("data-category") : "all";
  }

  function updateCategory(){
    if(!root) return;

    var id=activeCategory();
    var data=categoryHelp[id] || categoryHelp.all;
    var mode=currentMode();

    var title=root.querySelector("#guide-live-title");
    var text=root.querySelector("#guide-live-text");

    if(title) title.textContent=data.title;
    if(text) text.textContent=mode==="technical" ? data.technical : data.simple;
  }

  function explainModules(){
    var buttons=document.querySelectorAll(".ops-module[data-ops]");

    for(var i=0;i<buttons.length;i++){
      var id=buttons[i].getAttribute("data-ops");
      if(moduleLabels[id]){
        buttons[i].setAttribute("title",moduleLabels[id]);
        buttons[i].setAttribute("aria-label",moduleLabels[id]);
      }
    }
  }

  function bind(){
    if(!root) return;

    root.addEventListener("click",function(event){
      var modeButton=event.target.closest("[data-guide-mode]");
      if(modeButton){
        setMode(modeButton.getAttribute("data-guide-mode"));
        return;
      }

      if(event.target.closest("#guide-start")){
        var categories=document.querySelector(".categories");
        if(categories && categories.scrollIntoView){
          categories.scrollIntoView({behavior:"smooth",block:"start"});
        }
        return;
      }

      if(event.target.closest("#guide-glossary-toggle")){
        var glossary=root.querySelector("#guide-glossary");
        if(!glossary) return;

        glossary.classList.toggle("open");
        event.target.textContent=glossary.classList.contains("open") ? "OCULTAR GLOSARIO" : "VER GLOSARIO";
      }
    });

    document.addEventListener("click",function(event){
      if(event.target.closest(".category[data-category]")){
        setTimeout(updateCategory,30);
      }
    });
  }

  function init(){
    var attempts=0;
    var timer=setInterval(function(){
      attempts++;

      if(create()){
        clearInterval(timer);
        bind();

        var stored="simple";
        try{stored=localStorage.getItem("cyberlab-guide-mode") || "simple";}catch(error){}
        setMode(stored==="technical" ? "technical" : "simple");

        setTimeout(explainModules,400);
      }

      if(attempts>50){clearInterval(timer);}
    },100);
  }

  window.CyberGuidedExperience={
    setMode:setMode,
    update:updateCategory,
    explainModules:explainModules
  };

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",init);
  }else{
    init();
  }
})();
