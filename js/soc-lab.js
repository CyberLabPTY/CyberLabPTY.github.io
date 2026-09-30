/* CYBER LAB - SOC LAB v1.3 */
(function(){
  var host=null;
  var timer=null;
  var seconds=0;
  var phase=0;

  var phases=[
    {name:"DETECT",label:"Detection"},
    {name:"TRIAGE",label:"Triage"},
    {name:"CORRELATE",label:"Correlation"},
    {name:"CONTAIN",label:"Containment"},
    {name:"RECOVER",label:"Recovery"}
  ];

  function layout(){
    return '<div class="soclab" id="soclab">'+
      '<div class="soc-top"><span>SOC / BLUE TEAM // INCIDENT SIMULATION</span><strong id="soc-status">ACTIVE INCIDENT</strong></div>'+
      '<div class="soc-stage">'+
        '<div class="soc-radar"></div>'+
        '<div class="soc-sweep"></div>'+
        '<div class="soc-core"><b id="soc-core-title">INC-042</b><span id="soc-core-sub">MULTI-SIGNAL ALERT</span></div>'+
        '<i class="soc-signal s1"></i><i class="soc-signal s2"></i><i class="soc-signal s3"></i><i class="soc-signal s4"></i>'+
      '</div>'+
      '<div class="soc-progress" id="soc-progress"></div>'+
      '<div class="soc-panel">'+
        '<div class="soc-head"><div><small>ACTIVE CASE</small><h4 id="soc-title">Suspicious authentication cluster</h4></div><span class="soc-severity" id="soc-severity">HIGH</span></div>'+
        '<div class="soc-meta" id="soc-meta">Multiple failed sign-ins followed by a successful privileged login in the training environment.</div>'+
        '<div class="soc-kpis">'+
          '<div class="soc-kpi"><small>RISK SCORE</small><b id="soc-risk">82</b></div>'+
          '<div class="soc-kpi"><small>SIGNALS</small><b id="soc-signals">04</b></div>'+
          '<div class="soc-kpi"><small>ELAPSED</small><b id="soc-time">00:00</b></div>'+
        '</div>'+
        '<div class="soc-actions">'+
          '<button class="soc-action primary" id="soc-primary" data-socaction="advance">BEGIN TRIAGE</button>'+
          '<button class="soc-action" data-socaction="inspect">INSPECT SIGNALS</button>'+
        '</div>'+
      '</div>'+
      '<div class="soc-timeline" id="soc-timeline"><div class="soc-event alert">Detection engine created case INC-042.</div></div>'+
    '</div>';
  }

  function renderProgress(){
    if(!host) return;
    var box=host.querySelector("#soc-progress");
    if(!box) return;
    var html="";
    for(var i=0;i<phases.length;i++){
      var cls="soc-step";
      if(i<phase) cls+=" done";
      if(i===phase) cls+=" active";
      html+='<div class="'+cls+'"><b>'+phases[i].name+'</b><span>'+phases[i].label+'</span></div>';
    }
    box.innerHTML=html;
  }

  function addEvent(message,type){
    if(!host) return;
    var box=host.querySelector("#soc-timeline");
    if(!box) return;
    var row=document.createElement("div");
    row.className="soc-event"+(type?" "+type:"");
    row.textContent=message;
    box.insertBefore(row,box.firstChild);
    while(box.children.length>6){
      box.removeChild(box.lastElementChild);
    }
  }

  function setText(id,value){
    if(!host) return;
    var el=host.querySelector(id);
    if(el) el.textContent=value;
  }

  function updateUI(){
    if(!host) return;
    renderProgress();

    var button=host.querySelector("#soc-primary");
    var lab=host.querySelector("#soclab");

    if(phase===0){
      setText("#soc-status","ACTIVE INCIDENT");
      setText("#soc-severity","HIGH");
      setText("#soc-risk","82");
      setText("#soc-title","Suspicious authentication cluster");
      setText("#soc-meta","Multiple failed sign-ins followed by a successful privileged login in the training environment.");
      button.textContent="BEGIN TRIAGE";
    }
    if(phase===1){
      setText("#soc-status","TRIAGE IN PROGRESS");
      setText("#soc-severity","HIGH");
      setText("#soc-risk","76");
      setText("#soc-title","Authentication anomaly under review");
      setText("#soc-meta","Analyst review confirms a privileged session requires deeper correlation.");
      button.textContent="CORRELATE EVENTS";
    }
    if(phase===2){
      setText("#soc-status","CORRELATING");
      setText("#soc-severity","MED-HIGH");
      setText("#soc-risk","69");
      setText("#soc-title","Identity + endpoint signals correlated");
      setText("#soc-meta","The training case now links identity events, endpoint telemetry and network activity.");
      button.textContent="CONTAIN INCIDENT";
    }
    if(phase===3){
      setText("#soc-status","CONTAINMENT ACTIVE");
      setText("#soc-severity","MEDIUM");
      setText("#soc-risk","41");
      setText("#soc-title","Affected identity isolated");
      setText("#soc-meta","Containment simulation restricts the affected account and session while evidence remains available.");
      button.textContent="BEGIN RECOVERY";
    }
    if(phase===4){
      setText("#soc-status","INCIDENT RESOLVED");
      setText("#soc-severity","RESOLVED");
      setText("#soc-risk","08");
      setText("#soc-title","Case stabilized and recovered");
      setText("#soc-meta","Recovery simulation completed. Controls validated and case prepared for post-incident review.");
      button.textContent="RESET INCIDENT";
      if(lab) lab.classList.add("soc-resolved");
    }else{
      if(lab) lab.classList.remove("soc-resolved");
    }
  }

  function advance(){
    if(phase<4){
      phase++;
      if(phase===1) addEvent("Triage started // analyst validating identity and endpoint context.","warn");
      if(phase===2) addEvent("Signals correlated // identity, endpoint and network evidence linked.","warn");
      if(phase===3) addEvent("Containment executed // affected identity and active session restricted.","alert");
      if(phase===4) addEvent("Recovery completed // controls validated // case resolved.");
    }else{
      phase=0;
      seconds=0;
      addEvent("Case reset // new training cycle initialized.","alert");
    }
    updateUI();
  }

  function inspect(){
    if(phase===0) addEvent("Signal set: failed logins + privileged success + endpoint change + outbound session.","warn");
    if(phase===1) addEvent("Triage note: privileged session confirmed in simulated environment.","warn");
    if(phase===2) addEvent("Correlation graph: 4 signals linked to 2 assets and 1 identity.");
    if(phase===3) addEvent("Containment note: account restricted and session token invalidated in simulation.");
    if(phase===4) addEvent("Post-incident review ready // no active critical signal remains.");
  }

  function handleClick(e){
    var button=e.target.closest("[data-socaction]");
    if(!button) return;
    var action=button.getAttribute("data-socaction");
    if(action==="advance") advance();
    if(action==="inspect") inspect();
  }

  function tick(){
    seconds++;
    var mins=Math.floor(seconds/60);
    var secs=seconds%60;
    setText("#soc-time",(mins<10?"0":"")+mins+":"+(secs<10?"0":"")+secs);
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
    phase=0;
    seconds=0;
    host.innerHTML=layout();
    host.addEventListener("click",handleClick);
    updateUI();
    timer=setInterval(tick,1000);
  }

  window.CyberSocLab={
    mount:mount,
    unmount:unmount
  };
})();