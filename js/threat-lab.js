/* CYBER LAB - THREAT INTELLIGENCE LAB v1.4 */
(function(){
  var host=null;
  var selected="campaign";
  var expanded=false;
  var correlated=false;
  var analyzed=false;

  var nodes={
    campaign:{name:"CTI-ALPHA",type:"CAMPAIGN",meta:"Simulated campaign cluster used to demonstrate defensive threat-intelligence correlation."},
    domain:{name:"portal-sync.example",type:"DOMAIN",meta:"Training domain indicator associated with the simulated lure infrastructure."},
    ip:{name:"198.51.100.42",type:"IP",meta:"Documentation-range address used only as a safe training indicator."},
    identity:{name:"ID-PRIV-07",type:"IDENTITY",meta:"Simulated privileged identity linked to suspicious authentication activity."},
    endpoint:{name:"ENDPOINT-23",type:"ASSET",meta:"Training endpoint associated with the incident evidence set."},
    hash:{name:"SHA256:DEMO-9F2A",type:"HASH",meta:"Synthetic file-hash indicator for educational correlation only."},
    lure:{name:"AUTH-RESET",type:"LURE",meta:"Simulated credential-themed lure used in the defensive scenario."}
  };

  function layout(){
    return '<div class="threatlab">'+
      '<div class="threat-top"><span>THREAT INTELLIGENCE // SIMULATION</span><strong id="threat-status">ANALYSIS READY</strong></div>'+
      '<div class="threat-stage">'+
        '<div class="threat-orbit"></div>'+
        '<svg class="threat-svg" viewBox="0 0 100 100" preserveAspectRatio="none">'+
          '<line class="threat-edge hot" x1="50" y1="50" x2="50" y2="15"></line>'+
          '<line class="threat-edge" x1="50" y1="50" x2="82" y2="34"></line>'+
          '<line class="threat-edge" x1="50" y1="50" x2="80" y2="72"></line>'+
          '<line class="threat-edge" x1="50" y1="50" x2="50" y2="86"></line>'+
          '<line class="threat-edge" x1="50" y1="50" x2="18" y2="72"></line>'+
          '<line class="threat-edge hot" x1="50" y1="50" x2="18" y2="34"></line>'+
        '</svg>'+
        '<button class="threat-node campaign active" data-threatnode="campaign"><b>CTI-ALPHA</b><span>CAMPAIGN</span></button>'+
        '<button class="threat-node domain risk" data-threatnode="domain"><b>DOMAIN</b><span>INFRASTRUCTURE</span></button>'+
        '<button class="threat-node ip" data-threatnode="ip"><b>IP NODE</b><span>NETWORK IOC</span></button>'+
        '<button class="threat-node identity" data-threatnode="identity"><b>IDENTITY</b><span>ACCESS SIGNAL</span></button>'+
        '<button class="threat-node endpoint" data-threatnode="endpoint"><b>ENDPOINT</b><span>ASSET</span></button>'+
        '<button class="threat-node hash" data-threatnode="hash"><b>HASH</b><span>FILE IOC</span></button>'+
        '<button class="threat-node lure risk" data-threatnode="lure"><b>LURE</b><span>SOCIAL SIGNAL</span></button>'+
      '</div>'+
      '<div class="threat-stats">'+
        '<div class="threat-stat"><small>CONFIDENCE</small><b id="threat-confidence">62%</b></div>'+
        '<div class="threat-stat"><small>INDICATORS</small><b id="threat-indicators">06</b></div>'+
        '<div class="threat-stat"><small>RELATIONS</small><b id="threat-relations">06</b></div>'+
      '</div>'+
      '<div class="threat-detail">'+
        '<div class="threat-detail-head"><div><small>SELECTED INTELLIGENCE OBJECT</small><h4 id="threat-name"></h4></div><span class="threat-badge" id="threat-badge"></span></div>'+
        '<div class="threat-meta" id="threat-meta"></div>'+
        '<div class="threat-controls">'+
          '<button class="threat-action" data-threataction="correlate">CORRELATE IOC</button>'+
          '<button class="threat-action" data-threataction="expand">EXPAND RELATIONS</button>'+
          '<button class="threat-action alert" data-threataction="analyze">ANALYZE PATH</button>'+
        '</div>'+
      '</div>'+
      '<div class="threat-events" id="threat-events"><div class="threat-event">Threat intelligence workspace initialized.</div></div>'+
    '</div>';
  }

  function addEvent(message,hot){
    if(!host)return;
    var box=host.querySelector("#threat-events");
    if(!box)return;
    var row=document.createElement("div");
    row.className="threat-event"+(hot?" hot":"");
    row.textContent=message;
    box.insertBefore(row,box.firstChild);
    while(box.children.length>5){box.removeChild(box.lastElementChild);}
  }

  function selectNode(id){
    if(!host || !nodes[id])return;
    selected=id;
    var buttons=host.querySelectorAll(".threat-node");
    for(var i=0;i<buttons.length;i++){
      buttons[i].classList.toggle("active",buttons[i].getAttribute("data-threatnode")===id);
    }
    var node=nodes[id];
    host.querySelector("#threat-name").textContent=node.name;
    host.querySelector("#threat-badge").textContent=node.type;
    host.querySelector("#threat-meta").textContent=node.meta;
    addEvent(node.name+" selected // intelligence object synchronized.",id==="domain"||id==="lure");
  }

  function refresh(){
    if(!host)return;
    host.querySelector("#threat-confidence").textContent=(correlated?84:62)+"%";
    host.querySelector("#threat-indicators").textContent=expanded?"09":"06";
    host.querySelector("#threat-relations").textContent=expanded?"11":"06";
    host.querySelector("#threat-status").textContent=analyzed?"PATH ANALYZED":correlated?"CORRELATED":"ANALYSIS READY";
  }

  function action(type){
    if(type==="correlate"){
      correlated=true;
      addEvent("IOC correlation complete // domain, network, identity and asset signals linked.",false);
    }
    if(type==="expand"){
      expanded=true;
      addEvent("Relation expansion complete // additional simulated pivots added.",false);
    }
    if(type==="analyze"){
      analyzed=true;
      addEvent("Defensive path analysis complete // likely sequence mapped for training.",true);
    }
    refresh();
  }

  function handleClick(e){
    var node=e.target.closest("[data-threatnode]");
    if(node){
      selectNode(node.getAttribute("data-threatnode"));
      return;
    }
    var button=e.target.closest("[data-threataction]");
    if(button){
      action(button.getAttribute("data-threataction"));
    }
  }

  function unmount(){
    if(host){host.removeEventListener("click",handleClick);}
    host=null;
  }

  function mount(container){
    unmount();
    host=container;
    host.innerHTML=layout();
    host.addEventListener("click",handleClick);
    correlated=false;
    expanded=false;
    analyzed=false;
    selectNode("campaign");
    refresh();
  }

  window.CyberThreatLab={mount:mount,unmount:unmount};
})();
