/* CYBER LAB - SYSTEMS LAB v1.1 */
(function(){
  var timer=null;
  var host=null;
  var selected="core";
  var tick=0;

  var nodes={
    gateway:{
      name:"GATEWAY-01",
      role:"EDGE SECURITY GATEWAY",
      os:"LINUX // EDGE",
      services:["FIREWALL","DNS","VPN","PROXY"],
      base:[28,42,18]
    },
    core:{
      name:"CORE-02",
      role:"SYSTEMS CONTROL NODE",
      os:"LINUX // CORE",
      services:["SSH","AUDITD","SYSLOG","SCHEDULER"],
      base:[36,51,24]
    },
    vault:{
      name:"VAULT-03",
      role:"IDENTITY & SECRETS",
      os:"SECURE IAM",
      services:["IAM","MFA","KEYSTORE","POLICY"],
      base:[19,34,12]
    }
  };

  function nodeButtons(){
    return '<button class="sys-node n1" data-sysnode="gateway"><b>GATEWAY-01</b><span>EDGE SECURITY</span></button>'+
           '<button class="sys-node n2" data-sysnode="core"><b>CORE-02</b><span>SYSTEMS CORE</span></button>'+
           '<button class="sys-node n3" data-sysnode="vault"><b>VAULT-03</b><span>IDENTITY</span></button>';
  }

  function layout(){
    return '<div class="syslab">'+
      '<div class="syslab-top"><span>SYSTEM TOPOLOGY // SIMULATION</span><strong>03 NODES ONLINE</strong></div>'+
      '<div class="syslab-stage">'+
        '<div class="syslab-radar"></div>'+
        '<svg class="syslab-links" viewBox="0 0 100 100" preserveAspectRatio="none">'+
          '<line class="syslab-link" x1="50" y1="26" x2="25" y2="70"></line>'+
          '<line class="syslab-link" x1="50" y1="26" x2="75" y2="70"></line>'+
          '<line class="syslab-link" x1="25" y1="70" x2="75" y2="70"></line>'+
        '</svg>'+
        nodeButtons()+
      '</div>'+
      '<div class="syslab-detail">'+
        '<div class="syslab-detail-head">'+
          '<div><small>SELECTED SYSTEM</small><h4 id="sys-name"></h4></div>'+
          '<span class="syslab-os" id="sys-os"></span>'+
        '</div>'+
        '<small id="sys-role"></small>'+
        '<div class="sys-metrics">'+
          '<div class="sys-meter"><div class="sys-meter-head"><span>CPU</span><b id="sys-cpu-value">0%</b></div><div class="sys-track"><div class="sys-fill" id="sys-cpu"></div></div></div>'+
          '<div class="sys-meter"><div class="sys-meter-head"><span>MEMORY</span><b id="sys-ram-value">0%</b></div><div class="sys-track"><div class="sys-fill" id="sys-ram"></div></div></div>'+
          '<div class="sys-meter"><div class="sys-meter-head"><span>I/O</span><b id="sys-io-value">0%</b></div><div class="sys-track"><div class="sys-fill" id="sys-io"></div></div></div>'+
        '</div>'+
        '<div class="sys-services" id="sys-services"></div>'+
        '<div class="sys-actions">'+
          '<button class="sys-action" data-sysaction="health">RUN HEALTH CHECK</button>'+
          '<button class="sys-action" data-sysaction="harden">HARDEN ACCESS</button>'+
        '</div>'+
      '</div>'+
      '<div class="sys-events" id="sys-events"><div class="sys-event">Systems matrix initialized.</div></div>'+
    '</div>';
  }

  function addEvent(message){
    if(!host) return;
    var box=host.querySelector("#sys-events");
    if(!box) return;
    var row=document.createElement("div");
    row.className="sys-event";
    row.textContent=message;
    box.insertBefore(row,box.firstChild);
    while(box.children.length>4){
      box.removeChild(box.lastElementChild);
    }
  }

  function setMeter(name,value){
    if(!host) return;
    var bar=host.querySelector("#sys-"+name);
    var label=host.querySelector("#sys-"+name+"-value");
    if(bar) bar.style.width=value+"%";
    if(label) label.textContent=value+"%";
  }

  function telemetry(base,index){
    var wave=Math.sin((tick+index*2.4)*0.42)*7;
    var micro=Math.sin((tick+index)*1.15)*3;
    return Math.max(4,Math.min(92,Math.round(base+wave+micro)));
  }

  function updateMetrics(immediate){
    if(!host) return;
    var node=nodes[selected];
    if(!node) return;
    if(!immediate) tick++;
    setMeter("cpu",telemetry(node.base[0],0));
    setMeter("ram",telemetry(node.base[1],1));
    setMeter("io",telemetry(node.base[2],2));
  }

  function selectNode(id){
    selected=id;
    if(!host || !nodes[id]) return;
    var node=nodes[id];
    var buttons=host.querySelectorAll(".sys-node");
    for(var i=0;i<buttons.length;i++){
      buttons[i].classList.toggle("active",buttons[i].getAttribute("data-sysnode")===id);
    }
    host.querySelector("#sys-name").textContent=node.name;
    host.querySelector("#sys-role").textContent=node.role;
    host.querySelector("#sys-os").textContent=node.os;

    var serviceHTML="";
    for(var s=0;s<node.services.length;s++){
      serviceHTML+='<span class="sys-service">'+node.services[s]+'</span>';
    }
    host.querySelector("#sys-services").innerHTML=serviceHTML;
    updateMetrics(true);
    addEvent(node.name+" selected // telemetry synchronized.");
  }

  function action(type){
    var node=nodes[selected];
    if(!node) return;
    if(type==="health"){
      addEvent(node.name+" health check // services responsive // status nominal.");
    }
    if(type==="harden"){
      addEvent(node.name+" access policy simulation // MFA + least privilege validated.");
    }
  }

  function handleClick(e){
    var nodeButton=e.target.closest("[data-sysnode]");
    if(nodeButton){
      selectNode(nodeButton.getAttribute("data-sysnode"));
      return;
    }
    var actionButton=e.target.closest("[data-sysaction]");
    if(actionButton){
      action(actionButton.getAttribute("data-sysaction"));
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
    selectNode("core");
    timer=setInterval(function(){ updateMetrics(false); },1100);
  }

  window.CyberSystemsLab={
    mount:mount,
    unmount:unmount
  };
})();