/* Alles, was die Seite an Bewegung braucht:
   Ton-Knopf, Handy-Menue, Aufklapp-Kaesten. Mehr nicht. */
(function () {
  "use strict";

  /* ---------- Ton ---------- */
  var ton = document.getElementById("ton");
  var tonKnopf = document.getElementById("ton-knopf");
  if (ton && tonKnopf) {
    ton.volume = 0.6;
    ton.addEventListener("ended", function () { zeige(false); });
    function zeige(an) { tonKnopf.setAttribute("aria-pressed", an ? "true" : "false"); }
    function an() {
      var p = ton.play();
      if (p && p.then) p.then(function () { zeige(true); }).catch(function () { zeige(false); });
      else zeige(true);
    }
    tonKnopf.addEventListener("click", function () {
      if (ton.paused) { an(); merke("an"); }
      else { ton.pause(); zeige(false); merke("aus"); }
    });
    function merke(w) { try { localStorage.setItem("ton", w); } catch (e) {} }
    var wunsch = "an";
    try { wunsch = localStorage.getItem("ton") || "an"; } catch (e) {}
    if (wunsch === "an") {
      an();
      var einmal = function () {
        if (ton.paused) an();
        document.removeEventListener("pointerdown", einmal);
      };
      document.addEventListener("pointerdown", einmal);
    }
  }

  /* ---------- Handy-Menue ---------- */
  var kopf = document.querySelector(".top");
  var knopf = document.getElementById("menue-knopf");
  if (kopf && knopf) {
    function setzen(offen) {
      kopf.classList.toggle("offen", offen);
      knopf.setAttribute("aria-expanded", offen ? "true" : "false");
    }
    knopf.addEventListener("click", function () {
      setzen(!kopf.classList.contains("offen"));
    });
    document.querySelectorAll("#menue a").forEach(function (a) {
      a.addEventListener("click", function () { setzen(false); });
    });
  }

  /* ---------- Aufklapp-Kaesten oeffnen, wenn jemand direkt hinspringt ---------- */
  function oeffne() {
    if (!location.hash) return;
    var el = document.querySelector(location.hash + " .klapp-details");
    if (el) el.open = true;
  }
  window.addEventListener("hashchange", oeffne);
  oeffne();
  document.querySelectorAll('nav a[href^="#"], footer a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var ziel = document.querySelector(a.getAttribute("href"));
      if (!ziel) return;
      /* Selbst hinscrollen, aber erst wenn alles seine endgueltige Groesse hat:
         Das Handy-Menue sofort (ohne Animation) zuklappen, sonst rutscht die
         Seite nach dem Sprung um die Menuehoehe hoch und man landet mitten
         im Abschnitt. Aufklapp-Kaesten vorher oeffnen, sonst landet man
         zu weit unten, weil der Kasten durch das Aufklappen waechst. */
      e.preventDefault();
      if (kopf) {
        kopf.classList.add("sofort");
        kopf.classList.remove("offen");
        if (knopf) knopf.setAttribute("aria-expanded", "false");
        void kopf.offsetHeight; /* Browser uebernimmt das Zuklappen jetzt */
      }
      var klappe = ziel.querySelector(".klapp-details");
      if (klappe) klappe.open = true;
      ziel.scrollIntoView({ behavior: "smooth", block: "start" });
      if (kopf) kopf.classList.remove("sofort");
      if (history.replaceState) history.replaceState(null, "", a.getAttribute("href"));
    });
  });
})();
