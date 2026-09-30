/* CYBER LAB - GEO COUNTRY VALIDATOR v1.9.2 */
(function(){
  var features=[];
  var ready=false;
  var busy=false;
  var observer=null;
  var pending=null;
  var lastSignature="";

  function clean(value){
    return String(value || "").replace(/\s+/g," ").trim();
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

  function findCountry(lon,lat){
    if(!ready) return null;

    for(var i=0;i<features.length;i++){
      if(featureContains(features[i],lon,lat)){
        return features[i];
      }
    }

    return null;
  }

  function translateContinent(value){
    var names={
      "Africa":"África",
      "Asia":"Asia",
      "Europe":"Europa",
      "North America":"América del Norte",
      "South America":"América del Sur",
      "Oceania":"Oceanía",
      "Antarctica":"Antártida",
      "Seven seas (open ocean)":"Océanos"
    };

    return names[value] || value || "Global";
  }

  function approximateOcean(lat,lon){
    if(lat>66) return "Océano Ártico";
    if(lat<-60) return "Océano Austral";
    if(lon>=20 && lon<=120 && lat<35) return "Océano Índico";
    if(lon>120 || lon<-70) return "Océano Pacífico";
    return "Océano Atlántico";
  }

  function readCoordinates(){
    var meta=document.getElementById("geo-hud-meta");
    if(!meta) return null;

    var text=clean(meta.textContent);
    var match=text.match(/(-?\d+(?:\.\d+)?)°\s*,\s*(-?\d+(?:\.\d+)?)°/);

    if(!match) return null;

    var lat=Number(match[1]);
    var lon=normalizeLon(Number(match[2]));

    if(!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    if(lat<-90 || lat>90) return null;

    return {lat:lat,lon:lon};
  }

  function countryName(feature){
    var p=(feature && feature.properties) || {};

    return clean(
      p.NAME_ES ||
      p.ADMIN ||
      p.NAME_LONG ||
      p.NAME ||
      "Territorio"
    );
  }

  function applyCountry(feature,coords){
    var title=document.getElementById("geo-hud-title");
    var meta=document.getElementById("geo-hud-meta");
    var status=document.getElementById("geo-hud-status");

    if(!title || !meta) return false;

    var p=feature.properties || {};
    var name=countryName(feature);
    var continent=translateContinent(p.CONTINENT);
    var subregion=clean(p.SUBREGION || "");

    var description=
      continent+
      (subregion ? " · "+subregion : "")+
      " · "+coords.lat.toFixed(2)+"°, "+coords.lon.toFixed(2)+"°";

    busy=true;

    if(status) status.textContent="LAND IDENTIFIED";
    title.textContent=name;
    meta.textContent=description;

    busy=false;

    return true;
  }

  function applyOcean(coords){
    var title=document.getElementById("geo-hud-title");
    var meta=document.getElementById("geo-hud-meta");
    var status=document.getElementById("geo-hud-status");

    if(!title || !meta) return false;

    var ocean=approximateOcean(coords.lat,coords.lon);

    busy=true;

    if(status) status.textContent="SUBSEA LAYER";
    title.textContent=ocean;
    meta.textContent=
      "Zona oceánica aproximada · "+
      coords.lat.toFixed(2)+"°, "+coords.lon.toFixed(2)+"°";

    busy=false;

    return true;
  }

  function validate(){
    if(!ready || busy) return false;

    var coords=readCoordinates();
    if(!coords) return false;

    var signature=coords.lat.toFixed(4)+","+coords.lon.toFixed(4);

    if(signature===lastSignature) return true;
    lastSignature=signature;

    var feature=findCountry(coords.lon,coords.lat);

    if(feature){
      applyCountry(feature,coords);
    }else{
      applyOcean(coords);
    }

    document.dispatchEvent(new CustomEvent("cyber:geo-validated",{
      detail:{
        lat:coords.lat,
        lon:coords.lon,
        country:feature ? countryName(feature) : null,
        validated:true,
        updated:Date.now()
      }
    }));

    return true;
  }

  function scheduleValidation(){
    if(busy) return;

    clearTimeout(pending);

    pending=setTimeout(function(){
      validate();
    },40);
  }

  function observe(){
    var title=document.getElementById("geo-hud-title");
    var meta=document.getElementById("geo-hud-meta");

    if(!title || !meta) return false;

    observer=new MutationObserver(scheduleValidation);

    observer.observe(title,{
      childList:true,
      subtree:true,
      characterData:true
    });

    observer.observe(meta,{
      childList:true,
      subtree:true,
      characterData:true
    });

    return true;
  }

  function loadWorldData(){
    fetch("./data/world-countries.geojson")
      .then(function(response){
        if(!response.ok) throw new Error("GeoJSON HTTP "+response.status);
        return response.json();
      })
      .then(function(data){
        features=Array.isArray(data.features) ? data.features : [];
        ready=features.length>0;
        scheduleValidation();
      })
      .catch(function(error){
        console.warn("Geo validator fallback active",error);
      });
  }

  function init(){
    var attempts=0;

    var timer=setInterval(function(){
      attempts++;

      if(observe()){
        clearInterval(timer);
        loadWorldData();
      }

      if(attempts>60){
        clearInterval(timer);
      }
    },100);
  }

  window.CyberGeoValidator={
    validate:validate,
    isReady:function(){return ready;},
    findCountry:function(lon,lat){
      return findCountry(normalizeLon(lon),Number(lat));
    }
  };

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",init);
  }else{
    init();
  }
})();
