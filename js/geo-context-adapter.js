/* CYBER LAB - GEO CONTEXT ADAPTER v1.9.1 */
(function(){
  var observer=null;
  var attached=false;

  function clean(value){
    return String(value || "").replace(/\s+/g," ").trim();
  }

  function isPlaceholder(value){
    var text=clean(value).toLowerCase();
    if(!text) return true;
    return (
      text==="ninguno" ||
      text.indexOf("toca un punto")!==-1 ||
      text.indexOf("sin contexto")!==-1 ||
      text.indexOf("selecciona")!==-1
    );
  }

  function validGeo(title){
    var text=clean(title);
    if(!text) return false;

    var lower=text.toLowerCase();

    if(lower==="global map ready") return false;
    if(lower==="global fallback") return false;
    if(lower==="ninguno") return false;

    return true;
  }

  function syncGeo(force){
    var geoTitle=document.getElementById("geo-hud-title");
    var geoMeta=document.getElementById("geo-hud-meta");
    var selectedNode=document.getElementById("selected-node");
    var selectedInfo=document.getElementById("selected-info");

    if(!geoTitle || !geoMeta || !selectedNode || !selectedInfo){
      return false;
    }

    var title=clean(geoTitle.textContent);
    var meta=clean(geoMeta.textContent);

    if(!validGeo(title)){
      return false;
    }

    if(!force && !isPlaceholder(selectedNode.textContent)){
      return false;
    }

    selectedNode.textContent=title;
    selectedInfo.textContent=meta || "Contexto geográfico sincronizado desde el globo 3D.";

    selectedNode.setAttribute("data-context-source","geo");
    selectedInfo.setAttribute("data-context-source","geo");

    document.dispatchEvent(new CustomEvent("cyber:geo-context",{
      detail:{
        node:title,
        info:meta,
        source:"geo-hud",
        updated:Date.now()
      }
    }));

    return true;
  }

  function attach(){
    if(attached) return true;

    var geoTitle=document.getElementById("geo-hud-title");
    var geoMeta=document.getElementById("geo-hud-meta");

    if(!geoTitle || !geoMeta){
      return false;
    }

    observer=new MutationObserver(function(){
      setTimeout(function(){
        syncGeo(true);
      },0);
    });

    observer.observe(geoTitle,{
      childList:true,
      subtree:true,
      characterData:true
    });

    observer.observe(geoMeta,{
      childList:true,
      subtree:true,
      characterData:true
    });

    attached=true;
    syncGeo(false);

    return true;
  }

  function init(){
    var attempts=0;

    var timer=setInterval(function(){
      attempts++;

      if(attach()){
        clearInterval(timer);
      }

      if(attempts>60){
        clearInterval(timer);
      }
    },100);
  }

  window.CyberGeoContextAdapter={
    sync:function(){
      return syncGeo(true);
    },
    isAttached:function(){
      return attached;
    }
  };

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",init);
  }else{
    init();
  }
})();
