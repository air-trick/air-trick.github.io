/*
 * 営業カレンダーの埋め込み表示
 * 使い方：表示したい場所に <div class="biz-calendar"></div> を置き、
 *         <script src="https://hm00yamaguchi-boop.github.io/airtrick-members/calendar/embed.js" defer></script> を読み込む
 * 画像と months.json は publish.py が自動で更新します（このファイルも publish.py が上書きします）。
 */
(function () {
  var script = document.currentScript;
  var BASE = script ? script.src.replace(/embed\.js(\?.*)?$/, "") : "calendar/";

  var css =
    ".biz-calendar{max-width:540px;margin:0 auto;}" +
    ".biz-cal-tabs{display:flex;gap:8px;margin-bottom:10px;}" +
    ".biz-cal-tabs button{flex:1;padding:10px 6px;border-radius:12px;border:2px solid #182848;background:#fff;color:#182848;" +
    "font-weight:800;font-size:0.92rem;cursor:pointer;font-family:inherit;}" +
    ".biz-cal-tabs button[aria-selected='true']{background:#182848;color:#fff;}" +
    ".biz-cal-img{display:block;width:100%;height:auto;border-radius:12px;box-shadow:0 6px 18px rgba(24,40,72,.12);}" +
    ".biz-cal-note{margin:8px 0 0;font-size:0.8rem;color:#5a6378;text-align:center;}";
  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // 日本時間の今日の「年・月」
  function nowYm() {
    var d = new Date(Date.now() + (9 * 60 + new Date().getTimezoneOffset()) * 60000);
    return { y: d.getFullYear(), m: d.getMonth() + 1 };
  }
  function key(y, m) { return y + "-" + (m < 10 ? "0" : "") + m; }

  function render(box, data) {
    var t = nowYm();
    var cur = key(t.y, t.m);
    var nx = t.m === 12 ? key(t.y + 1, 1) : key(t.y, t.m + 1);
    var byKey = {};
    data.months.forEach(function (x) { byKey[x.ym] = x; });

    // 今月・来月を優先。まだ画像がない月は、次に用意されている月を表示する
    var list = [];
    if (byKey[cur]) list.push({ label: "今月", item: byKey[cur] });
    if (byKey[nx]) list.push({ label: "来月", item: byKey[nx] });
    if (!list.length) {
      var future = data.months.filter(function (x) { return x.ym >= cur; }).slice(0, 2);
      list = future.map(function (x) { return { label: "", item: x }; });
    }
    if (!list.length) { box.innerHTML = ""; return; }
    list.forEach(function (e) {
      var m = Number(e.item.ym.slice(5)) + "月";
      e.label = e.label ? e.label + "（" + m + "）" : m;
    });

    var tabs = document.createElement("div");
    tabs.className = "biz-cal-tabs";
    tabs.setAttribute("role", "tablist");
    var link = document.createElement("a");
    link.target = "_blank";
    link.rel = "noopener";
    var img = document.createElement("img");
    img.className = "biz-cal-img";
    img.width = 1080; img.height = 1080;
    img.loading = "lazy";
    link.appendChild(img);
    var note = document.createElement("p");
    note.className = "biz-cal-note";
    note.textContent = "画像をタップすると大きく表示されます";

    function show(i) {
      var it = list[i].item;
      var src = BASE + it.file + "?v=" + it.v;
      img.src = src;
      img.alt = it.ym.slice(0, 4) + "年" + Number(it.ym.slice(5)) + "月の営業カレンダー";
      link.href = src;
      Array.prototype.forEach.call(tabs.children, function (b, k) {
        b.setAttribute("aria-selected", k === i ? "true" : "false");
      });
    }
    list.forEach(function (e, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "tab");
      b.textContent = e.label;
      b.addEventListener("click", function () { show(i); });
      tabs.appendChild(b);
    });
    box.innerHTML = "";
    if (list.length > 1) box.appendChild(tabs);
    box.appendChild(link);
    box.appendChild(note);
    show(0);
  }

  function start() {
    var boxes = document.querySelectorAll(".biz-calendar");
    if (!boxes.length) return;
    fetch(BASE + "months.json?t=" + Date.now(), { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        Array.prototype.forEach.call(boxes, function (b) { render(b, data); });
      })
      .catch(function () {
        Array.prototype.forEach.call(boxes, function (b) { b.innerHTML = ""; });
      });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
