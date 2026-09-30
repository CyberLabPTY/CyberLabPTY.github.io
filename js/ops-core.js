/* CYBER LAB - OPERATIONS CORE v1.0 */
(() => {
  const root=document.getElementById("ops-core");
  if(!root){ console.warn("Operations Core root missing"); return; }

  const geoName=document.getElementById("selected-node");
  const geoInfo=document.getElementById("selected-info");

  const modules=[
    {
      id:"systems",code:"SYS-OPS",short:"SYSTEMS",
      title:"Systems Control",
      desc:"Administración de sistemas, servicios, procesos, identidades, permisos, almacenamiento y registros.",
      metrics:["SERVICES","ACCESS","LOGS"],
      logs:["Inicializando consola de sistemas","Enumerando servicios de laboratorio","Verificando identidades y privilegios","Analizando eventos del sistema","Estado operativo consolidado"]
    },
    {
      id:"network",code:"NET-OPS",short:"NETWORKS",
      title:"Network Operations",
      desc:"Topologías, routing, DNS, firewalls, segmentación, telemetría y comunicaciones seguras.",
      metrics:["ROUTES","FILTERS","LINKS"],
      logs:["Cargando topología de entrenamiento","Validando resolución DNS","Inspeccionando rutas y segmentos","Evaluando políticas de firewall","Red de laboratorio estable"]
    },
    {
      id:"soc",code:"SOC-BLUE",short:"SOC",
      title:"SOC / Blue Team",
      desc:"Monitoreo defensivo, correlación de eventos, triage y respuesta simulada a incidentes.",
      metrics:["EVENTS","TRIAGE","STATUS"],
      logs:["Activando canal defensivo","Normalizando eventos simulados","Correlacionando señales","Ejecutando triage","Sin incidente crítico activo"]
    },
    {
      id:"threat",code:"CTI-GRID",short:"THREAT INTEL",
      title:"Threat Intelligence",
      desc:"Análisis educativo de amenazas, indicadores, comportamientos y relaciones técnicas.",
      metrics:["SIGNALS","IOC","CONTEXT"],
      logs:["Preparando entorno CTI","Clasificando señales simuladas","Relacionando indicadores","Enriqueciendo contexto","Modelo de amenaza actualizado"]
    },
    {
      id:"osint",code:"OSINT-LAB",short:"OSINT",
      title:"Open Source Intelligence",
      desc:"Investigación educativa con fuentes públicas, verificación, relaciones y análisis abierto.",
      metrics:["SOURCES","VERIFY","LINKS"],
      logs:["Abriendo workspace OSINT","Organizando fuentes públicas","Validando consistencia","Construyendo relaciones","Análisis documental listo"]
    },
    {
      id:"cloud",code:"CLD-IAM",short:"CLOUD",
      title:"Cloud & Identity",
      desc:"Identidades, MFA, privilegios, servicios cloud y arquitectura de acceso seguro.",
      metrics:["IDENTITY","MFA","POLICY"],
      logs:["Cargando modelo IAM","Verificando factores de acceso","Evaluando privilegios","Revisando políticas cloud","Arquitectura de acceso validada"]
    },
    {
      id:"crypto",code:"CRYPTO-OPS",short:"CRYPTO",
      title:"Cryptography & Privacy",
      desc:"Cifrado, hashes, claves, integridad, autenticidad y protección de información.",
      metrics:["HASH","KEYS","INTEGRITY"],
      logs:["Abriendo laboratorio criptográfico","Validando integridad","Comparando funciones hash","Revisando ciclo de claves","Entorno criptográfico estable"]
    },
    {
      id:"forensics",code:"DFIR-LAB",short:"FORENSICS",
      title:"Digital Forensics",
      desc:"Reconstrucción educativa mediante registros, artefactos, líneas de tiempo y evidencias simuladas.",
      metrics:["ARTIFACTS","TIMELINE","EVIDENCE"],
      logs:["Creando caso de entrenamiento","Indexando artefactos","Construyendo línea temporal","Correlacionando registros","Caso preparado para análisis"]
    }
  ];

  let active="systems";
  let timer=null;

  function current(){
    return modules.find(m=>m.id===active)||modules[0];
  }

  function buttons(){
    return modules.map(m=>
      `<button type="button" class="ops-module ${m.id===active?"active":""}" data-ops="${m.id}">${m.short}</button>`
    ).join("");
  }

  function signal(){
    let html="";
    for(let i=0;i<20;i++){
      const h=18+((i*17)%78);
      html+=`<i style="height:${h}%;animation-delay:${(i%7)*.11}s"></i>`;
    }
    return html;
  }

  root.innerHTML=`
    <div class="ops-shell">
      <header class="ops-head">
        <div>
          <span class="ops-kicker">CYBER OPERATIONS & SYSTEMS LABORATORY</span>
          <h2>Operations Core</h2>
          <p>Centro interactivo de administración tecnológica, defensa, inteligencia y análisis.</p>
        </div>
        <div class="ops-state"><i></i> SIMULATION ENVIRONMENT</div>
      </header>
      <nav class="ops-modules">${buttons()}</nav>
      <div class="ops-grid">
        <section class="ops-info">
          <span class="ops-code" id="ops-code"></span>
          <h3 id="ops-title"></h3>
          <div class="ops-desc" id="ops-desc"></div>
          <div class="ops-context">
            <small>GLOBAL INTELLIGENCE CONTEXT</small>
            <strong id="ops-context">GLOBAL CYBER GRID // STANDBY</strong>
          </div>
          <div class="ops-metrics" id="ops-metrics"></div>
          <div class="ops-visual" id="ops-visual"></div>
          <div class="ops-actions">
            <button type="button" class="ops-action" id="ops-run">RUN TRAINING SIMULATION</button>
            <button type="button" class="ops-action secondary" id="ops-globe">RETURN TO GLOBAL CORE</button>
          </div>
        </section>
        <section class="ops-console">
          <div class="ops-console-head">
            <span>SECURE CONSOLE // LOCAL</span>
            <strong id="ops-console-state">READY</strong>
          </div>
          <div class="ops-terminal" id="ops-terminal"></div>
          <div class="ops-signal">${signal()}</div>
        </section>
      </div>
      <footer class="ops-foot">
        <span>SAFE TRAINING ENVIRONMENT</span>
        <span>CYBER LAB // OPERATIONS CORE</span>
      </footer>
    </div>`;

  function metrics(module){
    return module.metrics.map((label,index)=>{
      const value=index===0?"ACTIVE":index===1?"VALID":"READY";
      return `<div class="ops-metric"><b>${value}</b><span>${label}</span></div>`;
    }).join("");
  }

  function update(id){
    active=id;
    const module=current();

    root.querySelectorAll(".ops-module").forEach(btn=>
      btn.classList.toggle("active",btn.dataset.ops===id)
    );

    document.getElementById("ops-code").textContent=module.code;
    document.getElementById("ops-title").textContent=module.title;
    document.getElementById("ops-desc").textContent=module.desc;
    document.getElementById("ops-metrics").innerHTML=metrics(module);
    document.getElementById("ops-console-state").textContent="READY";
    document.getElementById("ops-terminal").innerHTML=
      `<div class="ops-line">${module.title} preparado.</div>`;

    renderVisual(id);

    const linked={
      network:"networks",
      threat:"threats",
      osint:"osint",
      cloud:"cloud"
    };

    if(linked[id]){
      const button=document.querySelector(`.category[data-category="${linked[id]}"]`);
      if(button) button.click();
    }
  }

  function renderVisual(id){
    const visual=document.getElementById("ops-visual");
    if(!visual) return;

    if(window.CyberForensicsLab){
      window.CyberForensicsLab.unmount();
    }

    if(window.CyberCryptoLab){
      window.CyberCryptoLab.unmount();
    }

    if(window.CyberCloudLab){
      window.CyberCloudLab.unmount();
    }

    if(window.CyberOsintLab){
      window.CyberOsintLab.unmount();
    }

    if(window.CyberThreatLab){
      window.CyberThreatLab.unmount();
    }

    if(window.CyberSocLab){
      window.CyberSocLab.unmount();
    }

    if(window.CyberNetworkLab){
      window.CyberNetworkLab.unmount();
    }

    if(window.CyberSystemsLab){
      window.CyberSystemsLab.unmount();
    }

    if(id==="systems" && window.CyberSystemsLab){
      window.CyberSystemsLab.mount(visual);
      return;
    }

    if(id==="network" && window.CyberNetworkLab){
      window.CyberNetworkLab.mount(visual);
      return;
    }

    if(id==="soc" && window.CyberSocLab){
      window.CyberSocLab.mount(visual);
      return;
    }

    if(id==="threat" && window.CyberThreatLab){
      window.CyberThreatLab.mount(visual);
      return;
    }

    if(id==="osint" && window.CyberOsintLab){
      window.CyberOsintLab.mount(visual);
      return;
    }

    if(id==="cloud" && window.CyberCloudLab){
      window.CyberCloudLab.mount(visual);
      return;
    }

    if(id==="crypto" && window.CyberCryptoLab){
      window.CyberCryptoLab.mount(visual);
      return;
    }

    if(id==="forensics" && window.CyberForensicsLab){
      window.CyberForensicsLab.mount(visual);
      return;
    }

    visual.innerHTML=`<div class="ops-next-module">${current().title} // visual environment queued for the next development phase.</div>`;
  }

  function runSimulation(){
    const module=current();
    const terminal=document.getElementById("ops-terminal");
    const state=document.getElementById("ops-console-state");
    const button=document.getElementById("ops-run");

    if(timer) clearInterval(timer);

    terminal.innerHTML="";
    state.textContent="RUNNING";
    button.disabled=true;
    button.textContent="SIMULATION RUNNING...";

    let index=0;

    const push=()=>{
      const line=document.createElement("div");
      line.className="ops-line";
      line.textContent=module.logs[index];
      terminal.appendChild(line);
      index++;

      if(index>=module.logs.length){
        clearInterval(timer);
        timer=null;
        state.textContent="COMPLETE";
        button.disabled=false;
        button.textContent="RUN AGAIN";
      }
    };

    push();
    timer=setInterval(push,700);
  }

  function syncContext(){
    const name=(geoName?.textContent||"GLOBAL CYBER GRID").trim();
    const info=(geoInfo?.textContent||"").trim();
    const target=document.getElementById("ops-context");
    if(target) target.textContent=name+(info?" // "+info:"");
  }

  root.addEventListener("click",event=>{
    const moduleButton=event.target.closest(".ops-module");

    if(moduleButton){
      update(moduleButton.dataset.ops);
      return;
    }

    if(event.target.id==="ops-run"){
      runSimulation();
      return;
    }

    if(event.target.id==="ops-globe"){
      window.scrollTo({top:0,behavior:"smooth"});
    }
  });

  if(geoName && geoInfo){
    const observer=new MutationObserver(syncContext);
    observer.observe(geoName,{childList:true,subtree:true,characterData:true});
    observer.observe(geoInfo,{childList:true,subtree:true,characterData:true});
  }

  update("systems");
  syncContext();
})();
