/* Free-report form: static site, no backend. Opens the visitor's email app with a pre-filled message to info@. Nothing is sent automatically. */
(function(){
  var TO = "info@whowouldaihire.com";
  document.querySelectorAll("form[data-mailto-report]").forEach(function(f){
    f.addEventListener("submit", function(e){
      e.preventDefault();
      var g = function(n){ var el = f.elements[n]; return el ? el.value.trim() : ""; };
      var subject = "Free AI visibility report: " + g("business");
      var body = "Hi WhoWouldAIHire,\n\nPlease send me a free AI visibility report.\n\n" +
        "Business: " + g("business") + "\nCity and state: " + g("city") + "\nTrade: " + g("trade") +
        "\nWebsite (optional): " + g("website") + "\nReply to: " + g("email") + "\n\nThanks!";
      window.location.href = "mailto:" + TO + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      var n = f.querySelector("[data-after]"); if (n) n.hidden = false;
    });
  });
  var h = document.querySelector("header.site");
  if (h) { var on = function(){ h.style.borderBottomColor = window.scrollY > 8 ? "var(--rule)" : "transparent"; }; on(); window.addEventListener("scroll", on, {passive:true}); }
})();
