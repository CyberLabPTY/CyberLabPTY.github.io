/* CYBER LAB - MARINE INTELLIGENCE v1.9.4 */
(function(){
  var features=[];
  var ready=false;
  var pendingContext=null;

  function clean(value){
    return String(value || "").replace(/\s+/g," ").trim();
  }

  function capitalize(value){
    var text=clean(value);
    if(!text) return "Zona marina";
    return text.charAt(0).toUpperCase()+text.slice(1);
  }

  function normalizeLon(value){
    var lon=Number(value);
    while(lon>180) lon-=360;
    while(lon<-180) lon+=360;
    return lon;
  }

  function pointInRing(lon,lat,ring){
    if(!ring || ring.length<3) return false;

    var min=Infinity;
    var max=-Infinity;

    for(var n=0;n<ring.length;n++){
      var rx=Number(ring[n][0]);
      if(rx<min) min=rx;
      if(rx>max) max=rx;
    }

    var crossesDateLine=(max-min)>180;
    var qx=normalizeLon(lon);

    if(crossesDateLine && qx<0){
      qx+=360;
    }

    var inside=false;

    for(var i=0,j=ring.length-1;i<ring.length;j=i++){
      var xi=Number(ring[i][0]);
      var yi=Number(ring[i][1]);
      var xj=Number(ring[j][0]);
      var yj=Number(ring[j][1]);

      if(crossesDateLine){
        if(xi<0) xi+=360;
        if(xj<0) xj+=360;
      }

      var intersects=
        ((yi>lat)!==(yj>lat)) &&
        (qx < (xj-xi)*(lat-yi)/((yj-yi)||1e-12)+xi);

      if(intersects) inside=!inside;
    }

    return inside;
  }

  function pointInPolygon(lon,lat,polygon){
    if(!polygon || !polygon.length) return false;
    if(!pointInRing(lon,lat,polygon[0])) return false;

    for(var i=1;i<polygon.length;i++){
      if(pointInRing(lon,lat,polygon[i])) return false;
    }

    return true;
  }

  function featureContains(feature,lon,lat){
    var geometry=feature && feature.geometry;
    if(!geometry) return false;

    if(geometry.type==="Polygon"){
      return pointInPolygon(lon,lat,geometry.coordinates);
    }

    if(geometry.type==="MultiPolygon"){
      for(var i=0;i<geometry.coordinates.length;i++){
        if(pointInPolygon(lon,lat,geometry.coordinates[i])){
          return true;
        }
      }
    }

    return false;
  }

  function findMarine(lon,lat){
    if(!ready) return null;

    for(var i=0;i<features.length;i++){
      if(featureContains(features[i],lon,lat)){
        return features[i];
      }
    }

    return null;
  }

  function marineName(feature){
    var p=(feature && feature.properties) || {};

    return capitalize(
      p.name_es ||
      p.name_en ||
      p.name ||
      p.namealt ||
      "Zona marina"
    );
  }

  function marineClass(feature){
    var p=(feature && feature.properties) || {};
    var value=clean(p.featurecla || "marine").toUpperCase();
    return value || "MARINE";
  }

  function applyMarine(context){
    if(!context) return false;
    if(context.country) return false;

    var lat=Number(context.lat);
    var lon=normalizeLon(Number(context.lon));

    if(!Number.isFinite(lat) || !Number.isFinite(lon)) return false;

    if(!ready){
      pendingContext={
        lat:lat,
        lon:lon,
        country:null
      };
      return false;
    }

    var feature=findMarine(lon,lat);
    if(!feature) return false;

    var name=marineName(feature);
    var type=marineClass(feature);

    var status=document.getElementById("geo-hud-status");
    var title=document.getElementById("geo-hud-title");
    var meta=document.getElementById("geo-hud-meta");
    var selectedNode=document.getElementById("selected-node");
    var selectedInfo=document.getElementById("selected-info");

    var description=
      "Natural Earth · "+type+
      " · "+lat.toFixed(2)+"°, "+lon.toFixed(2)+"°";

    if(status) status.textContent="MARINE IDENTIFIED";
    if(title) title.textContent=name;
    if(meta) meta.textContent=description;

    if(selectedNode){
      selectedNode.textContent=name;
      selectedNode.setAttribute("data-context-source","marine");
    }

    if(selectedInfo){
      selectedInfo.textContent=description;
      selectedInfo.setAttribute("data-context-source","marine");
    }

    document.dispatchEvent(new CustomEvent("cyber:marine-context",{
      detail:{
        name:name,
        type:type,
        lat:lat,
        lon:lon,
        source:"natural-earth-marine",
        updated:Date.now()
      }
    }));

    if(window.CyberIntelligenceBridge){
      setTimeout(function(){
        window.CyberIntelligenceBridge.sync();
      },0);
    }

    return true;
  }

  function load(){
    fetch("./data/world-marine.geojson")
      .then(function(response){
        if(!response.ok){
          throw new Error("Marine GeoJSON HTTP "+response.status);
        }
        return response.json();
      })
      .then(function(data){
        features=Array.isArray(data.features) ? data.features : [];
        ready=features.length>0;

        if(pendingContext){
          var saved=pendingContext;
          pendingContext=null;
          applyMarine(saved);
        }
      })
      .catch(function(error){
        console.warn("Marine intelligence fallback active",error);
      });
  }

  document.addEventListener("cyber:geo-validated",function(event){
    var detail=event && event.detail ? event.detail : null;
    if(!detail || detail.country) return;
    applyMarine(detail);
  });

  window.CyberMarineIntelligence={
    resolve:function(lat,lon){
      var feature=findMarine(normalizeLon(lon),Number(lat));
      if(!feature) return null;
      return {
        name:marineName(feature),
        type:marineClass(feature)
      };
    },
    apply:applyMarine,
    isReady:function(){return ready;}
  };

  load();
})();
