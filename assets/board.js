/*
 * トップページ「営業カレンダー」「お知らせ・チラシ」の横スクロール表示
 *  - 営業カレンダー：calendar/months.json（営業カレンダー2027 の publish.py が自動更新）から、今月以降を表示
 *  - チラシ：flyers/flyers.json に並べた順に表示。"until"（YYYY-MM-DD）を過ぎたものは自動で非表示
 */
(function () {
  function todayJst() {
    var d = new Date(Date.now() + (9 * 60 + new Date().getTimezoneOffset()) * 60000);
    var p = function (n) { return (n < 10 ? "0" : "") + n; };
    return { ym: d.getFullYear() + "-" + p(d.getMonth() + 1), ymd: d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) };
  }

  // slides: [{src, href, alt}]
  function buildSlider(root, slides, ratio) {
    root.innerHTML = "";
    var viewport = document.createElement("div");
    viewport.className = "slider-track";
    viewport.setAttribute("tabindex", "0");
    slides.forEach(function (s) {
      var a = document.createElement("a");
      a.className = "slide";
      a.href = s.href;
      a.target = "_blank";
      a.rel = "noopener";
      a.style.aspectRatio = ratio;
      var img = document.createElement("img");
      img.src = s.src;
      img.alt = s.alt;
      img.loading = "lazy";
      a.appendChild(img);
      viewport.appendChild(a);
    });
    root.appendChild(viewport);
    if (slides.length < 2) return;

    var prev = document.createElement("button");
    prev.type = "button"; prev.className = "slider-btn prev"; prev.setAttribute("aria-label", "前へ"); prev.innerHTML = "&#8249;";
    var next = document.createElement("button");
    next.type = "button"; next.className = "slider-btn next"; next.setAttribute("aria-label", "次へ"); next.innerHTML = "&#8250;";
    var dots = document.createElement("div");
    dots.className = "slider-dots";
    slides.forEach(function (s, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", s.alt);
      b.addEventListener("click", function () { go(i); });
      dots.appendChild(b);
    });
    root.appendChild(prev); root.appendChild(next); root.appendChild(dots);

    function index() { return Math.round(viewport.scrollLeft / viewport.clientWidth); }
    function go(i) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      viewport.scrollTo({ left: i * viewport.clientWidth, behavior: "smooth" });
    }
    function update() {
      var i = index();
      prev.disabled = i <= 0;
      next.disabled = i >= slides.length - 1;
      Array.prototype.forEach.call(dots.children, function (d, k) { d.setAttribute("aria-current", k === i ? "true" : "false"); });
    }
    prev.addEventListener("click", function () { go(index() - 1); });
    next.addEventListener("click", function () { go(index() + 1); });
    viewport.addEventListener("scroll", function () { window.requestAnimationFrame(update); }, { passive: true });
    viewport.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); go(index() - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); go(index() + 1); }
    });
    update();
  }

  function getJson(url) {
    return fetch(url + "?t=" + Date.now(), { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    });
  }

  function start() {
    var t = todayJst();
    var cal = document.getElementById("calSlider");
    var fly = document.getElementById("flyerSlider");

    if (cal) {
      getJson("calendar/months.json").then(function (data) {
        var list = data.months.filter(function (m) { return m.ym >= t.ym; });
        if (!list.length) throw new Error("empty");
        buildSlider(cal, list.map(function (m) {
          var src = "calendar/" + m.file + "?v=" + m.v;
          return { src: src, href: src, alt: m.ym.slice(0, 4) + "年" + Number(m.ym.slice(5)) + "月の営業カレンダー" };
        }), "1 / 1");
      }).catch(function () { cal.closest(".board-col").hidden = true; });
    }

    if (fly) {
      getJson("flyers/flyers.json").then(function (data) {
        var list = (data.flyers || []).filter(function (f) { return !f.until || f.until >= t.ymd; });
        if (!list.length) throw new Error("empty");
        buildSlider(fly, list.map(function (f) {
          var src = "flyers/" + f.file;
          return { src: src, href: f.link || src, alt: f.alt || "お知らせ" };
        }), data.ratio || "1 / 1.414");
      }).catch(function () { fly.closest(".board-col").hidden = true; });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
