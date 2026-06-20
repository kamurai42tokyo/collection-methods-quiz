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

  // 各パーツの段階を idx(=level 0..20) から決定 (かわいいチビ勇者・累積進化)
  function featuresOf(idx) {
    return {
      armor:     pick(idx, [[3, "#9c6b3f"], [6, "#a8843c"], [9, "#9aa6b2"], [12, "#cdd6df"], [16, "#f5c518"], [20, "#ffe98a"]]),
      armorEdge: pick(idx, [[3, "#6e4a28"], [6, "#7a5e25"], [9, "#5f6b78"], [12, "#94a3b8"], [16, "#b8860b"], [20, "#d4a017"]]),
      weapon:    pick(idx, [[1, "wood"], [4, "bronze"], [8, "iron"], [11, "steel"], [14, "glow"], [17, "flame"], [20, "legend"]]),
      helmet:    pick(idx, [[1, "none"], [5, "cap"], [10, "iron"], [15, "wing"], [20, "crown"]]),
      cape:      pick(idx, [[6, "none"], [11, "red"], [16, "purple"], [20, "gold"]]),
      aura:      pick(idx, [[11, "none"], [14, "faint"], [17, "glow"], [19, "strong"], [20, "storm"]])
    };
  }

  // ---- パーツ描画 (SVG文字列。viewBox 0 0 100 120) ----
  function drawAura(a) {
    if (a === "none") return "";
    var map = {
      faint:  { r: 42, op: 0.16 },
      glow:   { r: 45, op: 0.24 },
      strong: { r: 48, op: 0.34 },
      storm:  { r: 52, op: 0.45 }
    }[a];
    return '<circle class="h-aura" cx="50" cy="62" r="' + map.r + '" fill="#fde68a" opacity="' + map.op + '"/>';
  }

  function drawSparks(a) {
    if (a !== "strong" && a !== "storm") return "";
    var pts = [[20, 40], [80, 44], [26, 92], [78, 88], [50, 16]];
    var s = "";
    for (var i = 0; i < pts.length; i++) {
      s += '<circle class="h-spark" cx="' + pts[i][0] + '" cy="' + pts[i][1] + '" r="2.2" fill="#fff7d6" style="animation-delay:' + (i * 0.18) + 's"/>';
    }
    return s;
  }

  function drawCape(c) {
    if (c === "none") return "";
    var col = { red: "#dc2626", purple: "#7c3aed", gold: "#f5c518" }[c];
    return '<path class="h-cape" d="M36 50 Q28 84 36 100 L64 100 Q72 84 64 50 Z" fill="' + col + '" stroke="rgba(0,0,0,.3)" stroke-width="1.5"/>';
  }

  function drawWeapon(w) {
    // 前腕の手元 translate(70,60) を原点に、上向きに刃を立てる
    switch (w) {
      case "wood":   return '<rect x="-1.5" y="-26" width="3" height="28" rx="1.5" fill="#9a6b3f"/>';
      case "bronze": return '<rect x="-2" y="-28" width="4" height="26" rx="1.5" fill="#cd7f32"/><rect x="-6" y="-2" width="12" height="3" rx="1.5" fill="#7c4a12"/>';
      case "iron":   return '<polygon points="0,-34 3,-28 3,-2 -3,-2 -3,-28" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/><rect x="-7" y="-2" width="14" height="3" rx="1.5" fill="#475569"/>';
      case "steel":  return '<polygon points="0,-38 3.4,-31 3.4,-2 -3.4,-2 -3.4,-31" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.2"/><rect x="-8" y="-2" width="16" height="3.4" rx="1.5" fill="#475569"/>';
      case "glow":   return '<polygon points="0,-40 3.5,-32 3.5,-2 -3.5,-2 -3.5,-32" fill="#bae6fd" stroke="#38bdf8" stroke-width="1.5"/><rect x="-8" y="-2" width="16" height="3.5" rx="1.5" fill="#0ea5e9"/>';
      case "flame":  return '<polygon points="0,-44 4,-34 4,-2 -4,-2 -4,-34" fill="#fb923c" stroke="#ea580c" stroke-width="1.5"/><polygon points="0,-50 3,-42 -3,-42" fill="#fde047"/><rect x="-9" y="-2" width="18" height="4" rx="2" fill="#7c2d12"/>';
      default:       return '<polygon points="0,-46 5,-35 5,-2 -5,-2 -5,-35" fill="#fde68a" stroke="#f5c518" stroke-width="2"/><polygon points="0,-52 4,-44 -4,-44" fill="#fffbeb"/><rect x="-10" y="-2" width="20" height="4" rx="2" fill="#b8860b"/>';
    }
  }

  function drawHelmet(h) {
    switch (h) {
      case "none": return "";
      case "cap":  return '<path d="M30 26 Q50 6 70 26 Z" fill="#a8843c" stroke="#7a5e25" stroke-width="1.5"/>';
      case "iron": return '<path d="M30 26 Q50 4 70 26 L70 30 L30 30 Z" fill="#cdd6df" stroke="#94a3b8" stroke-width="2"/><rect x="47" y="26" width="6" height="12" rx="2" fill="#b9c4cf"/>';
      case "wing": return '<path d="M30 26 Q50 2 70 26 L70 30 L30 30 Z" fill="#e6edf3" stroke="#94a3b8" stroke-width="2"/>' +
                          '<path d="M30 22 Q16 14 20 26 Q27 22 32 24 Z" fill="#fff"/>' +
                          '<path d="M70 22 Q84 14 80 26 Q73 22 68 24 Z" fill="#fff"/>';
      default:     return '<path d="M34 20 L40 8 L46 18 L50 5 L54 18 L60 8 L66 20 Z" fill="#f5c518" stroke="#b8860b" stroke-width="1.5"/>' +
                          '<circle cx="50" cy="9" r="2.4" fill="#ef4444"/>';
    }
  }

  // ---- 勇者まるごとのSVG (かわいいチビ・常時歩行) ----
  function buildSVG(level) {
    var idx = Math.max(0, Math.min(MAX_LEVEL, level));
    var f = featuresOf(idx);
    var armor = f.armor, edge = f.armorEdge;

    var svg = '<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">';
    svg += drawAura(f.aura);

    // 本体 (全体が上下バウンド＆わずかに左右に揺れる)
    svg += '<g class="h-body">';

    svg += drawCape(f.cape); // 背中 (本体と一緒に動き、独自に揺れる)

    // 脚 (上下にステップ。足が常に地面付近に残るので外れて見えない)
    svg += '<g class="h-leg h-leg-a"><rect x="40" y="86" width="9" height="20" rx="4.5" fill="' + edge + '"/><ellipse cx="44.5" cy="107" rx="6" ry="4" fill="#3f2d1a"/></g>';
    svg += '<g class="h-leg h-leg-b"><rect x="51" y="86" width="9" height="20" rx="4.5" fill="' + edge + '"/><ellipse cx="55.5" cy="107" rx="6" ry="4" fill="#3f2d1a"/></g>';

    // 後ろ腕 (肩を軸に小さく前後に振る)
    svg += '<g class="h-arm h-arm-b"><rect x="26" y="60" width="8" height="20" rx="4" fill="' + armor + '" stroke="' + edge + '" stroke-width="1.5"/></g>';

    // 胴 (一続きの卵形シルエット＋アウトライン)
    svg += '<path d="M50 44 C66 44 70 60 70 76 C70 92 60 96 50 96 C40 96 30 92 30 76 C30 60 34 44 50 44 Z" fill="' + armor + '" stroke="' + edge + '" stroke-width="2.5"/>';
    svg += '<path d="M50 52 L50 92" stroke="' + edge + '" stroke-width="1.5" opacity="0.5"/>';

    // 頭・髪
    svg += '<circle cx="50" cy="30" r="20" fill="#f3d2a8" stroke="#d9a87a" stroke-width="1.5"/>';
    svg += '<path d="M30 30 Q30 10 50 10 Q70 10 70 30 Q60 22 50 22 Q40 22 30 30 Z" fill="#6b4423"/>';
    // 顔 (つぶらな目・ハイライト・ほっぺ・やさしい口)
    svg += '<ellipse cx="43" cy="32" rx="2.6" ry="3.2" fill="#3b2417"/><ellipse cx="57" cy="32" rx="2.6" ry="3.2" fill="#3b2417"/>';
    svg += '<circle cx="42" cy="31" r="0.9" fill="#fff"/><circle cx="56" cy="31" r="0.9" fill="#fff"/>';
    svg += '<circle cx="38" cy="38" r="2.4" fill="#f0a59a" opacity="0.6"/><circle cx="62" cy="38" r="2.4" fill="#f0a59a" opacity="0.6"/>';
    svg += '<path d="M46 39 Q50 42 54 39" stroke="#b3724e" stroke-width="1.4" fill="none" stroke-linecap="round"/>';
    // 兜
    svg += drawHelmet(f.helmet);

    // 前腕＋武器 (剣は構えたまま＝歩行中も静止。手足の浮きを防ぐ)
    svg += '<g class="h-arm h-arm-f"><rect x="66" y="60" width="8" height="20" rx="4" fill="' + armor + '" stroke="' + edge + '" stroke-width="1.5"/>';
    svg += '<g transform="translate(70,60)">' + drawWeapon(f.weapon) + '</g></g>';

    svg += '</g>'; // h-body
    svg += drawSparks(f.aura); // きらめき (最前面)
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
