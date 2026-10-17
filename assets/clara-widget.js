/* Clara web chat widget.
   CLARA_MODE "chat" (default): talks to CLARA_ENDPOINT (default /api/clara).
   CLARA_MODE "form": static hosting with no backend. Clara collects name/email/business/city and posts them to
   CLARA_FORM_ENDPOINT (e.g. a Formspree form URL). With no endpoint set it says "coming soon" and collects nothing. */
(function(){
  if ((window.CLARA_MODE || "chat") === "form") { return staticMode(); }
  var EP = window.CLARA_ENDPOINT || "/api/clara";
  var sid = localStorage.getItem("clara_sid") || (Math.random().toString(36).slice(2) + Date.now().toString(36));
  localStorage.setItem("clara_sid", sid);
  var html = '<button id="clara-launch" aria-label="Chat with Clara"><span class="clara-av">C</span>Chat with Clara <span class="ai-tag">AI assistant</span></button>' +
    '<div id="clara-panel" role="dialog" aria-label="Chat with Clara"><div class="clara-head"><span class="clara-av">C</span><div><div class="nm">Clara <span class="ai-tag">AI assistant</span></div><div class="sub">WhoWouldAIHire · usually replies instantly</div></div><button aria-label="Close">×</button></div>' +
    '<div id="clara-log" aria-live="polite"></div><form id="clara-form"><input autocomplete="off" placeholder="Type a message…" aria-label="Message"><button>Send</button></form></div>';
  var d = document.createElement("div"); d.innerHTML = html; document.body.appendChild(d);
  var panel = document.getElementById("clara-panel"), log = document.getElementById("clara-log"), form = document.getElementById("clara-form"), input = form.querySelector("input");
  function esc(s){return s.replace(/[&<>]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c]})}
  function linkify(s){return esc(s).replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>').replace(/(^|\s)(https?:\/\/[^\s<]+)/g,'$1<a href="$2" target="_blank" rel="noopener">$2</a>').replace(/\*\*([^*]+)\*\*/g,"<b>$1</b>")}
  function add(t, who){var m=document.createElement("div");m.className="msg "+who;m.innerHTML=linkify(t);log.appendChild(m);log.scrollTop=log.scrollHeight}
  var started=false;
  function send(text, meta){
    if(text) add(text,"me");
    var typing=document.createElement("div");typing.className="msg bot";typing.textContent="…";log.appendChild(typing);
    fetch(EP,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({session:sid,message:text||"",meta:meta||{}})})
      .then(function(r){if(!r.ok) throw new Error(r.status);return r.json()})
      .then(function(j){typing.remove();(j.replies||[]).forEach(function(x){add(x,"bot")})})
      .catch(function(){typing.remove();add("Hi, I'm Clara from WhoWouldAIHire. Live chat isn't switched on yet on this preview. Leave your business name and city in the form and we'll send your free report.","bot")});
  }
  function open(meta){panel.classList.add("open");if(!started){started=true;send("",Object.assign({event:"open",page:location.pathname},meta||{}))}input.focus()}
  document.getElementById("clara-launch").onclick=function(){panel.classList.contains("open")?panel.classList.remove("open"):open()};
  panel.querySelector(".clara-head button").onclick=function(){panel.classList.remove("open")};
  form.onsubmit=function(e){e.preventDefault();var t=input.value.trim();if(!t)return;input.value="";send(t)};
  document.addEventListener("visibilitychange",function(){ if(!document.hidden && started){
    fetch(EP,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({session:sid,message:"",meta:{event:"poll"}})})
      .then(function(r){return r.json()}).then(function(j){(j.replies||[]).forEach(function(x){add(x,"bot")})}).catch(function(){});}});
  window.Clara={open:open,send:function(t,m){open();send(t,m)}};
  document.querySelectorAll("form[data-clara-report]").forEach(function(f){
    f.addEventListener("submit",function(e){e.preventDefault();var fd=new FormData(f);var b=fd.get("business"),c=fd.get("city"),t=fd.get("trade"),em=fd.get("email");
      if(!started){started=true;panel.classList.add("open")}else{panel.classList.add("open")}
      send("Free report for "+b+" ("+t+") in "+c, {event:"report_form",business:b,city:c,trade:t,email:em,page:location.pathname});});
  });

  function staticMode(){
    var FE = window.CLARA_FORM_ENDPOINT || "";
    function el(h){var d=document.createElement("div");d.innerHTML=h;return d.firstChild}
    var intro = FE ? "Hi, I'm Clara from WhoWouldAIHire. Live chat is coming soon. Leave your details and we'll email your free AI visibility report, usually within one business day."
                   : "Hi, I'm Clara from WhoWouldAIHire. Free reports and live chat open very soon. Please check back shortly.";
    var fields = FE ? '<form id="clara-lead"><input name="name" required placeholder="Your name" aria-label="Your name"><input name="email" type="email" required placeholder="Email" aria-label="Email">' +
      '<input name="business" required placeholder="Business name" aria-label="Business name"><input name="city" required placeholder="City & state" aria-label="City and state">' +
      '<input name="_gotcha" style="display:none" tabindex="-1" autocomplete="off"><button>Send me my free report</button>' +
      '<p class="fine">We use this only to send your report and follow up about it. <a href="/legal/privacy/">Privacy</a></p></form>' : '';
    document.body.appendChild(el('<div><button id="clara-launch" aria-label="Clara"><span class="clara-av">C</span>Ask Clara <span class="ai-tag">AI assistant</span></button>' +
      '<div id="clara-panel" role="dialog" aria-label="Clara"><div class="clara-head"><span class="clara-av">C</span><div><div class="nm">Clara <span class="ai-tag">AI assistant</span></div><div class="sub">WhoWouldAIHire</div></div><button aria-label="Close">×</button></div>' +
      '<div id="clara-log" aria-live="polite"><div class="msg bot">' + intro + '</div>' + fields + '</div></div></div>'));
    var panel=document.getElementById("clara-panel"), log=document.getElementById("clara-log");
    function say(t){var m=document.createElement("div");m.className="msg bot";m.textContent=t;log.appendChild(m);log.scrollTop=log.scrollHeight}
    function submit(data, done){
      if(!FE){say("Thanks! Free reports open very soon. Please check back shortly.");return}
      fetch(FE,{method:"POST",headers:{"Accept":"application/json","Content-Type":"application/json"},body:JSON.stringify(data)})
        .then(function(r){if(!r.ok) throw new Error(r.status); say("Got it, thank you. Your free report for "+(data.business||"your business")+" is on its way to "+data.email+"."); if(done) done();})
        .catch(function(){say("Sorry, that didn't go through. Please try again in a minute.")});
    }
    function open(){panel.classList.add("open")}
    document.getElementById("clara-launch").onclick=function(){panel.classList.toggle("open")};
    panel.querySelector(".clara-head button").onclick=function(){panel.classList.remove("open")};
    var lf=document.getElementById("clara-lead");
    if(lf) lf.onsubmit=function(e){e.preventDefault();var o={};new FormData(lf).forEach(function(v,k){o[k]=v});o.source="clara-widget";o.page=location.pathname;submit(o,function(){lf.remove()})};
    window.Clara={open:open,send:function(){open()}};
    document.querySelectorAll("form[data-clara-report]").forEach(function(f){
      if(!FE){var b=f.querySelector("button");if(b){b.textContent="Free reports open soon";}}
      f.addEventListener("submit",function(e){e.preventDefault();var o={};new FormData(f).forEach(function(v,k){o[k]=v});o.source="report-form";o.page=location.pathname;open();submit(o,function(){f.reset()})});
    });
  }
})();
