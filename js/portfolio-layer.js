/* CYBER LAB - PROFESSIONAL PORTFOLIO LAYER v1.12 */
(function(){
  function build(){
    if(document.getElementById("professional-portfolio")) return;

    var ops=document.getElementById("ops-core");
    if(!ops) return;

    var section=document.createElement("section");
    section.id="professional-portfolio";
    section.className="portfolio-layer";
    section.setAttribute("aria-label","Perfil técnico y capacidades demostradas");

    section.innerHTML=`
      <div class="portfolio-shell">
        <div class="portfolio-hero">
          <span class="portfolio-kicker">PROFESSIONAL PORTFOLIO // CYBER LAB</span>
          <h2>Capacidades técnicas demostradas</h2>
          <p class="portfolio-lead">Cyber Lab es un portafolio técnico interactivo orientado a ciberseguridad defensiva, administración de sistemas y análisis tecnológico. Combina una interfaz geográfica 3D, laboratorios educativos, procesamiento local de datos y funciones criptográficas ejecutadas directamente en el navegador.</p>
          <div class="portfolio-status">
            <span class="verified">FUNCIONES REALES IDENTIFICADAS</span>
            <span>SIMULACIONES ETIQUETADAS</span>
            <span>SIN TELEMETRÍA DE ATAQUES EN VIVO</span>
          </div>
        </div>

        <div class="portfolio-grid">
          <article class="portfolio-card">
            <span class="portfolio-card-eyebrow">REAL LOCAL EXECUTION</span>
            <h3>Funciones reales del navegador</h3>
            <p>Estas funciones realizan procesamiento verdadero en el dispositivo del visitante y no representan datos ficticios.</p>
            <div class="portfolio-list">
              <div class="portfolio-item"><span>SHA-256 real mediante Web Crypto API.</span></div>
              <div class="portfolio-item"><span>Generación criptográficamente segura de valores aleatorios y nonces.</span></div>
              <div class="portfolio-item"><span>Procesamiento local de GeoJSON para contexto geográfico.</span></div>
              <div class="portfolio-item"><span>Interacción y renderizado 3D mediante Three.js.</span></div>
            </div>
          </article>

          <article class="portfolio-card">
            <span class="portfolio-card-eyebrow">DEFENSIVE TRAINING</span>
            <h3>Laboratorios educativos</h3>
            <p>Los escenarios de entrenamiento están diseñados para demostrar conceptos y flujos defensivos sin presentar actividad externa como si fuera información real.</p>
            <div class="portfolio-list">
              <div class="portfolio-item"><span>Systems Control y administración de servicios.</span></div>
              <div class="portfolio-item"><span>Network Operations y segmentación de red.</span></div>
              <div class="portfolio-item"><span>SOC, Threat Intelligence y respuesta defensiva.</span></div>
              <div class="portfolio-item"><span>OSINT, Cloud IAM y Digital Forensics.</span></div>
            </div>
          </article>

          <article class="portfolio-card">
            <span class="portfolio-card-eyebrow">GEOSPATIAL SYSTEM</span>
            <h3>Motor geográfico interactivo</h3>
            <p>El globo conecta coordenadas, países, océanos y categorías con el núcleo operativo del portafolio.</p>
            <div class="portfolio-list">
              <div class="portfolio-item"><span>Selección geográfica sobre esfera 3D.</span></div>
              <div class="portfolio-item"><span>Países mediante Natural Earth GeoJSON.</span></div>
              <div class="portfolio-item"><span>Identificación marina mediante polígonos oceánicos locales.</span></div>
              <div class="portfolio-item"><span>Sincronización del contexto con los módulos técnicos.</span></div>
            </div>
          </article>

          <article class="portfolio-card">
            <span class="portfolio-card-eyebrow">ENGINEERING APPROACH</span>
            <h3>Arquitectura modular</h3>
            <p>El proyecto separa el motor 3D, la interfaz, los adaptadores geográficos y cada laboratorio para facilitar mantenimiento y evolución.</p>
            <div class="portfolio-list">
              <div class="portfolio-item"><span>Módulos independientes por área de seguridad.</span></div>
              <div class="portfolio-item"><span>Adaptadores que evitan modificar el motor principal.</span></div>
              <div class="portfolio-item"><span>Diseño responsive para móvil y escritorio.</span></div>
              <div class="portfolio-item"><span>Estados estables y copias de respaldo por versión.</span></div>
            </div>
          </article>
        </div>

        <div class="portfolio-capabilities">
          <div class="portfolio-section-title">ÁREAS REPRESENTADAS EN EL PORTAFOLIO</div>
          <div class="portfolio-skills">
            <div class="portfolio-skill"><b>Systems</b><span>Servicios y administración</span></div>
            <div class="portfolio-skill"><b>Networks</b><span>Routing y segmentación</span></div>
            <div class="portfolio-skill"><b>SOC</b><span>Detección y respuesta</span></div>
            <div class="portfolio-skill"><b>Threat Intel</b><span>Análisis de indicadores</span></div>
            <div class="portfolio-skill"><b>OSINT</b><span>Fuentes públicas</span></div>
            <div class="portfolio-skill"><b>Cloud IAM</b><span>Identidad y acceso</span></div>
            <div class="portfolio-skill"><b>Cryptography</b><span>Hash y aleatoriedad</span></div>
            <div class="portfolio-skill"><b>DFIR</b><span>Integridad y evidencia</span></div>
          </div>
        </div>

        <div class="portfolio-tech">
          <div class="portfolio-section-title">TECNOLOGÍAS UTILIZADAS</div>
          <div class="portfolio-tech-list">
            <span>HTML5</span>
            <span>CSS3</span>
            <span>JavaScript</span>
            <span>Three.js</span>
            <span>Web Crypto API</span>
            <span>GeoJSON</span>
            <span>Natural Earth</span>
            <span>Responsive UI</span>
            <span>Browser APIs</span>
          </div>
        </div>

        <div class="portfolio-training">
          <small>FORMACIÓN COMPLEMENTARIA</small>
          <strong>Cybersecurity: Securing Information in a Globally Distributed Economy</strong>
          <p>Formación emitida por Tech Diplomacy Academy / Krach Institute for Tech Diplomacy at Purdue University. Se presenta como formación complementaria y no como una certificación profesional avanzada.</p>
        </div>

        <div class="portfolio-disclosure">
          <b>Transparencia técnica</b>
          <p>Cyber Lab combina funciones reales ejecutadas localmente con simulaciones educativas claramente diferenciadas. Los módulos de entrenamiento no representan ataques, víctimas, telemetría o inteligencia de amenazas en tiempo real.</p>
        </div>

        <div class="portfolio-actions">
          <a class="portfolio-action primary" href="#ops-core">EXPLORAR OPERATIONS CORE</a>
          <a class="portfolio-action" href="https://www.linkedin.com/in/kcc4" target="_blank" rel="noopener noreferrer">VER PERFIL DE LINKEDIN</a>
        </div>
      </div>
    `;

    ops.insertAdjacentElement("afterend",section);
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",build);
  }else{
    build();
  }

  window.CyberPortfolioLayer={
    build:build
  };
})();
