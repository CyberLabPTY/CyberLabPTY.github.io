/* CYBER LAB - GEO CONTEXT RETAINER v1.9.3 */
(function(){
  var lastGeo=null;
  var restoring=false;

  function clean(value){
    return String(value || "").replace(/\s+/g," ").trim();
  }

  function captureCurrent(){
    var title=document.getElementById("geo-hud-title");
    var meta=document.getElementById("geo-hud-meta");

    if(!title || !meta) return false;

    var name=clean(title.textContent);
    var info=clean(meta.textContent);

    if(!name || !info) return false;

    if(!/(-?\d+(?:\.\d+)?)°\s*,\s*(-?\d+(?:\.\d+)?)°/.test(info)){
      return false;
    }

    lastGeo={
      name:name,
      info:info,
      updated:Date.now()
    };

    return true;
  }

  function restore(){
    if(!lastGeo || restoring) return false;

    var geoTitle=document.getElementById("geo-hud-title");
    var geoMeta=document.getElementById("geo-hud-meta");
    var selectedNode=document.getElementById("selected-node");
    var selectedInfo=document.getElementById("selected-info");

    if(!selectedNode || !selectedInfo) return false;

    restoring=true;

    selectedNode.textContent=lastGeo.name;
    selectedInfo.textContent=lastGeo.info;

    selectedNode.setAttribute("data-context-source","geo-retained");
    selectedInfo.setAttribute("data-context-source","geo-retained");

    if(geoTitle && geoMeta){
      var currentTitle=clean(geoTitle.textContent).toLowerCase();

      if(
        currentTitle.indexOf("toca un destino")!==-1 ||
        currentTitle==="ninguno" ||
        currentTitle===""
      ){
        geoTitle.textContent=lastGeo.name;
        geoMeta.textContent=lastGeo.info;
      }
    }

    document.dispatchEvent(new CustomEvent("cyber:geo-context-restored",{
      detail:{
        node:lastGeo.name,
        info:lastGeo.info,
        updated:Date.now()
      }
    }));

    setTimeout(function(){
      restoring=false;
    },30);

    return true;
  }

  document.addEventListener("cyber:geo-validated",function(){
    setTimeout(function(){
      captureCurrent();
    },20);
  });

  document.addEventListener("click",function(event){
    var category=event.target.closest(".category[data-category]");
    if(!category) return;

    setTimeout(function(){
      restore();

      if(window.CyberIntelligenceBridge){
        window.CyberIntelligenceBridge.sync();
      }
    },120);
  });

  window.CyberGeoContextRetainer={
    capture:captureCurrent,
    restore:restore,
    getLast:function(){
      if(!lastGeo) return null;
      return {
        name:lastGeo.name,
        info:lastGeo.info,
        updated:lastGeo.updated
      };
    }
  };
})();
