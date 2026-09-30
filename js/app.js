import * as THREE from "three";

const canvas=document.getElementById("cyber-canvas");
const globeControlZone=document.getElementById("globe-control-zone");
const boot=document.getElementById("boot");
const panelTitle=document.getElementById("panel-title");
const panelText=document.getElementById("panel-text");
const selectedNode=document.getElementById("selected-node");
const selectedInfo=document.getElementById("selected-info");
const nodeCount=document.getElementById("node-count");
const fpsElement=document.getElementById("fps");
const exploreBtn=document.getElementById("explore-btn");
const resetBtn=document.getElementById("reset-btn");
const categoryButtons=[...document.querySelectorAll(".category")];

let renderer;

try{
  renderer=new THREE.WebGLRenderer({
    canvas:canvas,
    antialias:true,
    alpha:true,
    powerPreference:"high-performance"
  });
}catch(error){
  boot.textContent="WEBGL NO DISPONIBLE";
  throw error;
}

function setRendererSize(){
  const w=window.innerWidth;
  const h=window.innerHeight;
  const ratio=w<700?1.25:1.5;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,ratio));
  renderer.setSize(w,h,false);
}

setRendererSize();
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.05;

const scene=new THREE.Scene();
scene.fog=new THREE.FogExp2(0x02070c,0.032);

const camera=new THREE.PerspectiveCamera(
  48,
  window.innerWidth/window.innerHeight,
  0.1,
  100
);

const homeCamera=new THREE.Vector3(0,0.35,7.8);
camera.position.copy(homeCamera);

const ambient=new THREE.AmbientLight(0x64d9e2,0.52);
scene.add(ambient);

const keyLight=new THREE.DirectionalLight(0x7fffee,2.2);
keyLight.position.set(4,3,5);
scene.add(keyLight);

const rimLight=new THREE.PointLight(0x257cff,18,18);
rimLight.position.set(-4,-2,-2);
scene.add(rimLight);

const globeGroup=new THREE.Group();
globeGroup.position.set(2.35,0.25,0); globeGroup.scale.setScalar(1);
scene.add(globeGroup);

const globeCore=new THREE.Mesh(
  new THREE.SphereGeometry(2.12,48,32),
  new THREE.MeshPhongMaterial({
    color:0x061a20,
    emissive:0x031317,
    shininess:22,
    transparent:true,
    opacity:0.88
  })
);
globeGroup.add(globeCore);

const earthLoader=new THREE.TextureLoader();

earthLoader.load(
  "./images/earth_atmos_2048.jpg",
  texture=>{
    texture.colorSpace=THREE.SRGBColorSpace;
    globeCore.material.map=texture;
    globeCore.material.color.set(0x8ab8bb);
    globeCore.material.emissive.set(0x032328);
    globeCore.material.shininess=10;
    globeCore.material.needsUpdate=true;
  },
  undefined,
  ()=>{
    console.warn("Earth texture fallback active");
  }
);

const wireGlobe=new THREE.Mesh(
  new THREE.SphereGeometry(2.14,36,24),
  new THREE.MeshBasicMaterial({
    color:0x58dddc,
    wireframe:true,
    transparent:true,
    opacity:0.060
  })
);
globeGroup.add(wireGlobe);

const globeDots=new THREE.Points(
  new THREE.SphereGeometry(2.17,44,30),
  new THREE.PointsMaterial({
    color:0x8effef,
    size:0.018,
    transparent:true,
    opacity:0.68,
    depthWrite:false
  })
);
globeGroup.add(globeDots);

const atmosphere=new THREE.Mesh(
  new THREE.SphereGeometry(2.28,42,30),
  new THREE.MeshBasicMaterial({
    color:0x29dcca,
    transparent:true,
    opacity:0.045,
    side:THREE.BackSide
  })
);
globeGroup.add(atmosphere);

const ringMaterial=new THREE.MeshBasicMaterial({
  color:0x62f7ea,
  transparent:true,
  opacity:0.14
});

const ringA=new THREE.Mesh(
  new THREE.TorusGeometry(2.65,0.007,8,150),
  ringMaterial
);
ringA.rotation.x=Math.PI*0.58;
globeGroup.add(ringA);

const ringB=new THREE.Mesh(
  new THREE.TorusGeometry(2.92,0.005,8,150),
  ringMaterial.clone()
);
ringB.material.opacity=0.08;
ringB.rotation.y=Math.PI*0.38;
ringB.rotation.x=Math.PI*0.18;
globeGroup.add(ringB);

function createStars(){
  const count=window.innerWidth<600?650:1100;
  const positions=new Float32Array(count*3);

  for(let i=0;i<count;i++){
    const radius=8+Math.random()*22;
    const theta=Math.random()*Math.PI*2;
    const phi=Math.acos(2*Math.random()-1);

    positions[i*3]=radius*Math.sin(phi)*Math.cos(theta);
    positions[i*3+1]=radius*Math.cos(phi);
    positions[i*3+2]=radius*Math.sin(phi)*Math.sin(theta);
  }

  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions,3)
  );

  const material=new THREE.PointsMaterial({
    color:0x7ee9e7,
    size:0.025,
    transparent:true,
    opacity:0.42,
    depthWrite:false
  });

  const stars=new THREE.Points(geometry,material);
  scene.add(stars);
  return stars;
}

const stars=createStars();

function latLonToVector(lat,lon,radius=2.22){
  const phi=(90-lat)*Math.PI/180;
  const theta=(lon+180)*Math.PI/180;

  return new THREE.Vector3(
    -radius*Math.sin(phi)*Math.cos(theta),
    radius*Math.cos(phi),
    radius*Math.sin(phi)*Math.sin(theta)
  );
}

const nodeData=[
  {
    name:"Panamá",
    lat:8.98,
    lon:-79.52,
    category:"networks",
    text:"Seguridad de redes y educación digital."
  },
  {
    name:"Virginia",
    lat:37.4,
    lon:-78.6,
    category:"cloud",
    text:"Infraestructura cloud y protección de servicios."
  },
  {
    name:"Dublín",
    lat:53.35,
    lon:-6.26,
    category:"privacy",
    text:"Privacidad y protección de datos."
  },
  {
    name:"Frankfurt",
    lat:50.11,
    lon:8.68,
    category:"privacy",
    text:"Arquitectura segura y protección de información."
  },
  {
    name:"Singapur",
    lat:1.35,
    lon:103.82,
    category:"threats",
    text:"Análisis educativo de amenazas digitales."
  },
  {
    name:"Tokio",
    lat:35.68,
    lon:139.69,
    category:"osint",
    text:"Inteligencia de fuentes abiertas y análisis digital."
  },
  {
    name:"São Paulo",
    lat:-23.55,
    lon:-46.63,
    category:"education",
    text:"Aprendizaje y concienciación en ciberseguridad."
  }
];

const interactiveNodes=[];
const nodeHalos=[];

nodeData.forEach((data,index)=>{
  const position=latLonToVector(data.lat,data.lon);

  const node=new THREE.Mesh(
    new THREE.SphereGeometry(0.065,14,14),
    new THREE.MeshBasicMaterial({
      color:0xb4fff6
    })
  );

  node.position.copy(position);
  node.userData={...data,index};
  globeGroup.add(node);
  interactiveNodes.push(node);

  const halo=new THREE.Mesh(
    new THREE.RingGeometry(0.09,0.145,28),
    new THREE.MeshBasicMaterial({
      color:0x70fff0,
      transparent:true,
      opacity:0.34,
      side:THREE.DoubleSide,
      depthWrite:false
    })
  );

  halo.position.copy(position.clone().multiplyScalar(1.008));
  halo.lookAt(new THREE.Vector3(0,0,0));
  halo.userData.nodeIndex=index;
  globeGroup.add(halo);
  nodeHalos.push(halo);
});

function createConnection(from,to){
  const a=latLonToVector(from.lat,from.lon,2.20);
  const b=latLonToVector(to.lat,to.lon,2.20);

  const midpoint=a.clone()
    .add(b)
    .multiplyScalar(0.5)
    .normalize()
    .multiplyScalar(3.05);

  const curve=new THREE.QuadraticBezierCurve3(a,midpoint,b);
  const points=curve.getPoints(52);

  const geometry=new THREE.BufferGeometry().setFromPoints(points);

  const material=new THREE.LineBasicMaterial({
    color:0x42cfc9,
    transparent:true,
    opacity:0.28
  });

  globeGroup.add(new THREE.Line(geometry,material));
}

createConnection(nodeData[0],nodeData[1]);
createConnection(nodeData[0],nodeData[2]);
createConnection(nodeData[0],nodeData[4]);
createConnection(nodeData[1],nodeData[5]);
createConnection(nodeData[2],nodeData[6]);
createConnection(nodeData[4],nodeData[5]);

const app=document.getElementById("cyber-app");
const raycaster=new THREE.Raycaster();
const pointer=new THREE.Vector2();

let selectedCategory="all";
let pointerStart=null;
let travel=null;
let targetTiltX=0;
let targetTiltY=0;

const categoryInfo={
  all:["Global Network","Explora todos los nodos del sistema."],
  threats:["Threat Intelligence","Amenazas digitales y análisis educativo."],
  privacy:["Privacy & Data","Privacidad y protección de información."],
  networks:["Network Security","Redes, arquitectura y defensa digital."],
  osint:["OSINT","Inteligencia de fuentes abiertas y análisis digital."],
  cloud:["Cloud Security","Infraestructura y protección de servicios cloud."],
  education:["Cyber Education","Aprendizaje interactivo y concienciación digital."],
  oceans:["Subsea Security","Océanos, cables submarinos e infraestructura marítima."],
  orbital:["Orbital Security","Satélites, enlaces espaciales y sistemas orbitales."]
};

function selectCategory(category){
  selectedCategory=category;
  let visible=0;

  categoryButtons.forEach(button=>{
    button.classList.toggle(
      "active",
      button.dataset.category===category
    );
  });

  interactiveNodes.forEach((node,index)=>{
    const show=category==="all"||node.userData.category===category;
    node.visible=show;
    nodeHalos[index].visible=show;
    if(show) visible++;
  });

  nodeCount.textContent=(category==="oceans"||category==="orbital")?"∞":String(visible).padStart(2,"0");
  panelTitle.textContent=categoryInfo[category][0];
  panelText.textContent=categoryInfo[category][1];
  selectedNode.textContent="Ninguno";
  selectedInfo.textContent="Toca un punto luminoso del globo.";
}

categoryButtons.forEach(button=>{
  button.addEventListener("click",()=>{
    selectCategory(button.dataset.category);
  });
});

function easeInOutCubic(t){
  return t<0.5
    ?4*t*t*t
    :1-Math.pow(-2*t+2,3)/2;
}

function beginTravel(node){
  const nodeWorld=new THREE.Vector3();
  const centerWorld=new THREE.Vector3();

  node.getWorldPosition(nodeWorld);
  globeGroup.getWorldPosition(centerWorld);

  const direction=nodeWorld.clone()
    .sub(centerWorld)
    .normalize();

  const destination=centerWorld.clone()
    .add(direction.multiplyScalar(4.25));

  destination.y+=0.25;

  travel={
    start:performance.now(),
    duration:2100,
    from:camera.position.clone(),
    to:destination,
    node:node,
    reset:false
  };

  activeNode=node;
  selectedNode.textContent=node.userData.name;
  selectedInfo.textContent=node.userData.text;
  panelTitle.textContent=node.userData.name;
  panelText.textContent="Iniciando viaje hacia el nodo seleccionado...";
}

function resetCamera(){
  activeNode=null;
  travel={
    start:performance.now(),
    duration:1200,
    from:camera.position.clone(),
    to:homeCamera.clone(),
    node:null,
    reset:true
  };

  selectedNode.textContent="Vista global";
  selectedInfo.textContent="Exploración mundial de Cyber Lab.";
  panelTitle.textContent=categoryInfo[selectedCategory][0];
  panelText.textContent=categoryInfo[selectedCategory][1];
}

resetBtn.addEventListener("click",resetCamera);

exploreBtn.addEventListener("click",()=>{
  globeGroup.rotation.y+=0.35;
  panelText.textContent="Selecciona un criterio y toca un nodo luminoso.";
});

app.addEventListener("pointerdown",event=>{
  if(event.target.closest("button")) return;

  pointerStart={
    x:event.clientX,
    y:event.clientY
  };
});

app.addEventListener("pointerup",event=>{
  if(event.target.closest("button")) return;
  if(!pointerStart) return;

  const movement=Math.hypot(
    event.clientX-pointerStart.x,
    event.clientY-pointerStart.y
  );

  pointerStart=null;

  if(movement>18) return;

  const rect=canvas.getBoundingClientRect();

  pointer.x=((event.clientX-rect.left)/rect.width)*2-1;
  pointer.y=-((event.clientY-rect.top)/rect.height)*2+1;

  raycaster.setFromCamera(pointer,camera);

  const selectable=nodeHitTargets.filter(hit=>hit.userData.targetNode.visible);
  const hits=raycaster.intersectObjects(selectable,false);

  if(hits.length){
    beginTravel(hits[0].object.userData.targetNode);
  }
});

window.addEventListener("pointermove",event=>{
  if(event.pointerType==="touch") return;

  targetTiltY=(event.clientX/window.innerWidth-0.5)*0.18;
  targetTiltX=(event.clientY/window.innerHeight-0.5)*0.09;
});

let isGlobeDragging=false;
let globeUserControl=false;
let globePointerId=null;
let globeLastX=0;
let globeLastY=0;
let globeVelocityX=0;
let globeVelocityY=0;
let globeDragDistance=0;
let globeDragStartedAt=0;
let frameCounter=0;
let fpsStart=performance.now();
let lastTime=performance.now();

function animate(now){
  requestAnimationFrame(animate);

  const dt=Math.min((now-lastTime)/1000,0.05);
  lastTime=now;

  if(!isGlobeDragging){
    globeGroup.rotation.y+=dt*0.065;
    globeGroup.rotation.y+=globeVelocityY*dt;
    globeGroup.rotation.x+=globeVelocityX*dt;
    const inertia=Math.exp(-1.55*dt);
    globeVelocityY*=inertia;
    globeVelocityX*=inertia;
  }

  if(!globeUserControl){ globeGroup.rotation.x+=(
    targetTiltX-globeGroup.rotation.x
  )*0.015; }

  globeGroup.rotation.z+=(
    (-targetTiltY*0.18)-globeGroup.rotation.z
  )*0.012;

  ringA.rotation.z+=dt*0.05; cloudLayer.rotation.y+=dt*0.012;
  ringB.rotation.z-=dt*0.035;
  stars.rotation.y-=dt*0.004; updateDataPackets(now); updateFocusEffect(now); updateGeoMarker(now);

  interactiveNodes.forEach((node,index)=>{
    const pulse=1+Math.sin(now*0.003+index)*0.22;
    node.scale.setScalar(pulse);

    const halo=nodeHalos[index];
    halo.scale.setScalar(1+Math.sin(now*0.0025+index)*0.16);
    halo.material.opacity=0.22+Math.sin(now*0.002+index)*0.10;
  });

  if(travel){
    const raw=Math.min(
      (now-travel.start)/travel.duration,
      1
    );

    const t=easeInOutCubic(raw);

    camera.position.lerpVectors(
      travel.from,
      travel.to,
      t
    );

    if(travel.node && raw>0.58){
      panelText.textContent=travel.node.userData.text;
    }

    if(raw>=1){
      travel=null;
    }
  }

  camera.lookAt(globeGroup.position);
  renderer.render(scene,camera);

  frameCounter++;

  if(now-fpsStart>=1000){
    const fps=Math.round(
      frameCounter*1000/(now-fpsStart)
    );

    fpsElement.textContent=fps+" FPS";
    frameCounter=0;
    fpsStart=now;
  }
}

function resize(){
  const width=window.innerWidth;
  const height=window.innerHeight;

  setRendererSize();

  camera.aspect=width/height;
  camera.updateProjectionMatrix();

  if(width<850){
    globeGroup.position.set(0,1.35,0); globeGroup.scale.setScalar(0.64);

    if(!travel){
      camera.position.z=Math.max(camera.position.z,7.8);
    }
  }else{
    globeGroup.position.set(2.35,0.25,0); globeGroup.scale.setScalar(1);
  }
}

window.addEventListener("resize",resize);

selectCategory("all");
resize();

requestAnimationFrame(animate);

setTimeout(()=>{
  boot.classList.add("hidden");
},850);

function updateGlobeDepth(){
  const distance=window.scrollY;
  const limit=window.innerHeight*0.95;
  const progress=Math.min(distance/limit,1);
  const opacity=1-progress*0.72;
  canvas.style.opacity=String(opacity);
}

window.addEventListener(
  "scroll",
  updateGlobeDepth,
  {passive:true}
);

updateGlobeDepth();

/* ===== CYBER DATA PACKETS v0.4 ===== */
const dataPackets=[];

function addDataPacket(from,to,speed,offset){
  const a=latLonToVector(from.lat,from.lon,2.24);
  const b=latLonToVector(to.lat,to.lon,2.24);

  const midpoint=a.clone()
    .add(b)
    .multiplyScalar(0.5)
    .normalize()
    .multiplyScalar(3.08);

  const curve=new THREE.QuadraticBezierCurve3(
    a,
    midpoint,
    b
  );

  const dot=new THREE.Mesh(
    new THREE.SphereGeometry(0.034,10,10),
    new THREE.MeshBasicMaterial({
      color:0xb6fff6,
      transparent:true,
      opacity:0.95
    })
  );

  globeGroup.add(dot);

  dataPackets.push({
    curve:curve,
    dot:dot,
    speed:speed,
    offset:offset
  });
}

addDataPacket(nodeData[0],nodeData[1],1.00,0.05);
addDataPacket(nodeData[0],nodeData[2],0.82,0.35);
addDataPacket(nodeData[0],nodeData[4],0.72,0.62);
addDataPacket(nodeData[1],nodeData[5],0.88,0.18);
addDataPacket(nodeData[2],nodeData[6],0.76,0.48);
addDataPacket(nodeData[4],nodeData[5],0.94,0.78);

function updateDataPackets(now){
  const time=now*0.00012;

  dataPackets.forEach((packet,index)=>{
    const position=(
      time*packet.speed+
      packet.offset
    )%1;

    packet.dot.position.copy(
      packet.curve.getPoint(position)
    );

    const pulse=
      1+
      Math.sin(now*0.008+index)*0.28;

    packet.dot.scale.setScalar(pulse);
  });
}

/* ===== NODE INTERACTION v0.5 ===== */
const nodeHitTargets=[];
let activeNode=null;
const focusOrigin=new THREE.Vector3(0,0,0);

interactiveNodes.forEach(node=>{
  const hit=new THREE.Mesh(
    new THREE.SphereGeometry(0.24,12,12),
    new THREE.MeshBasicMaterial({
      transparent:true,
      opacity:0,
      depthWrite:false
    })
  );

  hit.position.copy(node.position);
  hit.userData.targetNode=node;
  globeGroup.add(hit);
  nodeHitTargets.push(hit);
});

const focusAura=new THREE.Mesh(
  new THREE.RingGeometry(0.13,0.24,36),
  new THREE.MeshBasicMaterial({
    color:0x8ffff2,
    transparent:true,
    opacity:0.72,
    side:THREE.DoubleSide,
    depthWrite:false
  })
);

focusAura.visible=false;
globeGroup.add(focusAura);

function updateFocusEffect(now){
  if(!activeNode){
    focusAura.visible=false;
    return;
  }

  focusAura.visible=true;
  focusAura.position.copy(
    activeNode.position.clone().multiplyScalar(1.012)
  );

  focusAura.lookAt(focusOrigin);

  const pulse=
    1.15+
    Math.sin(now*0.006)*0.28;

  focusAura.scale.setScalar(pulse);

  focusAura.material.opacity=
    0.42+
    (Math.sin(now*0.006)+1)*0.18;
}

/* ===== REAL EARTH v0.6 ===== */
const realismLoader=new THREE.TextureLoader();

const earthNormal=realismLoader.load(
  "./images/earth_normal_2048.jpg"
);

const earthSpecular=realismLoader.load(
  "./images/earth_specular_2048.jpg"
);

globeCore.material.normalMap=earthNormal;
globeCore.material.normalScale=new THREE.Vector2(0.72,-0.72);
globeCore.material.specularMap=earthSpecular;
globeCore.material.specular=new THREE.Color(0x8cbfc7);
globeCore.material.shininess=16;
globeCore.material.color.set(0xffffff);
globeCore.material.emissive.set(0x001014);
globeCore.material.emissiveIntensity=0.22;
globeCore.material.needsUpdate=true;

const cloudTexture=realismLoader.load(
  "./images/earth_clouds_1024.png",
  texture=>{
    texture.colorSpace=THREE.SRGBColorSpace;
  }
);

const cloudLayer=new THREE.Mesh(
  new THREE.SphereGeometry(2.145,48,32),
  new THREE.MeshLambertMaterial({
    map:cloudTexture,
    transparent:true,
    opacity:0.32,
    depthWrite:false
  })
);

globeGroup.add(cloudLayer);

const atmosphereGlow=new THREE.Mesh(
  new THREE.SphereGeometry(2.235,48,32),
  new THREE.ShaderMaterial({
    transparent:true,
    side:THREE.BackSide,
    depthWrite:false,
    blending:THREE.AdditiveBlending,
    vertexShader:`
      varying vec3 vNormal;
      void main(){
        vNormal=normalize(normalMatrix*normal);
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
      }
    `,
    fragmentShader:`
      varying vec3 vNormal;
      void main(){
        float rim=pow(0.72-dot(vNormal,vec3(0.0,0.0,1.0)),2.8);
        gl_FragColor=vec4(0.12,0.85,0.82,rim*0.32);
      }
    `
  })
);

globeGroup.add(atmosphereGlow);

const maxAniso=renderer.capabilities.getMaxAnisotropy();
if(globeCore.material.map){
  globeCore.material.map.anisotropy=Math.min(maxAniso,4);
}
earthNormal.anisotropy=Math.min(maxAniso,4);
earthSpecular.anisotropy=Math.min(maxAniso,4);
cloudTexture.anisotropy=Math.min(maxAniso,4);

/* ===== PHYSICAL GLOBE CONTROL v0.7 ===== */
globeControlZone.style.touchAction="none";

globeControlZone.addEventListener("pointerdown",event=>{
  if(event.pointerType==="mouse" && event.button!==0) return;

  globePointerId=event.pointerId;
  try{ globeControlZone.setPointerCapture(event.pointerId); }catch(e){}
  globeLastX=event.clientX;
  globeLastY=event.clientY;
  globeVelocityX=0;
  globeVelocityY=0;
  globeDragDistance=0;
  globeDragStartedAt=performance.now();
  isGlobeDragging=false;
});

globeControlZone.addEventListener("pointermove",event=>{
  if(event.pointerId!==globePointerId) return;

  const dx=event.clientX-globeLastX;
  const dy=event.clientY-globeLastY;

  globeDragDistance+=Math.abs(dx)+Math.abs(dy);

  if(globeDragDistance>8){
    isGlobeDragging=true;
    globeUserControl=true;
  }

  if(!isGlobeDragging) return;

  globeGroup.rotation.y+=dx*0.0062;
  globeGroup.rotation.x+=dy*0.0035;

  globeGroup.rotation.x=THREE.MathUtils.clamp(
    globeGroup.rotation.x,
    -0.72,
    0.72
  );

  globeVelocityY=THREE.MathUtils.clamp(
    dx*0.075,
    -1.65,
    1.65
  );

  globeVelocityX=THREE.MathUtils.clamp(
    dy*0.040,
    -0.75,
    0.75
  );

  globeLastX=event.clientX;
  globeLastY=event.clientY;
});

function releaseGlobe(event){
  if(event.pointerId!==globePointerId) return;

  const wasDragging=isGlobeDragging;

  globePointerId=null;
  isGlobeDragging=false;

  if(wasDragging && event.pointerType==="mouse"){
    setTimeout(()=>{
      globeUserControl=false;
    },1400);
  }
}

globeControlZone.addEventListener("pointerup",releaseGlobe);
globeControlZone.addEventListener("pointercancel",releaseGlobe);

globeControlZone.addEventListener("dblclick",()=>{
  globeVelocityX=0;
  globeVelocityY=0;
  globeUserControl=false;
});

/* ===== GLOBAL GEO ENGINE v0.8 ===== */
const geoHudStatus=document.getElementById("geo-hud-status");
const geoHudTitle=document.getElementById("geo-hud-title");
const geoHudMeta=document.getElementById("geo-hud-meta");

let worldFeatures=[];
let worldDataReady=false;
let geoMarkerActive=false;

fetch("./data/world-countries.geojson")
  .then(response=>{
    if(!response.ok) throw new Error("World map unavailable");
    return response.json();
  })
  .then(data=>{
    worldFeatures=data.features||[];
    worldDataReady=true;
    geoHudStatus.textContent="GLOBAL MAP READY";
  })
  .catch(error=>{
    console.warn("Geo dataset:",error);
    geoHudStatus.textContent="GLOBAL FALLBACK";
  });

function localPointToLatLon(point){
  const p=point.clone().normalize();
  const lat=THREE.MathUtils.radToDeg(Math.asin(p.y));
  let theta=THREE.MathUtils.radToDeg(Math.atan2(p.z,-p.x));
  let lon=theta-180;

  while(lon>180) lon-=360;
  while(lon<-180) lon+=360;

  return {lat,lon};
}

function pointInRing(lon,lat,ring){
  let inside=false;

  for(let i=0,j=ring.length-1;i<ring.length;j=i++){
    let xi=ring[i][0];
    let yi=ring[i][1];
    let xj=ring[j][0];
    let yj=ring[j][1];

    while(xi-lon>180) xi-=360;
    while(xi-lon<-180) xi+=360;
    while(xj-lon>180) xj-=360;
    while(xj-lon<-180) xj+=360;

    const crosses=
      ((yi>lat)!==(yj>lat)) &&
      (lon < (xj-xi)*(lat-yi)/((yj-yi)||1e-12)+xi);

    if(crosses) inside=!inside;
  }

  return inside;
}

function pointInPolygon(lon,lat,polygon){
  if(!polygon.length) return false;
  if(!pointInRing(lon,lat,polygon[0])) return false;

  for(let i=1;i<polygon.length;i++){
    if(pointInRing(lon,lat,polygon[i])) return false;
  }

  return true;
}

function featureContains(feature,lon,lat){
  const geometry=feature.geometry;
  if(!geometry) return false;

  if(geometry.type==="Polygon"){
    return pointInPolygon(lon,lat,geometry.coordinates);
  }

  if(geometry.type==="MultiPolygon"){
    return geometry.coordinates.some(poly=>
      pointInPolygon(lon,lat,poly)
    );
  }

  return false;
}

function findCountry(lon,lat){
  if(!worldDataReady) return null;

  for(const feature of worldFeatures){
    if(featureContains(feature,lon,lat)) return feature;
  }

  return null;
}

function translateContinent(value){
  const names={
    "Africa":"África",
    "Asia":"Asia",
    "Europe":"Europa",
    "North America":"América del Norte",
    "South America":"América del Sur",
    "Oceania":"Oceanía",
    "Antarctica":"Antártida",
    "Seven seas (open ocean)":"Océanos"
  };

  return names[value]||value||"Global";
}

function approximateOcean(lat,lon){
  if(lat>66) return "Océano Ártico";
  if(lat<-60) return "Océano Austral";
  if(lon>=20 && lon<=120 && lat<35) return "Océano Índico";
  if(lon>120 || lon<-70) return "Océano Pacífico";
  return "Océano Atlántico";
}

const geoMarkerRing=new THREE.Mesh(
  new THREE.RingGeometry(0.11,0.22,40),
  new THREE.MeshBasicMaterial({
    color:0x8ffff2,
    transparent:true,
    opacity:0.82,
    side:THREE.DoubleSide,
    depthWrite:false
  })
);

const geoMarkerBeam=new THREE.Mesh(
  new THREE.CylinderGeometry(0.010,0.018,0.46,10),
  new THREE.MeshBasicMaterial({
    color:0x8ffff2,
    transparent:true,
    opacity:0.52,
    blending:THREE.AdditiveBlending,
    depthWrite:false
  })
);

const geoMarkerLight=new THREE.PointLight(
  0x7efff1,
  2.1,
  1.3
);

geoMarkerRing.visible=false;
geoMarkerBeam.visible=false;
geoMarkerLight.visible=false;

globeGroup.add(geoMarkerRing);
globeGroup.add(geoMarkerBeam);
globeGroup.add(geoMarkerLight);

const markerZ=new THREE.Vector3(0,0,1);
const markerY=new THREE.Vector3(0,1,0);

function placeGeoMarker(localPoint){
  const normal=localPoint.clone().normalize();

  geoMarkerRing.position.copy(normal.clone().multiplyScalar(2.23));
  geoMarkerRing.quaternion.setFromUnitVectors(markerZ,normal);

  geoMarkerBeam.position.copy(normal.clone().multiplyScalar(2.43));
  geoMarkerBeam.quaternion.setFromUnitVectors(markerY,normal);

  geoMarkerLight.position.copy(normal.clone().multiplyScalar(2.32));

  geoMarkerRing.visible=true;
  geoMarkerBeam.visible=true;
  geoMarkerLight.visible=true;
  geoMarkerActive=true;
}

function updateGeoMarker(now){
  if(!geoMarkerActive) return;

  const pulse=1+Math.sin(now*0.007)*0.24;
  geoMarkerRing.scale.setScalar(pulse);
  geoMarkerRing.material.opacity=0.55+Math.sin(now*0.007)*0.20;
  geoMarkerBeam.material.opacity=0.30+Math.sin(now*0.005)*0.16;
}

function showOrbitalSelection(){
  activeNode=null;
  geoMarkerActive=false;
  geoMarkerRing.visible=false;
  geoMarkerBeam.visible=false;
  geoMarkerLight.visible=false;

  geoHudStatus.textContent="ORBITAL LAYER";
  geoHudTitle.textContent="ÓRBITA TERRESTRE";
  geoHudMeta.textContent="Satélites · enlaces · navegación · comunicaciones";

  panelTitle.textContent="Orbital Cybersecurity";
  panelText.textContent="Seguridad de satélites, estaciones terrestres, enlaces espaciales y sistemas de navegación.";
  selectedNode.textContent="Espacio cercano";
  selectedInfo.textContent="Infraestructura digital y comunicaciones orbitales.";
}

function selectSurfaceAt(clientX,clientY){
  const rect=canvas.getBoundingClientRect();

  pointer.x=((clientX-rect.left)/rect.width)*2-1;
  pointer.y=-((clientY-rect.top)/rect.height)*2+1;

  raycaster.setFromCamera(pointer,camera);

  const hits=raycaster.intersectObject(globeCore,false);

  if(!hits.length){
    showOrbitalSelection();
    return;
  }

  activeNode=null;

  const localPoint=globeGroup.worldToLocal(
    hits[0].point.clone()
  );

  const coords=localPointToLatLon(localPoint);
  const lat=coords.lat;
  const lon=coords.lon;

  placeGeoMarker(localPoint);

  const feature=findCountry(lon,lat);

  if(feature){
    const p=feature.properties||{};
    const country=
      p.NAME_ES||
      p.ADMIN||
      p.NAME_LONG||
      p.NAME||
      "Territorio";

    const continent=translateContinent(p.CONTINENT);
    const subregion=p.SUBREGION||"";

    geoHudStatus.textContent="LAND IDENTIFIED";
    geoHudTitle.textContent=country;
    geoHudMeta.textContent=
      continent+
      (subregion?" · "+subregion:"")+
      " · "+lat.toFixed(2)+"°, "+lon.toFixed(2)+"°";

    panelTitle.textContent=country;
    panelText.textContent=
      "Superficie terrestre seleccionada en "+continent+". Explora ciberseguridad, infraestructura, privacidad y proyectos asociados a esta región.";

    selectedNode.textContent=country;
    selectedInfo.textContent=
      continent+" · "+lat.toFixed(2)+"°, "+lon.toFixed(2)+"°";

    return;
  }

  const ocean=approximateOcean(lat,lon);

  geoHudStatus.textContent="SUBSEA LAYER";
  geoHudTitle.textContent=ocean;
  geoHudMeta.textContent=
    "Zona oceánica aproximada · "+lat.toFixed(2)+"°, "+lon.toFixed(2)+"°";

  panelTitle.textContent=ocean;
  panelText.textContent=
    "Ciberseguridad marítima y submarina: cables de comunicaciones, sensores, infraestructura crítica y enlaces internacionales.";

  selectedNode.textContent=ocean;
  selectedInfo.textContent="Infraestructura submarina y comunicaciones globales.";
}

globeControlZone.addEventListener("pointerdown",event=>{
  const scanX=event.clientX;
  const scanY=event.clientY;

  geoHudStatus.textContent="SCANNING...";

  setTimeout(()=>{
    if(
      globePointerId===event.pointerId &&
      globeDragDistance<8
    ){
      selectSurfaceAt(scanX,scanY);
    }
  },90);
});

globeControlZone.addEventListener("pointermove",()=>{
  if(isGlobeDragging){
    geoHudStatus.textContent="ROTATING GLOBE";
    geoHudTitle.textContent="EXPLORANDO";
    geoHudMeta.textContent="Suelta y toca una región para identificarla";
  }
});

globeControlZone.addEventListener("pointerup",event=>{
  if(globeDragDistance<12){
    selectSurfaceAt(event.clientX,event.clientY);
  }else{
    setTimeout(()=>{
      geoHudStatus.textContent="GLOBAL SCAN";
      geoHudTitle.textContent="TOCA UN DESTINO";
      geoHudMeta.textContent="País · continente · océano · órbita";
    },280);
  }
});
