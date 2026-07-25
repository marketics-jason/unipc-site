/* UNIPC — progressive enhancement only.
   Everything here is optional: pages render and forms submit (native mailto)
   with this file absent or blocked. JS only improves the experience.
   Note: there is NO payment/donation logic anywhere, by design. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Scroll reveal ------------------------------------------------- */
  function initFade() {
    var nodes = document.querySelectorAll('[data-fade]');
    if (!nodes.length) return;
    if (reduce || !('IntersectionObserver' in window)) return; // stay fully visible
    nodes.forEach(function (n) { n.classList.add('u-fade'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
    nodes.forEach(function (n) { io.observe(n); });
    // Safety net: never leave content hidden if the observer never fires.
    setTimeout(function () { nodes.forEach(function (n) { n.classList.add('is-in'); }); }, 1600);
  }

  /* ---- Mailto forms with inline success ------------------------------ */
  /* A form opts in with data-unipc-form, data-subject="…", and
     data-mailto="dept@unipc.info". On submit we build a plain-text mailto to
     that address from the fields, then flip the card to its .form-success view.
     Without JS the form still posts natively (action=mailto) so it degrades. */
  function serialize(form) {
    var out = [];
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.type === 'submit' || el.type === 'button') return;
      var label = el.getAttribute('data-label') || el.name;
      out.push(label + ': ' + (el.value || ''));
    });
    return out.join('\n');
  }
  function initForms() {
    document.querySelectorAll('[data-unipc-form]').forEach(function (form) {
      var card = form.closest('[data-form-card]') || form.parentNode;
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var to = form.getAttribute('data-mailto') || 'secretariat@unipc.info';
        var subject = form.getAttribute('data-subject') || 'UNIPC';
        var body = serialize(form);
        window.location.href = 'mailto:' + to + '?subject=' +
          encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
        if (card) card.classList.add('is-submitted');
      });
    });
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  ready(function () { initFade(); initForms(); });
})();
