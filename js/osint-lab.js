/* CYBER LAB - OSINT WORKSPACE v1.5 */
(function(){
  var host=null;
  var selected="dns";
  var verified={};
  var linked={};
  var hypothesis=false;

  var sources={
    dns:{
      name:"DNS SNAPSHOT",
      type:"DNS",
      meta:"Synthetic DNS snapshot for lab.example showing documentation-only infrastructure."
    },
    registry:{
      name:"REGISTRATION DATA",
      type:"REGISTRY",
      meta:"Synthetic registration record used to practice source validation and attribution discipline."
    },
    archive:{
      name:"WEB ARCHIVE",
      type:"ARCHIVE",
      meta:"Simulated historical page snapshot showing how public content can change over time."
    },
    profile:{
      name:"PUBLIC PROFILE",
      type:"PUBLIC",
      meta:"Synthetic public profile used only to demonstrate cross-source consistency checks."
    }
  };

  function layout(){
    return '<div class="oslab">'+
      '<div class="oslab-top"><span>OPEN SOURCE INTELLIGENCE // TRAINING</span><strong id="os-status">CASE OS-17</strong></div>'+
      '<div class="os-stage">'+
        '<div class="os-orbit"></div>'+
        '<svg class="os-links" viewBox="0 0 100 100" preserveAspectRatio="none">'+
          '<line class="os-link" x1="50" y1="50" x2="50" y2="17"></line>'+
          '<line class="os-link" x1="50" y1="50" x2="20" y2="52"></line>'+
          '<line class="os-link" x1="50" y1="50" x2="80" y2="52"></line>'+
          '<line class="os-link" x1="50" y1="50" x2="50" y2="84"></line>'+
        '</svg>'+
        '<div class="os-core"><b>LAB.EXAMPLE</b><span>SYNTHETIC CASE ENTITY</span></div>'+
        '<button class="os-source s1" data-ossource="dns"><b>DNS SNAPSHOT</b><span>NETWORK SOURCE</span></button>'+
        '<button class="os-source s2" data-ossource="registry"><b>REGISTRATION DATA</b><span>REGISTRY SOURCE</span></button>'+
        '<button class="os-source s3" data-ossource="archive"><b>WEB ARCHIVE</b><span>HISTORICAL SOURCE</span></button>'+
        '<button class="os-source s4" data-ossource="profile"><b>PUBLIC PROFILE</b><span>PUBLIC SOURCE</span></button>'+
      '</div>'+
      '<div class="os-stats">'+
        '<div class="os-stat"><small>CONFIDENCE</small><b id="os-confidence">34%</b></div>'+
        '<div class="os-stat"><small>VERIFIED</small><b id="os-verified">00</b></div>'+
        '<div class="os-stat"><small>RELATIONS</small><b id="os-linked">00</b></div>'+
      '</div>'+
      '<div class="os-detail">'+
        '<div class="os-detail-head"><div><small>SELECTED SOURCE</small><h4 id="os-name"></h4></div><span class="os-badge" id="os-badge"></span></div>'+
        '<div class="os-meta" id="os-meta"></div>'+
        '<div class="os-actions">'+
          '<button class="os-action" data-osaction="verify">VERIFY SOURCE</button>'+
          '<button class="os-action" data-osaction="link">LINK ENTITY</button>'+
          '<button class="os-action warn" data-osaction="hypothesis">BUILD HYPOTHESIS</button>'+
        '</div>'+
      '</div>'+
      '<div class="os-events" id="os-events"><div class="os-event">OSINT workspace initialized // synthetic training data only.</div></div>'+
    '</div>';
  }

  function addEvent(message,type){
    if(!host) return;
    var box=host.querySelector("#os-events");
    if(!box) return;
    var row=document.createElement("div");
    row.className="os-event"+(type?" "+type:"");
    row.textContent=message;
    box.insertBefore(row,box.firstChild);
    while(box.children.length>6){
      box.removeChild(box.lastElementChild);
    }
  }

  function count(obj){
    return Object.keys(obj).filter(function(k){return obj[k];}).length;
  }

  function confidence(){
    var value=34+(count(verified)*12)+(count(linked)*8)+(hypothesis?10:0);
    return Math.min(94,value);
  }

  function refreshStats(){
    if(!host) return;
    host.querySelector("#os-confidence").textContent=confidence()+"%";
    host.querySelector("#os-verified").textContent=String(count(verified)).padStart(2,"0");
    host.querySelector("#os-linked").textContent=String(count(linked)).padStart(2,"0");
    host.querySelector("#os-status").textContent=hypothesis?"HYPOTHESIS READY":"CASE OS-17";

    var buttons=host.querySelectorAll(".os-source");
    for(var i=0;i<buttons.length;i++){
      var id=buttons[i].getAttribute("data-ossource");
      buttons[i].classList.toggle("verified",!!verified[id]);
      buttons[i].classList.toggle("linked",!!linked[id]);
      buttons[i].classList.toggle("active",id===selected);
    }
  }

  function selectSource(id){
    if(!host || !sources[id]) return;
    selected=id;
    var source=sources[id];
    host.querySelector("#os-name").textContent=source.name;
    host.querySelector("#os-badge").textContent=source.type;
    host.querySelector("#os-meta").textContent=source.meta;
    refreshStats();
    addEvent(source.name+" selected // source context synchronized.");
  }

  function verify(){
    if(verified[selected]){
      addEvent(sources[selected].name+" already verified // no duplicate confidence added.");
      return;
    }
    verified[selected]=true;
    refreshStats();
    addEvent(sources[selected].name+" verified // consistency checks passed in simulation.","good");
  }

  function linkEntity(){
    if(!verified[selected]){
      addEvent("Verify "+sources[selected].name+" before linking it to the case.","warn");
      return;
    }
    if(linked[selected]){
      addEvent(sources[selected].name+" already linked to LAB.EXAMPLE.");
      return;
    }
    linked[selected]=true;
    refreshStats();
    addEvent(sources[selected].name+" linked to LAB.EXAMPLE // relation added.","good");
  }

  function buildHypothesis(){
    if(count(verified)<2 || count(linked)<2){
      addEvent("Hypothesis blocked // verify and link at least two independent sources first.","warn");
      return;
    }
    hypothesis=true;
    refreshStats();
    addEvent("Hypothesis built // independent sources support a consistent synthetic relationship.","good");
  }

  function handleClick(e){
    var source=e.target.closest("[data-ossource]");
    if(source){
      selectSource(source.getAttribute("data-ossource"));
      return;
    }
    var action=e.target.closest("[data-osaction]");
    if(!action) return;
    var type=action.getAttribute("data-osaction");
    if(type==="verify") verify();
    if(type==="link") linkEntity();
    if(type==="hypothesis") buildHypothesis();
  }

  function unmount(){
    if(host){
      host.removeEventListener("click",handleClick);
    }
    host=null;
  }

  function mount(container){
    unmount();
    host=container;
    selected="dns";
    verified={};
    linked={};
    hypothesis=false;
    host.innerHTML=layout();
    host.addEventListener("click",handleClick);
    selectSource("dns");
  }

  window.CyberOsintLab={
    mount:mount,
    unmount:unmount
  };
})();