/* CYBER LAB - NETWORK LAB v1.2 */
(function(){
  var host=null;
  var timer=null;
  var tick=0;
  var selected="firewall";
  var state={
    web:true,
    ssh:false,
    dmzIsolated:false,
    allowed:1842,
    blocked:76,
    latency:24
  };

  var nodes={
    internet:{name:"INTERNET",role:"PUBLIC EDGE",badge:"WAN",meta:"External traffic ingress // simulated public network"},
    firewall:{name:"FIREWALL-01",role:"POLICY ENFORCEMENT",badge:"NGFW",meta:"Inspection, routing and access policy control"},
    dmz:{name:"DMZ-SEG",role:"PUBLIC SERVICES",badge:"DMZ",meta:"Isolated web-facing services segment"},
    lan:{name:"LAN-CORE",role:"TRUSTED NETWORK",badge:"LAN",meta:"Internal systems and administrative services"},
    cloud:{name:"CLOUD-IAM",role:"IDENTITY PLANE",badge:"CLOUD",meta:"Cloud identity and policy synchronization"}
  };

  function layout(){
    return '<div class="netlab">'+
      '<div class="netlab-top"><span>NETWORK OPERATIONS // SIMULATION</span><strong id="net-status">POLICY ACTIVE</strong></div>'+
      '<div class="net-stage" id="net-stage">'+
        '<div class="net-grid-ring"></div>'+
        '<svg class="net-svg" viewBox="0 0 100 100" preserveAspectRatio="none">'+
          '<path id="route-wan" class="net-route" d="M50 14 L50 42"></path>'+
          '<path id="route-dmz" class="net-route" d="M50 42 L20 75"></path>'+
          '<path id="route-lan" class="net-route" d="M50 42 L50 79"></path>'+
          '<path id="route-cloud" class="net-route" d="M50 42 L80 75"></path>'+
          '<circle class="net-packet" r="1.1">'+
            '<animateMotion dur="2.2s" repeatCount="indefinite" path="M50 14 L50 42 L20 75"></animateMotion>'+
          '</circle>'+
          '<circle class="net-packet" r="1.1">'+
            '<animateMotion dur="2.8s" begin=".7s" repeatCount="indefinite" path="M50 14 L50 42 L50 79"></animateMotion>'+
          '</circle>'+
          '<circle class="net-packet" r="1.1">'+
            '<animateMotion dur="3s" begin="1.2s" repeatCount="indefinite" path="M50 14 L50 42 L80 75"></animateMotion>'+
          '</circle>'+
        '</svg>'+
        '<button class="net-node internet" data-netnode="internet"><b>INTERNET</b><span>PUBLIC EDGE</span></button>'+
        '<button class="net-node firewall" data-netnode="firewall"><b>FIREWALL-01</b><span>POLICY CORE</span></button>'+
        '<button class="net-node dmz" data-netnode="dmz"><b>DMZ-SEG</b><span>PUBLIC APPS</span></button>'+
        '<button class="net-node lan" data-netnode="lan"><b>LAN-CORE</b><span>TRUSTED</span></button>'+
        '<button class="net-node cloud" data-netnode="cloud"><b>CLOUD-IAM</b><span>IDENTITY</span></button>'+
      '</div>'+
      '<div class="net-state">'+
        '<div class="net-stat"><small>ALLOWED FLOW</small><b id="net-allowed">0</b></div>'+
        '<div class="net-stat"><small>BLOCKED FLOW</small><b id="net-blocked">0</b></div>'+
        '<div class="net-stat"><small>LATENCY</small><b id="net-latency">0 ms</b></div>'+
      '</div>'+
      '<div class="net-detail">'+
        '<div class="net-detail-head"><div><small>SELECTED NETWORK OBJECT</small><h4 id="net-name"></h4></div><span class="net-badge" id="net-badge"></span></div>'+
        '<div class="net-meta" id="net-meta"></div>'+
        '<div class="net-controls">'+
          '<button class="net-action" data-netaction="allow-web">ALLOW WEB</button>'+
          '<button class="net-action alert" data-netaction="block-ssh">BLOCK SSH</button>'+
          '<button class="net-action warn" data-netaction="isolate-dmz">ISOLATE DMZ</button>'+
        '</div>'+
      '</div>'+
      '<div class="net-events" id="net-events"><div class="net-event">Network policy engine initialized.</div></div>'+
    '</div>';
  }

  function addEvent(message,type){
    if(!host) return;
    var box=host.querySelector("#net-events");
    if(!box) return;
    var row=document.createElement("div");
    row.className="net-event"+(type?" "+type:"");
    row.textContent=message;
    box.insertBefore(row,box.firstChild);
    while(box.children.length>5){
      box.removeChild(box.lastElementChild);
    }
  }

  function selectNode(id){
    if(!host || !nodes[id]) return;
    selected=id;
    var buttons=host.querySelectorAll(".net-node");
    for(var i=0;i<buttons.length;i++){
      buttons[i].classList.toggle("active",buttons[i].getAttribute("data-netnode")===id);
    }
    var node=nodes[id];
    host.querySelector("#net-name").textContent=node.name;
    host.querySelector("#net-badge").textContent=node.badge;
    host.querySelector("#net-meta").textContent=node.role+" // "+node.meta;
    addEvent(node.name+" selected // telemetry channel synchronized.");
  }

  function refreshRoutes(){
    if(!host) return;
    var dmz=host.querySelector("#route-dmz");
    var lan=host.querySelector("#route-lan");
    if(dmz){
      dmz.classList.toggle("isolated",state.dmzIsolated);
    }
    if(lan){
      lan.classList.toggle("blocked",state.ssh);
    }
    var status=host.querySelector("#net-status");
    if(status){
      status.textContent=state.dmzIsolated?"DMZ CONTAINED":"POLICY ACTIVE";
    }
  }

  function refreshStats(){
    if(!host) return;
    tick++;
    var wave=Math.round((Math.sin(tick*.55)+1)*5);
    state.allowed+=state.web?4+wave:1;
    state.blocked+=state.ssh?2:0;
    state.latency=22+Math.round((Math.sin(tick*.38)+1)*4)+(state.dmzIsolated?5:0);
    host.querySelector("#net-allowed").textContent=state.allowed;
    host.querySelector("#net-blocked").textContent=state.blocked;
    host.querySelector("#net-latency").textContent=state.latency+" ms";
  }

  function action(type){
    if(type==="allow-web"){
      state.web=true;
      addEvent("HTTP/HTTPS policy validated // web flow allowed.");
    }
    if(type==="block-ssh"){
      state.ssh=!state.ssh;
      addEvent(state.ssh?"SSH policy changed // simulated remote access blocked.":"SSH policy restored // simulated remote access allowed.",state.ssh?"deny":"");
    }
    if(type==="isolate-dmz"){
      state.dmzIsolated=!state.dmzIsolated;
      addEvent(state.dmzIsolated?"DMZ containment enabled // lateral path restricted.":"DMZ containment released // standard routing restored.",state.dmzIsolated?"warn":"");
    }
    refreshRoutes();
    refreshStats();
  }

  function handleClick(e){
    var node=e.target.closest("[data-netnode]");
    if(node){
      selectNode(node.getAttribute("data-netnode"));
      return;
    }
    var button=e.target.closest("[data-netaction]");
    if(button){
      action(button.getAttribute("data-netaction"));
    }
  }

  function unmount(){
    if(timer){
      clearInterval(timer);
      timer=null;
    }
    if(host){
      host.removeEventListener("click",handleClick);
    }
    host=null;
  }

  function mount(container){
    unmount();
    host=container;
    host.innerHTML=layout();
    host.addEventListener("click",handleClick);
    selectNode("firewall");
    refreshRoutes();
    refreshStats();
    timer=setInterval(refreshStats,1200);
  }

  window.CyberNetworkLab={
    mount:mount,
    unmount:unmount
  };
})();