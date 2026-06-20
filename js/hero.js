/*
 * hero.js - 進化する歩く勇者 (SVGベクター描画)
 * ------------------------------------------
 * 正解数 = レベル。1正解ごとに1段階(最大20)進化する。
 * 共通キャラに「武器 → 鎧 → 兜 → 盾 → マント → オーラ」を累積的に重ねて成長を表現。
 *
 * 公開API:
 *   Hero.reset()                 出題開始時に Lv0(村人)へ
 *   Hero.update(score)           正解数を渡して姿を更新。レベルアップ時に演出
 *   Hero.MAX_LEVEL               最大レベル(20)
 *   Hero.titleOf(level)          レベルの称号文字列
 */

window.Hero = (function () {
  "use strict";

  var MAX_LEVEL = 20;

  // 称号 (index 0 = 出発時 / 1..20 = 各レベル)
  var TITLES = [
    "たびだちの村人", // 0
    "みならい戦士",   // 1
    "かけだし戦士",   // 2
    "戦士",           // 3
    "熟練の戦士",     // 4
    "重戦士",         // 5
    "見習い騎士",     // 6
    "騎士",           // 7
    "上級騎士",       // 8
    "近衛騎士",       // 9
    "聖騎士",         // 10
    "勇者見習い",     // 11
    "勇者",           // 12
    "上級勇者",       // 13
    "紅蓮の勇者",     // 14
    "聖光の勇者",     // 15
    "王者",           // 16
    "覇王",           // 17
    "竜殺し",         // 18
    "救世主",         // 19
    "伝説の勇者"      // 20
  ];

  // idx 以下で最初に一致する val を返す (段階しきい値の選択)
  function pick(idx, ranges) {
    for (var i = 0; i < ranges.length; i++) {
      if (idx <= ranges[i][0]) return ranges[i][1];
    }
    return ranges[ranges.length - 1][1];
  }

  // 各パーツの段階を idx(=level) から決定
  function featuresOf(idx) {
    return {
      armor: pick(idx, [[3, "#8b5a2b"], [6, "#a16207"], [9, "#94a3b8"], [12, "#cbd5e1"], [16, "#f5c518"], [20, "#ffe98a"]]),
      armorEdge: pick(idx, [[3, "#5c3a1a"], [6, "#6b4410"], [9, "#64748b"], [12, "#94a3b8"], [16, "#b8860b"], [20, "#f5c518"]]),
      weapon: pick(idx, [[1, "stick"], [4, "bronze"], [8, "iron"], [11, "steel"], [14, "glow"], [17, "flame"], [20, "legend"]]),
      helmet: pick(idx, [[1, "none"], [3, "band"], [6, "cap"], [10, "iron"], [15, "wing"], [20, "crown"]]),
      shield: pick(idx, [[2, "none"], [6, "wood"], [11, "iron"], [16, "gold"], [20, "radiant"]]),
      cape: pick(idx, [[6, "none"], [11, "red"], [16, "purple"], [20, "gold"]]),
      aura: pick(idx, [[11, "none"], [14, "faint"], [17, "glow"], [19, "strong"], [20, "storm"]])
    };
  }

  // ---- パーツ描画 (SVG文字列) ----
  function drawAura(a) {
    if (a === "none") return "";
    var map = {
      faint:  { r: 46, op: 0.18, c: "#fde68a" },
      glow:   { r: 50, op: 0.28, c: "#fde68a" },
      strong: { r: 54, op: 0.38, c: "#fff3bf" },
      storm:  { r: 58, op: 0.5,  c: "#fff7d6" }
    }[a];
    var s = '<circle class="h-aura" cx="60" cy="84" r="' + map.r + '" fill="' + map.c + '" opacity="' + map.op + '"/>';
    if (a === "strong" || a === "storm") {
      // きらめき粒子
      var pts = [[24, 50], [96, 54], [30, 110], [92, 108], [60, 30]];
      for (var i = 0; i < pts.length; i++) {
        s += '<circle class="h-spark" cx="' + pts[i][0] + '" cy="' + pts[i][1] + '" r="2.4" fill="#fff7d6" opacity="0.9" style="animation-delay:' + (i * 0.18) + 's"/>';
      }
    }
    return s;
  }

  function drawCape(c) {
    if (c === "none") return "";
    var col = { red: "#dc2626", purple: "#7c3aed", gold: "#f5c518" }[c];
    var dark = { red: "#991b1b", purple: "#5b21b6", gold: "#b8860b" }[c];
    // 肩から下へ広がる布 (歩行で揺れる)
    return '<path class="h-cape" d="M48 74 Q40 110 46 132 L74 132 Q80 110 72 74 Z" fill="' + col + '" stroke="' + dark + '" stroke-width="1.5"/>';
  }

  function drawShield(s) {
    if (s === "none") return "";
    var face = { wood: "#a16207", iron: "#94a3b8", gold: "#f5c518", radiant: "#ffe98a" }[s];
    var edge = { wood: "#6b4410", iron: "#475569", gold: "#b8860b", radiant: "#f5c518" }[s];
    // 後ろ腕側 (左手)
    return '<g transform="translate(34,86)">' +
      '<path d="M0 -10 L13 -10 Q16 0 13 14 L6.5 20 L0 14 Q-3 0 0 -10 Z" fill="' + face + '" stroke="' + edge + '" stroke-width="2"/>' +
      '<circle cx="6.5" cy="5" r="2.4" fill="' + edge + '"/></g>';
  }

  function drawWeapon(w) {
    // 前腕(右手)に持たせる。柄~刃を上方向に立てる
    var blade, hilt = "#7c4a12";
    switch (w) {
      case "stick":  blade = '<rect x="-1.5" y="-30" width="3" height="34" rx="1.5" fill="#9a6b3f"/>'; break;
      case "bronze": blade = '<rect x="-2" y="-32" width="4" height="30" rx="1.5" fill="#cd7f32"/><rect x="-6" y="-4" width="12" height="3" rx="1.5" fill="' + hilt + '"/>'; break;
      case "iron":   blade = '<rect x="-2.5" y="-38" width="5" height="36" rx="2" fill="#cbd5e1"/><rect x="-7" y="-4" width="14" height="3.5" rx="1.5" fill="' + hilt + '"/>'; break;
      case "steel":  blade = '<polygon points="0,-44 3,-38 3,-4 -3,-4 -3,-38" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/><rect x="-8" y="-4" width="16" height="3.5" rx="1.5" fill="#475569"/>'; break;
      case "glow":   blade = '<polygon points="0,-48 3.5,-40 3.5,-4 -3.5,-4 -3.5,-40" fill="#bae6fd" stroke="#38bdf8" stroke-width="1.5"/><rect x="-9" y="-4" width="18" height="4" rx="2" fill="#0ea5e9"/>'; break;
      case "flame":  blade = '<polygon points="0,-52 4,-42 4,-4 -4,-4 -4,-42" fill="#fb923c" stroke="#ea580c" stroke-width="1.5"/><polygon points="0,-58 3,-50 -3,-50" fill="#fde047"/><rect x="-9" y="-4" width="18" height="4" rx="2" fill="#7c2d12"/>'; break;
      default:       blade = '<polygon points="0,-58 5,-46 5,-4 -5,-4 -5,-46" fill="#fde68a" stroke="#f5c518" stroke-width="2"/><polygon points="0,-66 4,-56 -4,-56" fill="#fffbeb"/><rect x="-12" y="-4" width="24" height="5" rx="2.5" fill="#b8860b"/>'; break;
    }
    return blade;
  }

  function drawHelmet(h, edge) {
    switch (h) {
      case "none": return "";
      case "band": return '<rect x="42" y="46" width="36" height="6" rx="3" fill="#dc2626"/>';
      case "cap":  return '<path d="M40 50 Q60 32 80 50 Z" fill="#a16207" stroke="#6b4410" stroke-width="1.5"/>';
      case "iron": return '<path d="M40 52 Q60 28 80 52 L80 56 L40 56 Z" fill="#cbd5e1" stroke="#64748b" stroke-width="2"/><rect x="56" y="48" width="8" height="14" rx="2" fill="#94a3b8"/>';
      case "wing": return '<path d="M40 52 Q60 26 80 52 L80 56 L40 56 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>' +
                          '<path d="M40 48 Q26 40 30 54 Q38 50 42 52 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>' +
                          '<path d="M80 48 Q94 40 90 54 Q82 50 78 52 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>';
      default:     return '<path d="M44 46 L50 34 L56 44 L60 30 L64 44 L70 34 L76 46 Z" fill="#f5c518" stroke="#b8860b" stroke-width="1.5"/>' +
                          '<circle cx="60" cy="34" r="2.6" fill="#ef4444"/>';
    }
  }

  // ---- 勇者まるごとのSVG ----
  function buildSVG(level) {
    var idx = Math.max(0, Math.min(MAX_LEVEL, level));
    var f = featuresOf(idx);

    var svg = '<svg viewBox="0 0 120 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">';
    svg += drawAura(f.aura);
    svg += drawCape(f.cape);
    svg += drawShield(f.shield);

    // 本体グループ (上下バウンド)
    svg += '<g class="h-body">';

    // 後ろ腕
    svg += '<g class="h-arm h-arm-b" style="transform-origin:46px 76px"><rect x="42" y="76" width="8" height="26" rx="4" fill="#e8b48a"/></g>';

    // 脚 (交互に振る)
    svg += '<g class="h-leg h-leg-a" style="transform-origin:54px 104px"><rect x="50" y="104" width="9" height="28" rx="4" fill="' + f.armorEdge + '"/><rect x="48" y="128" width="13" height="8" rx="3" fill="#3f2d1a"/></g>';
    svg += '<g class="h-leg h-leg-b" style="transform-origin:66px 104px"><rect x="61" y="104" width="9" height="28" rx="4" fill="' + f.armorEdge + '"/><rect x="59" y="128" width="13" height="8" rx="3" fill="#3f2d1a"/></g>';

    // 胴(鎧)
    svg += '<rect x="46" y="68" width="28" height="42" rx="9" fill="' + f.armor + '" stroke="' + f.armorEdge + '" stroke-width="2"/>';
    // 鎧の胸ライン
    svg += '<line x1="60" y1="72" x2="60" y2="104" stroke="' + f.armorEdge + '" stroke-width="1.5" opacity="0.6"/>';

    // 頭
    svg += '<circle cx="60" cy="50" r="18" fill="#f1c79e"/>';
    // 顔
    svg += '<circle cx="54" cy="50" r="2.1" fill="#3b2417"/><circle cx="66" cy="50" r="2.1" fill="#3b2417"/>';
    svg += '<path d="M55 58 Q60 61 65 58" stroke="#8a5a36" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
    // 髪
    svg += '<path d="M42 46 Q44 30 60 30 Q76 30 78 46 Q70 40 60 40 Q50 40 42 46 Z" fill="#5b3a1d"/>';
    // 兜
    svg += drawHelmet(f.helmet, f.armorEdge);

    // 前腕 + 武器
    svg += '<g class="h-arm h-arm-f" style="transform-origin:74px 76px">';
    svg += '<rect x="70" y="76" width="8" height="26" rx="4" fill="#e8b48a"/>';
    svg += '<g transform="translate(74,100)">' + drawWeapon(f.weapon) + '</g>';
    svg += '</g>';

    svg += '</g>'; // h-body
    svg += '</svg>';
    return svg;
  }

  // ---- 状態と描画 ----
  var spriteEl = null, lvEl = null, titleEl = null, popEl = null;
  var current = -1;

  function ensureRefs() {
    if (!spriteEl) spriteEl = document.getElementById("hero-sprite");
    if (!lvEl) lvEl = document.getElementById("hero-lv");
    if (!titleEl) titleEl = document.getElementById("hero-title");
    if (!popEl) popEl = document.getElementById("levelup-pop");
  }

  function render(level) {
    ensureRefs();
    if (!spriteEl) return;
    spriteEl.innerHTML = buildSVG(level);
    if (lvEl) lvEl.textContent = level <= 0 ? "Lv.—" : "Lv." + level;
    if (titleEl) titleEl.textContent = titleOf(level);
    current = level;
  }

  function showLevelUp(level) {
    ensureRefs();
    if (!popEl) return;
    popEl.textContent = "レベルアップ！ Lv." + level;
    popEl.hidden = false;
    popEl.classList.remove("show");
    // リフローを挟んでアニメ再生
    void popEl.offsetWidth;
    popEl.classList.add("show");
  }

  function titleOf(level) {
    var i = Math.max(0, Math.min(MAX_LEVEL, level));
    return TITLES[i];
  }

  function reset() { render(0); }

  function update(score) {
    var level = Math.max(0, Math.min(MAX_LEVEL, score));
    var leveledUp = level > current && current >= 0;
    render(level);
    if (leveledUp) showLevelUp(level);
  }

  return { MAX_LEVEL: MAX_LEVEL, reset: reset, update: update, titleOf: titleOf, svg: buildSVG };
})();
