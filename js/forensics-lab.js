/* CYBER LAB - DIGITAL FORENSICS / DFIR LAB v1.8 */
(function(){
  var host=null;
  var selected="auth";
  var integrityVerified={};
  var custodyCount=1;

  var evidence={
    auth:{
      name:"AUTH.LOG",
      type:"SECURITY LOG",
      badge:"LOG",
      meta:"Synthetic authentication log containing successful and failed access events for forensic training.",
      content:"2026-09-29T22:14:08Z user=lab-admin result=success source=10.24.8.15 session=DFIR-17"
    },
    browser:{
      name:"BROWSER.DB",
      type:"WEB ARTIFACT",
      badge:"DB",
      meta:"Synthetic browser-history artifact used to demonstrate timeline reconstruction and correlation.",
      content:"visit=portal.example timestamp=2026-09-29T22:18:41Z profile=training-user referrer=internal"
    },
    memory:{
      name:"MEMORY.SNAP",
      type:"MEMORY ARTIFACT",
      badge:"RAM",
      meta:"Synthetic volatile-memory snapshot metadata. No device memory is accessed by this laboratory.",
      content:"process=training-agent pid=4207 socket=10.24.8.15:443 state=ESTABLISHED synthetic=true"
    },
    config:{
      name:"SYSTEM.CFG",
      type:"CONFIGURATION",
      badge:"CFG",
      meta:"Synthetic configuration artifact showing how system changes can be included in a forensic timeline.",
      content:"service=remote-access policy=mfa-required changed=2026-09-29T22:21:13Z actor=lab-admin"
    }
  };

  function layout(){
    return "<div class=\"dfirlab\">"+
      "<div class=\"dfir-top\"><span>DIGITAL FORENSICS // DFIR TRAINING</span><strong>CASE DF-018</strong></div>"+
      "<div class=\"dfir-case\"><small>ACTIVE FORENSIC CASE</small><h4>Endpoint Access Reconstruction</h4><p>Synthetic evidence set for demonstrating integrity verification, timeline analysis and chain of custody.</p></div>"+
      "<div class=\"dfir-stats\">"+
        "<div class=\"dfir-stat\"><span>EVIDENCE ITEMS</span><b>04</b></div>"+
        "<div class=\"dfir-stat\"><span>VERIFIED</span><b id=\"dfir-verified\">00</b></div>"+
        "<div class=\"dfir-stat\"><span>CUSTODY EVENTS</span><b id=\"dfir-custody\">01</b></div>"+
      "</div>"+
      "<div class=\"dfir-grid\">"+
        "<button class=\"dfir-evidence\" data-evidence=\"auth\"><b>AUTH.LOG</b><span>SECURITY LOG</span></button>"+
        "<button class=\"dfir-evidence\" data-evidence=\"browser\"><b>BROWSER.DB</b><span>WEB ARTIFACT</span></button>"+
        "<button class=\"dfir-evidence\" data-evidence=\"memory\"><b>MEMORY.SNAP</b><span>VOLATILE ARTIFACT</span></button>"+
        "<button class=\"dfir-evidence\" data-evidence=\"config\"><b>SYSTEM.CFG</b><span>CONFIGURATION</span></button>"+
      "</div>"+
      "<div class=\"dfir-detail\">"+
        "<div class=\"dfir-detail-head\"><div><small>SELECTED EVIDENCE</small><h4 id=\"dfir-name\"></h4></div><span class=\"dfir-badge\" id=\"dfir-badge\"></span></div>"+
        "<div class=\"dfir-meta\" id=\"dfir-meta\"></div>"+
        "<div class=\"dfir-hash\"><label>SHA-256 FINGERPRINT</label><div class=\"dfir-hash-value\" id=\"dfir-hash\">Not calculated yet.</div></div>"+
        "<div class=\"dfir-actions\">"+
          "<button class=\"dfir-action\" data-dfir=\"verify\">VERIFY INTEGRITY</button>"+
          "<button class=\"dfir-action\" data-dfir=\"correlate\">CORRELATE TIMELINE</button>"+
          "<button class=\"dfir-action warn\" data-dfir=\"custody\">ADD CUSTODY EVENT</button>"+
        "</div>"+
      "</div>"+
      "<div class=\"dfir-timeline\">"+
        "<div class=\"dfir-timeline-title\">RECONSTRUCTED SYNTHETIC TIMELINE</div>"+
        "<div class=\"dfir-time\"><time>22:14</time><span>Authentication event recorded for lab-admin.</span></div>"+
        "<div class=\"dfir-time\"><time>22:18</time><span>Browser artifact records access to synthetic portal.</span></div>"+
        "<div class=\"dfir-time\"><time>22:21</time><span>Configuration policy updated to require MFA.</span></div>"+
        "<div class=\"dfir-time\"><time>22:24</time><span>Memory snapshot metadata captured for training case.</span></div>"+
      "</div>"+
      "<div class=\"dfir-events\" id=\"dfir-events\"><div class=\"dfir-event\">DFIR workspace initialized // synthetic evidence only.</div></div>"+
    "</div>";
  }

  function addEvent(message,type){
    if(!host) return;
    var box=host.querySelector("#dfir-events");
    if(!box) return;
    var row=document.createElement("div");
    row.className="dfir-event"+(type?" "+type:"");
    row.textContent=message;
    box.insertBefore(row,box.firstChild);
    while(box.children.length>7){box.removeChild(box.lastElementChild);}
  }

  function hex(bytes){
    var out="";
    for(var i=0;i<bytes.length;i++){
      out+=bytes[i].toString(16).padStart(2,"0");
    }
    return out;
  }

  function refreshStats(){
    if(!host) return;
    var count=Object.keys(integrityVerified).length;
    host.querySelector("#dfir-verified").textContent=String(count).padStart(2,"0");
    host.querySelector("#dfir-custody").textContent=String(custodyCount).padStart(2,"0");
  }

  function selectEvidence(id){
    if(!host || !evidence[id]) return;
    selected=id;
    var item=evidence[id];
    var buttons=host.querySelectorAll("[data-evidence]");
    for(var i=0;i<buttons.length;i++){
      buttons[i].classList.toggle("active",buttons[i].getAttribute("data-evidence")===id);
    }
    host.querySelector("#dfir-name").textContent=item.name;
    host.querySelector("#dfir-badge").textContent=item.badge;
    host.querySelector("#dfir-meta").textContent=item.type+" // "+item.meta;
    host.querySelector("#dfir-hash").textContent=integrityVerified[id] || "Not calculated yet.";
    addEvent(item.name+" selected // evidence context synchronized.");
  }

  async function verifyIntegrity(){
    if(!host) return;
    var item=evidence[selected];
    if(!item) return;
    if(!window.crypto || !window.crypto.subtle){
      host.querySelector("#dfir-hash").textContent="Web Crypto API unavailable.";
      addEvent("Integrity verification unavailable in current browser context.","warn");
      return;
    }
    try{
      var data=new TextEncoder().encode(item.content);
      var digest=await window.crypto.subtle.digest("SHA-256",data);
      var fingerprint=hex(new Uint8Array(digest));
      integrityVerified[selected]=fingerprint;
      host.querySelector("#dfir-hash").textContent=fingerprint;
      refreshStats();
      addEvent(item.name+" integrity verified with real local SHA-256.","good");
    }catch(error){
      addEvent("Integrity verification failed in browser context.","warn");
    }
  }

  function correlateTimeline(){
    var item=evidence[selected];
    if(!item) return;
    addEvent(item.name+" correlated with synthetic case timeline // temporal relationship added.","good");
  }

  function addCustody(){
    var item=evidence[selected];
    if(!item) return;
    custodyCount++;
    refreshStats();
    addEvent("Custody event "+String(custodyCount).padStart(2,"0")+" recorded for "+item.name+" // training chain updated.","good");
  }

  function handleClick(event){
    var evidenceButton=event.target.closest("[data-evidence]");
    if(evidenceButton){
      selectEvidence(evidenceButton.getAttribute("data-evidence"));
      return;
    }
    var action=event.target.closest("[data-dfir]");
    if(!action) return;
    var type=action.getAttribute("data-dfir");
    if(type==="verify") verifyIntegrity();
    if(type==="correlate") correlateTimeline();
    if(type==="custody") addCustody();
  }

  function unmount(){
    if(host){host.removeEventListener("click",handleClick);}
    host=null;
  }

  function mount(container){
    unmount();
    host=container;
    selected="auth";
    integrityVerified={};
    custodyCount=1;
    host.innerHTML=layout();
    host.addEventListener("click",handleClick);
    selectEvidence("auth");
    refreshStats();
    addEvent("No real device files or memory are accessed by this DFIR laboratory.","good");
  }

  window.CyberForensicsLab={
    mount:mount,
    unmount:unmount
  };
})();
