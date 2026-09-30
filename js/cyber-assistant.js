/* CYBER LAB - CYBER ASSISTANT v1.16 */
(function(){
  var shell, launcher, dock, logEl, inputEl, chipEls=[];
  var state={open:false,minimized:false};

  var quickTopics=[
    {key:'general',label:'RESUMEN'},
    {key:'globe',label:'GLOBO 3D'},
    {key:'labs',label:'LABS'},
    {key:'network',label:'REDES'},
    {key:'osint',label:'OSINT'},
    {key:'cloud',label:'CLOUD'},
    {key:'crypto',label:'CRYPTO'},
    {key:'forensics',label:'DFIR'}
  ];

  var shortcuts=[
    {label:'Ir al inicio', action:function(){ scrollToId('cyber-home'); }},
    {label:'Ver laboratorios', action:function(){ scrollToId('ops-core'); }},
    {label:'Capacidades', action:function(){ scrollToId('professional-portfolio'); }},
    {label:'Contacto', action:function(){ scrollToId('professional-contact'); }}
  ];

  function build(){
    if(document.querySelector('.cyber-assistant-shell')) return;

    launcher=document.createElement('button');
    launcher.type='button';
    launcher.className='cyber-assistant-launcher';
    launcher.setAttribute('aria-label','Abrir asistente de Cyber Lab');
    launcher.innerHTML='<span class="dot" aria-hidden="true"></span><div><b>ASISTENTE IA</b><span>ABRIR CONSOLA</span></div>';

    shell=document.createElement('section');
    shell.className='cyber-assistant-shell';
    shell.setAttribute('aria-label','Asistente inteligente de Cyber Lab');
    shell.innerHTML=''+
      '<div class="cyber-assistant-backdrop" data-assistant-close="1"></div>'+
      '<div class="cyber-assistant-window" role="dialog" aria-modal="true" aria-labelledby="cyber-assistant-title">'+
        '<header class="cyber-assistant-head">'+
          '<div class="cyber-assistant-brand">'+
            '<div class="cyber-assistant-mark">IA</div>'+
            '<div class="cyber-assistant-title">'+
              '<small>CYBER LAB // SECURE GUIDE</small>'+
              '<strong id="cyber-assistant-title">Asistente interactivo</strong>'+
              '<span>Ventana completa con ayuda guiada, apariencia de consola y accesos rápidos del portafolio.</span>'+
            '</div>'+
          '</div>'+
          '<div class="cyber-assistant-controls">'+
            '<button type="button" class="cyber-assistant-control" data-assistant-minimize="1" aria-label="Minimizar asistente">—</button>'+
            '<button type="button" class="cyber-assistant-control" data-assistant-close="1" aria-label="Cerrar asistente">✕</button>'+
          '</div>'+
        '</header>'+
        '<div class="cyber-assistant-main">'+
          '<aside class="cyber-assistant-sidebar">'+
            '<h3>Centro de ayuda</h3>'+
            '<p>Usa este panel para orientar al visitante, explicar laboratorios y abrir secciones sin perder el estilo profesional del sitio.</p>'+
            '<div class="cyber-assistant-chiplist" id="cyber-assistant-topics"></div>'+
            '<div class="cyber-assistant-sidebar-section">'+
              '<h3>Accesos directos</h3>'+
              '<div class="cyber-assistant-shortcuts" id="cyber-assistant-shortcuts"></div>'+
            '</div>'+
            '<div class="cyber-assistant-sidebar-section">'+
              '<h3>Modo del asistente</h3>'+
              '<p>El asistente responde localmente dentro del navegador para demostrar la experiencia visual y funcional. Más adelante se puede conectar a un servicio IA real si lo deseas.</p>'+
            '</div>'+
          '</aside>'+
          '<div class="cyber-assistant-chat">'+
            '<div class="cyber-assistant-chat-top">'+
              '<h3>Consola de conversación</h3>'+
              '<p>Pregúntame por redes, SOC, threat intelligence, OSINT, cloud, cryptography o forensics. También puedo guiar al usuario entre secciones del portafolio.</p>'+
            '</div>'+
            '<div class="cyber-assistant-log" id="cyber-assistant-log"></div>'+
          '</div>'+
        '</div>'+
        '<footer class="cyber-assistant-footer">'+
          '<form class="cyber-assistant-form" id="cyber-assistant-form">'+
            '<textarea class="cyber-assistant-input" id="cyber-assistant-input" rows="2" placeholder="Escribe una consulta, por ejemplo: ¿qué laboratorios tiene esta página?"></textarea>'+
            '<button type="submit" class="cyber-assistant-send">ENVIAR</button>'+
          '</form>'+
          '<div class="cyber-assistant-hint">Enter para enviar · Shift+Enter para salto de línea · Esc para cerrar · Minimizar para dejar un acceso fijo en pantalla.</div>'+
        '</footer>'+
      '</div>'+
      '<div class="cyber-assistant-dock">'+
        '<button type="button" class="cyber-assistant-dock-btn" aria-label="Restaurar asistente"><span class="dot" aria-hidden="true"></span><div><b>ASISTENTE IA</b><span>RESTAURAR VENTANA</span></div></button>'+
      '</div>';

    document.body.appendChild(launcher);
    document.body.appendChild(shell);

    dock=shell.querySelector('.cyber-assistant-dock-btn');
    logEl=shell.querySelector('#cyber-assistant-log');
    inputEl=shell.querySelector('#cyber-assistant-input');

    renderTopics();
    renderShortcuts();
    bind();
    seedConversation();
  }

  function renderTopics(){
    var holder=shell.querySelector('#cyber-assistant-topics');
    holder.innerHTML='';
    quickTopics.forEach(function(topic, index){
      var btn=document.createElement('button');
      btn.type='button';
      btn.className='cyber-assistant-chip'+(index===0?' active':'');
      btn.textContent=topic.label;
      btn.setAttribute('data-topic', topic.key);
      btn.addEventListener('click', function(){
        activateTopic(topic.key);
        answerTopic(topic.key);
      });
      holder.appendChild(btn);
      chipEls.push(btn);
    });
  }

  function renderShortcuts(){
    var holder=shell.querySelector('#cyber-assistant-shortcuts');
    holder.innerHTML='';
    shortcuts.forEach(function(item){
      var btn=document.createElement('button');
      btn.type='button';
      btn.className='cyber-assistant-shortcut';
      btn.textContent=item.label;
      btn.addEventListener('click', function(){
        item.action();
        appendBot('Abriendo: '+item.label+'. Si el visitante está en móvil, la navegación seguirá siendo fluida y sin perder contexto.');
      });
      holder.appendChild(btn);
    });
  }

  function bind(){
    launcher.addEventListener('click', openAssistant);
    dock.addEventListener('click', restoreAssistant);
    shell.addEventListener('click', function(event){
      if(event.target.closest('[data-assistant-close="1"]')){
        closeAssistant();
      }else if(event.target.closest('[data-assistant-minimize="1"]')){
        minimizeAssistant();
      }
    });

    var form=shell.querySelector('#cyber-assistant-form');
    form.addEventListener('submit', function(event){
      event.preventDefault();
      submitMessage();
    });

    inputEl.addEventListener('keydown', function(event){
      if(event.key === 'Enter' && !event.shiftKey){
        event.preventDefault();
        submitMessage();
      }
    });

    document.addEventListener('keydown', function(event){
      if(event.key === 'Escape' && state.open){
        closeAssistant();
      }
    });
  }

  function seedConversation(){
    appendBot('Bienvenido a Cyber Lab. Esta ventana abre en formato completo para verse profesional, legible y fácil de usar tanto en móvil como en escritorio.\n\nPuedo orientar al visitante sobre las áreas del portafolio, explicar laboratorios y enviarle rápidamente a la sección correcta.');
    appendBot(topicResponse('general'));
  }

  function openAssistant(){
    state.open=true;
    state.minimized=false;
    shell.classList.add('is-open');
    shell.classList.remove('is-minimized');
    launcher.style.display='none';
    setTimeout(function(){ inputEl.focus(); }, 40);
  }

  function closeAssistant(){
    state.open=false;
    state.minimized=false;
    shell.classList.remove('is-open','is-minimized');
    launcher.style.display='inline-flex';
  }

  function minimizeAssistant(){
    state.open=false;
    state.minimized=true;
    shell.classList.remove('is-open');
    shell.classList.add('is-minimized');
    launcher.style.display='none';
  }

  function restoreAssistant(){
    openAssistant();
  }

  function submitMessage(){
    var raw=inputEl.value.trim();
    if(!raw) return;
    appendUser(raw);
    inputEl.value='';
    autoResize();
    var response=resolveResponse(raw);
    setTimeout(function(){ appendBot(response); }, 220);
  }

  function appendUser(text){ appendMessage('user','VISITANTE',text); }
  function appendBot(text){ appendMessage('bot','ASISTENTE',text); }

  function appendMessage(kind,label,text){
    var item=document.createElement('div');
    item.className='cyber-assistant-msg '+kind;
    item.innerHTML='<small>'+label+'</small>'+escapeHtml(text);
    logEl.appendChild(item);
    logEl.scrollTop=logEl.scrollHeight;
  }

  function activateTopic(key){
    chipEls.forEach(function(el){
      el.classList.toggle('active', el.getAttribute('data-topic')===key);
    });
  }

  function answerTopic(key){
    appendBot(topicResponse(key));
  }

  function topicResponse(key){
    var map={
      general:'Cyber Lab es un portafolio técnico interactivo de ciberseguridad. Presenta un globo 3D, laboratorios defensivos, módulos educativos y una capa profesional para mostrar capacidades técnicas de forma clara y visual.',
      globe:'El globo 3D sirve como experiencia central de navegación. Permite explorar el contexto geográfico y conectar la experiencia visual con categorías del portafolio como threats, privacy, networks, OSINT, cloud y orbital.',
      labs:'La sección de laboratorios reúne módulos de Systems, Network Operations, SOC, Threat Intelligence, OSINT, Cloud IAM, Cryptography y Digital Forensics. Cada módulo está orientado a demostración y aprendizaje, con un enfoque defensivo.',
      network:'El laboratorio de redes muestra conceptos de segmentación, DMZ, routing y políticas activas. Está pensado para visualizar controles y lógica operativa de una forma más fácil de entender para el visitante.',
      osint:'El laboratorio OSINT presenta un flujo educativo sobre fuentes abiertas, análisis de señales públicas y revisión contextual, manteniendo el carácter demostrativo del portafolio.',
      cloud:'La parte de cloud está enfocada en identidad, acceso y enfoque Zero Trust. Es útil para mostrar cómo el portafolio representa seguridad moderna sin exagerar funciones reales.',
      crypto:'Cryptography demuestra funciones reales del navegador, como hash SHA-256 y generación segura de valores aleatorios, usando Web Crypto API localmente en el dispositivo.',
      forensics:'DFIR / Forensics ilustra conceptos de integridad, preservación y revisión de evidencia digital. Está presentado como simulación educativa con estilo técnico profesional.'
    };
    return map[key] || map.general;
  }

  function resolveResponse(text){
    var q=text.toLowerCase();

    if(matchAny(q,['inicio','home','principal'])){
      scrollToId('cyber-home');
      return 'Te llevé al inicio. Allí encontrarás la presentación principal del proyecto, los botones de exploración y el acceso rápido a la experiencia central.';
    }
    if(matchAny(q,['laboratorio','labs','lab','modulos','módulos'])){
      scrollToId('ops-core');
      activateTopic('labs');
      return topicResponse('labs')+'\n\nAcabo de llevar la vista a la zona de laboratorios para que el visitante los tenga más a mano.';
    }
    if(matchAny(q,['portfolio','portafolio','capacidades','skills'])){
      scrollToId('professional-portfolio');
      return 'La sección de capacidades técnicas resume funciones reales del navegador, laboratorios educativos, arquitectura modular y áreas representadas dentro del portafolio.';
    }
    if(matchAny(q,['contacto','linkedin'])){
      scrollToId('professional-contact');
      return 'La parte final incluye identidad del proyecto, tecnologías usadas y el acceso al perfil profesional de LinkedIn.';
    }
    if(matchAny(q,['globo','globe','3d','planeta','tierra'])){
      activateTopic('globe');
      return topicResponse('globe');
    }
    if(matchAny(q,['network','red','redes','routing','dmz'])){
      activateTopic('network');
      return topicResponse('network');
    }
    if(matchAny(q,['soc','incidente','respuesta'])){
      activateTopic('labs');
      return 'El módulo SOC representa detección, contención y respuesta defensiva a incidentes. Está integrado dentro del bloque de laboratorios para reforzar la experiencia práctica del portafolio.';
    }
    if(matchAny(q,['threat','amenaza','intelligence','ioc'])){
      activateTopic('labs');
      return 'Threat Intelligence se enfoca en correlación de indicadores y comprensión de campañas de forma didáctica. La presentación mantiene una estética técnica sin confundir la simulación con telemetría en vivo.';
    }
    if(matchAny(q,['osint','fuentes abiertas'])){
      activateTopic('osint');
      return topicResponse('osint');
    }
    if(matchAny(q,['cloud','zero trust','iam'])){
      activateTopic('cloud');
      return topicResponse('cloud');
    }
    if(matchAny(q,['crypto','criptografia','criptografía','sha','hash'])){
      activateTopic('crypto');
      return topicResponse('crypto');
    }
    if(matchAny(q,['forensics','dfir','evidencia'])){
      activateTopic('forensics');
      return topicResponse('forensics');
    }
    if(matchAny(q,['ia','assistant','asistente'])){
      return 'Este asistente ya tiene la interfaz completa en estilo ciberseguridad: ventana expandida, opción de minimizar o cerrar, accesos rápidos y respuestas locales para orientar al visitante. Si luego quieres, se puede conectar a una IA real mediante API.';
    }

    return 'Puedo ayudarte con estas rutas: resumen del sitio, globo 3D, laboratorios, network, OSINT, cloud, cryptography, forensics, capacidades o contacto.\n\nSi quieres, prueba preguntando por una sección concreta o usa los accesos directos del panel.';
  }

  function scrollToId(id){
    if(window.CyberProfessionalNavigation && typeof window.CyberProfessionalNavigation.scrollTo === 'function'){
      window.CyberProfessionalNavigation.scrollTo(id);
      window.CyberProfessionalNavigation.setActive(id);
      return;
    }
    var target=document.getElementById(id);
    if(target){
      target.scrollIntoView({behavior:'smooth',block:'start'});
    }
  }

  function matchAny(text, words){
    for(var i=0;i<words.length;i++){
      if(text.indexOf(words[i]) !== -1) return true;
    }
    return false;
  }

  function escapeHtml(text){
    return text
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;')
      .replace(/\n/g,'<br>');
  }

  function autoResize(){
    if(!inputEl) return;
    inputEl.style.height='auto';
    inputEl.style.height=Math.min(inputEl.scrollHeight, 140)+'px';
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', build);
  }else{
    build();
  }
})();
