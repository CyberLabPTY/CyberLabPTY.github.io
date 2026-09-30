/* CYBER LAB - CLOUD & IDENTITY LAB v1.6 */
(function(){
  var host=null;
  var selected="admin";
  var sessionRevoked=false;
  var leastPrivilege=false;

  var identities={
    admin:{
      name:"ADMIN-OPS",
      role:"PRIVILEGED ADMIN",
      badge:"PAM",
      mfa:true,
      risk:42,
      meta:"Privileged operations identity used to demonstrate MFA, role control and session governance."
    },
    analyst:{
      name:"SOC-ANALYST",
      role:"SECURITY ANALYST",
      badge:"RBAC",
      mfa:true,
      risk:21,
      meta:"Defensive analyst identity with scoped access to monitoring, triage and investigation services."
    },
    service:{
      name:"APP-SERVICE",
      role:"WORKLOAD IDENTITY",
      badge:"TOKEN",
      mfa:false,
      risk:36,
      meta:"Synthetic workload identity used to demonstrate token scope, non-human accounts and policy boundaries."
    },
    guest:{
      name:"GUEST-EXT",
      role:"EXTERNAL USER",
      badge:"B2B",
      mfa:false,
      risk:58,
      meta:"External collaboration identity with intentionally limited permissions and higher verification requirements."
    }
  };

  function layout(){
    return '<div class="cloudlab">'+
      '<div class="cloudlab-top"><span>CLOUD & IDENTITY // ZERO TRUST TRAINING</span><strong id="cloud-status">POLICY ENGINE READY</strong></div>'+
      '<div class="cloud-stage">'+
        '<div class="cloud-orbit"></div>'+
        '<svg class="cloud-links" viewBox="0 0 100 100" preserveAspectRatio="none">'+
          '<line class="cloud-link" x1="50" y1="50" x2="50" y2="17"></line>'+
          '<line class="cloud-link" x1="50" y1="50" x2="18" y2="55"></line>'+
          '<line class="cloud-link" x1="50" y1="50" x2="82" y2="55"></line>'+
          '<line class="cloud-link" x1="50" y1="50" x2="50" y2="86"></line>'+
        '</svg>'+
        '<div class="cloud-core"><b>IDENTITY CONTROL PLANE</b><span>IAM // POLICY // SESSION</span></div>'+
        '<button class="cloud-id i1 mfa" data-cloudid="admin"><b>ADMIN-OPS</b><span>PRIVILEGED</span></button>'+
        '<button class="cloud-id i2 mfa" data-cloudid="analyst"><b>SOC-ANALYST</b><span>SECURITY TEAM</span></button>'+
        '<button class="cloud-id i3" data-cloudid="service"><b>APP-SERVICE</b><span>WORKLOAD</span></button>'+
        '<button class="cloud-id i4" data-cloudid="guest"><b>GUEST-EXT</b><span>EXTERNAL</span></button>'+
      '</div>'+
      '<div class="cloud-stats">'+
        '<div class="cloud-stat"><small>MFA COVERAGE</small><b id="cloud-mfa">50%</b></div>'+
        '<div class="cloud-stat"><small>ACTIVE SESSIONS</small><b id="cloud-sessions">04</b></div>'+
        '<div class="cloud-stat"><small>POLICY STATE</small><b id="cloud-policy">BASELINE</b></div>'+
      '</div>'+
      '<div class="cloud-detail">'+
        '<div class="cloud-detail-head"><div><small>SELECTED IDENTITY</small><h4 id="cloud-name"></h4></div><span class="cloud-badge" id="cloud-badge"></span></div>'+
        '<div class="cloud-meta" id="cloud-meta"></div>'+
        '<div class="cloud-flags" id="cloud-flags"></div>'+
        '<div class="cloud-actions">'+
          '<button class="cloud-action" data-cloudaction="evaluate">EVALUATE ACCESS</button>'+
          '<button class="cloud-action warn" data-cloudaction="least">APPLY LEAST PRIVILEGE</button>'+
          '<button class="cloud-action warn" data-cloudaction="revoke">REVOKE SESSION</button>'+
        '</div>'+
      '</div>'+
      '<div class="cloud-events" id="cloud-events"><div class="cloud-event">Identity control plane initialized // synthetic training data only.</div></div>'+
    '</div>';
  }

  function addEvent(message,type){
    if(!host) return;
    var box=host.querySelector("#cloud-events");
    if(!box) return;
    var row=document.createElement("div");
    row.className="cloud-event"+(type?" "+type:"");
    row.textContent=message;
    box.insertBefore(row,box.firstChild);
    while(box.children.length>6){
      box.removeChild(box.lastElementChild);
    }
  }

  function refreshSummary(){
    if(!host) return;
    host.querySelector("#cloud-sessions").textContent=sessionRevoked?"03":"04";
    host.querySelector("#cloud-policy").textContent=leastPrivilege?"HARDENED":"BASELINE";
    host.querySelector("#cloud-status").textContent=leastPrivilege?"ZERO TRUST HARDENED":"POLICY ENGINE READY";
  }

  function selectIdentity(id){
    if(!host || !identities[id]) return;
    selected=id;
    var item=identities[id];
    var buttons=host.querySelectorAll(".cloud-id");
    for(var i=0;i<buttons.length;i++){
      buttons[i].classList.toggle("active",buttons[i].getAttribute("data-cloudid")===id);
    }
    host.querySelector("#cloud-name").textContent=item.name;
    host.querySelector("#cloud-badge").textContent=item.badge;
    host.querySelector("#cloud-meta").textContent=item.role+" // "+item.meta;
    host.querySelector("#cloud-flags").innerHTML=
      '<span class="cloud-flag '+(item.mfa?"good":"warn")+'">'+(item.mfa?"MFA ENABLED":"MFA REQUIRED")+'</span>'+
      '<span class="cloud-flag">RISK '+item.risk+'/100</span>'+
      '<span class="cloud-flag '+(leastPrivilege?"good":"")+'">'+(leastPrivilege?"LEAST PRIVILEGE":"STANDARD ROLE")+'</span>'+
      '<span class="cloud-flag '+(sessionRevoked?"warn":"good")+'">'+(sessionRevoked?"SESSION REVOKED":"SESSION ACTIVE")+'</span>';
    addEvent(item.name+" selected // identity context synchronized.");
    refreshSummary();
  }

  function evaluate(){
    var item=identities[selected];
    if(!item) return;
    var result=item.mfa ? "conditional access passed" : "step-up authentication required";
    addEvent(item.name+" access evaluation // "+result+" // risk "+item.risk+"/100.",item.mfa?"good":"warn");
  }

  function applyLeastPrivilege(){
    leastPrivilege=true;
    addEvent("Least-privilege policy applied // excessive permissions removed in simulation.","good");
    selectIdentity(selected);
  }

  function revokeSession(){
    if(sessionRevoked){
      addEvent("Session already revoked // no duplicate action required.");
      return;
    }
    sessionRevoked=true;
    addEvent(identities[selected].name+" session revoked // re-authentication required.","warn");
    selectIdentity(selected);
  }

  function handleClick(e){
    var identity=e.target.closest("[data-cloudid]");
    if(identity){
      selectIdentity(identity.getAttribute("data-cloudid"));
      return;
    }
    var action=e.target.closest("[data-cloudaction]");
    if(!action) return;
    var type=action.getAttribute("data-cloudaction");
    if(type==="evaluate") evaluate();
    if(type==="least") applyLeastPrivilege();
    if(type==="revoke") revokeSession();
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
    selected="admin";
    sessionRevoked=false;
    leastPrivilege=false;
    host.innerHTML=layout();
    host.addEventListener("click",handleClick);
    selectIdentity("admin");
  }

  window.CyberCloudLab={
    mount:mount,
    unmount:unmount
  };
})();