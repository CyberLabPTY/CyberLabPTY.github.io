/* CYBER LAB - CRYPTOGRAPHY & PRIVACY LAB v1.7 */
(function(){
  var host=null;

  function layout(){
    return "<div class=\"cryptolab\">"+
      "<div class=\"crypto-top\"><span>CRYPTOGRAPHY & PRIVACY // LOCAL LAB</span><strong>REAL LOCAL CRYPTO</strong></div>"+
      "<div class=\"crypto-stage\">"+
        "<div class=\"crypto-ring\"></div>"+
        "<i class=\"crypto-pulse p1\"></i>"+
        "<i class=\"crypto-pulse p2\"></i>"+
        "<i class=\"crypto-pulse p3\"></i>"+
        "<i class=\"crypto-pulse p4\"></i>"+
        "<div class=\"crypto-core\"><b>CRYPTO ENGINE</b><span>SHA-256 // CSPRNG // LOCAL</span></div>"+
      "</div>"+
      "<div class=\"crypto-panel\">"+
        "<small>LOCAL CRYPTOGRAPHIC WORKSPACE</small>"+
        "<h4>Hash & Randomness Laboratory</h4>"+
        "<textarea id=\"crypto-input\" class=\"crypto-input\" placeholder=\"Escribe un texto para calcular su SHA-256 real...\"></textarea>"+
        "<div class=\"crypto-actions\">"+
          "<button class=\"crypto-action\" data-crypto=\"hash\">CALCULATE SHA-256</button>"+
          "<button class=\"crypto-action\" data-crypto=\"random\">GENERATE 256-BIT RANDOM</button>"+
          "<button class=\"crypto-action\" data-crypto=\"nonce\">GENERATE NONCE</button>"+
          "<button class=\"crypto-action\" data-crypto=\"clear\">CLEAR WORKSPACE</button>"+
        "</div>"+
        "<div class=\"crypto-output\">"+
          "<label id=\"crypto-label\">OUTPUT</label>"+
          "<div class=\"crypto-value\" id=\"crypto-value\">Waiting for local operation...</div>"+
        "</div>"+
        "<div class=\"crypto-stats\">"+
          "<div class=\"crypto-stat\"><span>ALGORITHM</span><b id=\"crypto-algo\">SHA-256</b></div>"+
          "<div class=\"crypto-stat\"><span>EXECUTION</span><b id=\"crypto-mode\">LOCAL</b></div>"+
          "<div class=\"crypto-stat\"><span>NETWORK</span><b>NONE</b></div>"+
        "</div>"+
      "</div>"+
      "<div class=\"crypto-events\" id=\"crypto-events\"><div class=\"crypto-event\">Cryptographic workspace initialized locally.</div></div>"+
    "</div>";
  }

  function addEvent(message,type){
    if(!host) return;
    var box=host.querySelector("#crypto-events");
    if(!box) return;
    var row=document.createElement("div");
    row.className="crypto-event"+(type?" "+type:"");
    row.textContent=message;
    box.insertBefore(row,box.firstChild);
    while(box.children.length>6){box.removeChild(box.lastElementChild);}
  }

  function hex(bytes){
    var out="";
    for(var i=0;i<bytes.length;i++){
      out+=bytes[i].toString(16).padStart(2,"0");
    }
    return out;
  }

  function output(label,value,algorithm){
    if(!host) return;
    host.querySelector("#crypto-label").textContent=label;
    host.querySelector("#crypto-value").textContent=value;
    host.querySelector("#crypto-algo").textContent=algorithm;
  }

  async function calculateHash(){
    if(!host) return;
    var input=host.querySelector("#crypto-input").value;
    if(!input){
      addEvent("SHA-256 blocked // enter text first.","warn");
      return;
    }
    if(!window.crypto || !window.crypto.subtle){
      output("SHA-256","Web Crypto API unavailable in this preview.","UNAVAILABLE");
      addEvent("Web Crypto API unavailable in current browser context.","warn");
      return;
    }
    try{
      var data=new TextEncoder().encode(input);
      var digest=await window.crypto.subtle.digest("SHA-256",data);
      var value=hex(new Uint8Array(digest));
      output("SHA-256 DIGEST",value,"SHA-256");
      addEvent("Real SHA-256 calculated locally // no network request used.","good");
    }catch(error){
      output("ERROR",String(error),"ERROR");
      addEvent("SHA-256 operation failed in browser context.","warn");
    }
  }

  function generateRandom(){
    if(!window.crypto || !window.crypto.getRandomValues){
      output("RANDOM","Secure random generator unavailable.","UNAVAILABLE");
      addEvent("Secure random generator unavailable.","warn");
      return;
    }
    var bytes=new Uint8Array(32);
    window.crypto.getRandomValues(bytes);
    output("256-BIT RANDOM VALUE",hex(bytes),"CSPRNG");
    addEvent("256 cryptographically secure random bits generated locally.","good");
  }

  function generateNonce(){
    if(!window.crypto || !window.crypto.getRandomValues){
      output("NONCE","Secure random generator unavailable.","UNAVAILABLE");
      return;
    }
    var bytes=new Uint8Array(12);
    window.crypto.getRandomValues(bytes);
    output("96-BIT NONCE",hex(bytes),"CSPRNG");
    addEvent("96-bit nonce generated locally.","good");
  }

  function clearWorkspace(){
    if(!host) return;
    host.querySelector("#crypto-input").value="";
    output("OUTPUT","Waiting for local operation...","SHA-256");
    addEvent("Workspace cleared // no persistent data stored.");
  }

  function handleClick(event){
    var button=event.target.closest("[data-crypto]");
    if(!button) return;
    var action=button.getAttribute("data-crypto");
    if(action==="hash") calculateHash();
    if(action==="random") generateRandom();
    if(action==="nonce") generateNonce();
    if(action==="clear") clearWorkspace();
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
    addEvent("All cryptographic operations remain inside this browser session.","good");
  }

  window.CyberCryptoLab={
    mount:mount,
    unmount:unmount
  };
})();
