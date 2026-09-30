/* CYBER LAB - GLOBAL INTELLIGENCE BRIDGE v1.9 */
(function(){
  var panel=null;
  var context={
    node:"Ninguno",
    info:"Sin contexto global seleccionado.",
    category:"all",
    module:null,
    updated:null
  };

  var categoryMap={
    threats:"threat",
    privacy:"crypto",
    networks:"network",
    osint:"osint",
    cloud:"cloud",
    education:"systems",
    oceans:"network",
    orbital:"network"
  };

  var moduleNames={
    systems:"SYSTEMS",
    network:"NETWORKS",
    soc:"SOC / BLUE TEAM",
    threat:"THREAT INTELLIGENCE",
    osint:"OSINT",
    cloud:"CLOUD & IDENTITY",
    crypto:"CRYPTOGRAPHY & PRIVACY",
    forensics:"DIGITAL FORENSICS"
  };

  function clean(value,fallback){
    var text=String(value || "").replace(/\s+/g," ").trim();
    return text || fallback;
  }

  function activeCategory(){
    var button=document.querySelector(".category.active[data-category]");
    return button ? button.getAttribute("data-category") : "all";
  }

  function inferModule(category,node,info){
    if(categoryMap[category]) return categoryMap[category];

    var text=(node+" "+info).toLowerCase();

    if(/forensic|evidence|artifact|custody|dfir/.test(text)) return "forensics";
    if(/incident|soc|blue team|triage|contain/.test(text)) return "soc";
    if(/threat|malware|indicator|ioc|campaign/.test(text)) return "threat";
    if(/osint|archive|public source|open source/.test(text)) return "osint";
    if(/cloud|iam|identity|privilege|access policy/.test(text)) return "cloud";
    if(/privacy|crypto|hash|cipher|key|nonce/.test(text)) return "crypto";
    if(/network|route|packet|dns|firewall|ip /.test(text)) return "network";
    if(/system|server|linux|service|host/.test(text)) return "systems";

    return null;
  }

  function readContext(){
    var nodeEl=document.getElementById("selected-node");
    var infoEl=document.getElementById("selected-info");

    var node=clean(nodeEl ? nodeEl.textContent : "","Ninguno");
    var info=clean(infoEl ? infoEl.textContent : "","Sin contexto global seleccionado.");
    var category=activeCategory();

    context={
      node:node,
      info:info,
      category:category,
      module:inferModule(category,node,info),
      updated:Date.now()
    };

    return context;
  }

  function moduleLabel(id){
    return id && moduleNames[id] ? moduleNames[id] : "NO MODULE LINKED";
  }

  function renderPanel(){
    if(!panel) return;

    var moduleText=moduleLabel(context.module);
    var node=panel.querySelector("#intel-node");
    var info=panel.querySelector("#intel-info");
    var category=panel.querySelector("#intel-category");
    var linked=panel.querySelector("#intel-linked-module");
    var open=panel.querySelector("#intel-open-module");

    if(node) node.textContent=context.node;
    if(info) info.textContent=context.info;
    if(category) category.textContent="CATEGORY // "+context.category.toUpperCase();
    if(linked) linked.textContent=moduleText;

    if(open){
      open.disabled=!context.module;
      open.textContent=context.module ? "OPEN "+moduleText : "NO LINKED MODULE";
    }
  }

  function emitContext(){
    document.dispatchEvent(new CustomEvent("cyber:intelligence-context",{
      detail:{
        node:context.node,
        info:context.info,
        category:context.category,
        module:context.module,
        updated:context.updated
      }
    }));
  }

  function sync(){
    readContext();
    renderPanel();
    emitContext();
    return context;
  }

  function openLinkedModule(){
    if(!context.module) return false;

    var button=document.querySelector(".ops-module[data-ops=\""+context.module+"\"]");
    if(!button) return false;

    button.click();

    var core=document.getElementById("ops-core");
    if(core && core.scrollIntoView){
      setTimeout(function(){
        core.scrollIntoView({behavior:"smooth",block:"start"});
      },80);
    }

    return true;
  }

  function createPanel(){
    if(document.getElementById("intel-bridge")){
      panel=document.getElementById("intel-bridge");
      return true;
    }

    var root=document.getElementById("ops-core");
    if(!root) return false;

    panel=document.createElement("section");
    panel.id="intel-bridge";
    panel.className="intel-bridge";
    panel.setAttribute("aria-label","Global Intelligence Bridge");

    panel.innerHTML=
      "<div class=\"intel-bridge-head\">"+
        "<div class=\"intel-bridge-title\"><i class=\"intel-bridge-dot\"></i>GLOBAL INTELLIGENCE BRIDGE // v1.9</div>"+
        "<div class=\"intel-bridge-state\">LINK ACTIVE</div>"+
      "</div>"+
      "<div class=\"intel-bridge-grid\">"+
        "<div class=\"intel-context\">"+
          "<small>GLOBAL CONTEXT</small>"+
          "<h4 id=\"intel-node\">Ninguno</h4>"+
          "<p id=\"intel-info\">Sin contexto global seleccionado.</p>"+
        "</div>"+
        "<div class=\"intel-link\">"+
          "<small>LINKED OPERATIONS MODULE</small>"+
          "<b class=\"intel-linked-module\" id=\"intel-linked-module\">NO MODULE LINKED</b>"+
          "<span class=\"intel-category\" id=\"intel-category\">CATEGORY // GLOBAL</span>"+
        "</div>"+
      "</div>"+
      "<div class=\"intel-bridge-actions\">"+
        "<button type=\"button\" class=\"intel-bridge-btn\" id=\"intel-sync\">SYNC GLOBAL CONTEXT</button>"+
        "<button type=\"button\" class=\"intel-bridge-btn primary\" id=\"intel-open-module\" disabled>NO LINKED MODULE</button>"+
      "</div>";

    root.insertBefore(panel,root.firstChild);

    panel.querySelector("#intel-sync").addEventListener("click",sync);
    panel.querySelector("#intel-open-module").addEventListener("click",openLinkedModule);

    return true;
  }

  function observeGlobe(){
    var node=document.getElementById("selected-node");
    var info=document.getElementById("selected-info");

    var observer=new MutationObserver(function(){
      sync();
    });

    if(node){
      observer.observe(node,{childList:true,characterData:true,subtree:true});
    }

    if(info){
      observer.observe(info,{childList:true,characterData:true,subtree:true});
    }
  }

  function bindCategories(){
    document.addEventListener("click",function(event){
      var button=event.target.closest(".category[data-category]");
      if(!button) return;
      setTimeout(sync,30);
    });
  }

  function init(){
    var attempts=0;

    var timer=setInterval(function(){
      attempts++;

      if(createPanel()){
        clearInterval(timer);
        observeGlobe();
        bindCategories();
        sync();
      }

      if(attempts>40){
        clearInterval(timer);
      }
    },100);
  }

  window.CyberIntelligenceBridge={
    sync:sync,
    getContext:function(){
      return {
        node:context.node,
        info:context.info,
        category:context.category,
        module:context.module,
        updated:context.updated
      };
    },
    openLinkedModule:openLinkedModule
  };

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",init);
  }else{
    init();
  }
})();
