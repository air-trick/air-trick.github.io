// 長めの説明文を、読みやすい位置（文節）で折り返すための小さな補助スクリプト。
// 外部の文節判定（BudouX）を読み込めなかった場合は、何も起きず通常の表示のままになる。
(function () {
  var SELECTOR = '.hint, .note, .phrase, .done p, .not-found, .scan-hint';

  function wrap() {
    document.querySelectorAll(SELECTOR).forEach(function (el) {
      if (el.querySelector('budoux-ja') || el.tagName === 'BUDOUX-JA') return;
      var w = document.createElement('budoux-ja');
      while (el.firstChild) w.appendChild(el.firstChild);
      el.appendChild(w);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wrap);
  else wrap();

  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/budoux@0.7.0/bundle/budoux-ja.min.js';
  s.async = true;
  document.head.appendChild(s);
})();
