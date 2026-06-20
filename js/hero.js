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

  // 色を f 倍に暗く (0<f<1)。アウトライン色などの自動生成に使う
  function shade(hex, f) {
    var n = parseInt(hex.slice(1), 16);
    var r = Math.round(((n >> 16) & 255) * f);
    var g = Math.round(((n >> 8) & 255) * f);
    var b = Math.round((n & 255) * f);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  /* 各レベル(0..20)の見た目仕様 (勇者_ビジュ案 準拠)
   * outfit/edge : 装備の色 / アウトライン
   * head        : none(髪のみ) / band(鉢巻) / cap(革帽) / helm(兜,helmC指定) / crown(王冠) / halo(光輪)
   * weapon      : none / wood / iron / dual(二刀流) / club(棍棒) / sword(blade,bladeLen指定)
   * cape        : マントの色 (null=なし)
   * aura        : none / flame(紅蓮) / holy(聖光) / red(赤光) / redspark(赤光+火花) / green(緑光) / rainbow(虹)
   */
  var LEVELS = [
    /* 0  村人        */ { outfit: "#9c6b3f", edge: "#6e4a28", head: "none", weapon: "none",  cape: null,      aura: "none" },
    /* 1  みならい戦士 */ { outfit: "#a0703f", edge: "#6e4a28", head: "band", weapon: "none",  cape: null,      aura: "none" },
    /* 2  かけだし戦士 */ { outfit: "#a0703f", edge: "#6e4a28", head: "band", weapon: "wood",  cape: null,      aura: "none" },
    /* 3  戦士        */ { outfit: "#a0703f", edge: "#6e4a28", head: "band", weapon: "iron",  cape: null,      aura: "none" },
    /* 4  熟練の戦士   */ { outfit: "#a0703f", edge: "#6e4a28", head: "band", weapon: "dual",  cape: null,      aura: "none" },
    /* 5  重戦士      */ { outfit: "#8a6a4a", edge: "#5e4830", head: "band", weapon: "club",  cape: null,      aura: "none" },
    /* 6  見習い騎士   */ { outfit: "#a8843c", edge: "#7a5e25", head: "cap",  weapon: "sword", blade: "#e9eef4", bladeLen: 32, cape: "#7a4a2a", aura: "none" },
    /* 7  騎士        */ { outfit: "#9aa6b2", edge: "#5f6b78", head: "helm", helmC: "#cdd6df", weapon: "sword", blade: "#e9eef4", bladeLen: 34, cape: "#b33b3b", aura: "none" },
    /* 8  上級騎士     */ { outfit: "#9db6d6", edge: "#5b7299", head: "helm", helmC: "#bcd0ea", weapon: "sword", blade: "#eaf1fb", bladeLen: 34, cape: "#3b5bb3", aura: "none" },
    /* 9  近衛騎士     */ { outfit: "#cfa0a5", edge: "#8f5f63", head: "helm", helmC: "#e3b9bd", weapon: "sword", blade: "#f3e3e4", bladeLen: 34, cape: "#7a1f1f", aura: "none" },
    /* 10 聖騎士      */ { outfit: "#e9edf2", edge: "#b6c0cc", head: "helm", helmC: "#f4f7fa", weapon: "sword", blade: "#ffffff", bladeLen: 34, cape: "#e6c84d", aura: "none" },
    /* 11 勇者見習い   */ { outfit: "#cdd6df", edge: "#94a3b8", head: "none", weapon: "none",  cape: "#4a63b0", aura: "none" },
    /* 12 勇者        */ { outfit: "#cdd6df", edge: "#94a3b8", head: "none", weapon: "sword", blade: "#dfe6ec", bladeLen: 36, cape: "#4a63b0", aura: "none" },
    /* 13 上級勇者     */ { outfit: "#f5c518", edge: "#b8860b", head: "none", weapon: "sword", blade: "#fde68a", bladeLen: 38, cape: "#7c3aed", aura: "none" },
    /* 14 紅蓮の勇者   */ { outfit: "#f5c518", edge: "#b8860b", head: "none", weapon: "sword", blade: "#fde68a", bladeLen: 38, cape: "#7c3aed", aura: "flame" },
    /* 15 聖光の勇者   */ { outfit: "#f7d96a", edge: "#caa017", head: "none", weapon: "sword", blade: "#fff3bf", bladeLen: 38, cape: "#f5c518", aura: "holy" },
    /* 16 王者        */ { outfit: "#f7d96a", edge: "#caa017", head: "crown", weapon: "sword", blade: "#fff3bf", bladeLen: 38, cape: "#f5c518", aura: "holy" },
    /* 17 覇王        */ { outfit: "#cdd6df", edge: "#94a3b8", head: "crown", weapon: "sword", blade: "#eef2f6", bladeLen: 38, cape: "#a32b2b", aura: "red" },
    /* 18 竜殺し      */ { outfit: "#cdd6df", edge: "#94a3b8", head: "crown", weapon: "sword", blade: "#eef2f6", bladeLen: 38, cape: "#a32b2b", aura: "redspark" },
    /* 19 救世主      */ { outfit: "#f5c518", edge: "#b8860b", head: "halo",  weapon: "sword", blade: "#fde68a", bladeLen: 38, cape: "#2f9e57", aura: "green" },
    /* 20 伝説の勇者   */ { outfit: "#f5c518", edge: "#b8860b", head: "crown", weapon: "sword", blade: "#fff3bf", bladeLen: 40, cape: "#2f9e57", aura: "rainbow" }
  ];

  function featuresOf(idx) {
    return LEVELS[Math.max(0, Math.min(MAX_LEVEL, idx))];
  }

  // ---- パーツ描画 (SVG文字列。viewBox 0 0 100 120) ----
  // 背後のオーラ (光・炎のグロー)
  function drawAuraBack(f, uid) {
    switch (f.aura) {
      case "flame":    return '<circle class="h-aura" cx="50" cy="64" r="46" fill="#f97316" opacity="0.2"/>';
      case "holy":     return '<circle class="h-aura" cx="50" cy="58" r="50" fill="#fff3bf" opacity="0.4"/>';
      case "red":      return '<circle class="h-aura" cx="50" cy="60" r="48" fill="#ef4444" opacity="0.32"/>';
      case "redspark": return '<circle class="h-aura" cx="50" cy="60" r="50" fill="#ef4444" opacity="0.36"/>';
      case "green":    return '<circle class="h-aura" cx="50" cy="60" r="48" fill="#22c55e" opacity="0.34"/>';
      case "rainbow":  return '<defs><radialGradient id="rb' + uid + '" cx="50%" cy="55%" r="62%">' +
                              '<stop offset="0%" stop-color="#86efac"/><stop offset="38%" stop-color="#fde68a"/>' +
                              '<stop offset="68%" stop-color="#67e8f9"/><stop offset="100%" stop-color="#c084fc"/></radialGradient></defs>' +
                              '<circle class="h-aura" cx="50" cy="58" r="54" fill="url(#rb' + uid + ')" opacity="0.5"/>';
      default:         return "";
    }
  }

  // 前面の炎 (紅蓮の勇者)
  function drawFlame(f) {
    if (f.aura !== "flame") return "";
    var pos = [[28, 98], [72, 98], [22, 80], [78, 80], [50, 105]];
    var s = "";
    for (var i = 0; i < pos.length; i++) {
      var x = pos[i][0], y = pos[i][1], d = (i * 0.12);
      s += '<path class="h-flame" style="animation-delay:' + d + 's" d="M' + x + ' ' + y + ' C ' + (x - 7) + ' ' + (y - 9) + ' ' + (x - 3) + ' ' + (y - 17) + ' ' + x + ' ' + (y - 21) + ' C ' + (x + 3) + ' ' + (y - 17) + ' ' + (x + 7) + ' ' + (y - 9) + ' ' + x + ' ' + y + ' Z" fill="#ef4444"/>';
      s += '<path class="h-flame" style="animation-delay:' + d + 's" d="M' + x + ' ' + y + ' C ' + (x - 4) + ' ' + (y - 6) + ' ' + (x - 2) + ' ' + (y - 12) + ' ' + x + ' ' + (y - 15) + ' C ' + (x + 2) + ' ' + (y - 12) + ' ' + (x + 4) + ' ' + (y - 6) + ' ' + x + ' ' + y + ' Z" fill="#fbbf24"/>';
    }
    return s;
  }

  // きらめき (竜殺し・伝説)
  function drawSparks(f) {
    if (f.aura !== "redspark" && f.aura !== "rainbow") return "";
    var col = f.aura === "rainbow" ? "#ffffff" : "#ffd9d9";
    var pts = [[20, 40], [80, 44], [26, 92], [78, 88], [50, 16], [14, 64], [86, 64]];
    var s = "";
    for (var i = 0; i < pts.length; i++) {
      s += '<circle class="h-spark" cx="' + pts[i][0] + '" cy="' + pts[i][1] + '" r="2.2" fill="' + col + '" style="animation-delay:' + (i * 0.15) + 's"/>';
    }
    return s;
  }

  function drawCape(c) {
    if (!c) return "";
    return '<path class="h-cape" d="M36 50 Q28 84 36 100 L64 100 Q72 84 64 50 Z" fill="' + c + '" stroke="rgba(0,0,0,.3)" stroke-width="1.5"/>';
  }

  // 上向きの剣 (手元 translate(x,60) を原点に)
  function drawSword(blade, len) {
    var e = shade(blade, 0.72);
    return '<polygon points="0,-' + len + ' 3.2,-' + (len - 7) + ' 3.2,-2 -3.2,-2 -3.2,-' + (len - 7) + '" fill="' + blade + '" stroke="' + e + '" stroke-width="1"/>' +
      '<rect x="-7" y="-2.5" width="14" height="3.2" rx="1.6" fill="#5b3a1a"/>' +
      '<rect x="-1.6" y="0" width="3.4" height="7" rx="1.5" fill="#5b3a1a"/>';
  }

  function drawClub() {
    return '<rect x="-2.2" y="-2" width="4.4" height="18" rx="2" fill="#7c4a12"/>' +
      '<ellipse cx="0" cy="-16" rx="9" ry="8.5" fill="#9aa0a6" stroke="#5b6066" stroke-width="1.5"/>' +
      '<circle cx="0" cy="-24" r="1.7" fill="#5b6066"/><circle cx="-7" cy="-16" r="1.7" fill="#5b6066"/>' +
      '<circle cx="7" cy="-16" r="1.7" fill="#5b6066"/><circle cx="0" cy="-8" r="1.7" fill="#5b6066"/>';
  }

  // 武器コード → SVG (手元原点)
  function weaponSVG(f) {
    switch (f.weapon) {
      case "wood":  return drawSword("#9a6b3f", 26);
      case "iron":  return drawSword("#cbd5e1", 32);
      case "dual":  return drawSword("#e2e8f0", 32);
      case "club":  return drawClub();
      case "sword": return drawSword(f.blade, f.bladeLen || 34);
      default:      return "";
    }
  }

  function drawHead(f) {
    switch (f.head) {
      case "band":  return '<rect x="30" y="22" width="40" height="5" rx="2.5" fill="#c0392b"/><rect x="67" y="23" width="4" height="9" rx="2" fill="#a92f22"/>';
      case "cap":   return '<path d="M30 26 Q50 6 70 26 Z" fill="#8a5a2a" stroke="#5e3c19" stroke-width="1.5"/>';
      case "helm":  var c = f.helmC, e = shade(c, 0.72);
                    return '<path d="M30 26 Q50 4 70 26 L70 30 L30 30 Z" fill="' + c + '" stroke="' + e + '" stroke-width="2"/>' +
                           '<rect x="47" y="26" width="6" height="13" rx="2" fill="' + c + '" stroke="' + e + '" stroke-width="0.8"/>';
      case "crown": return '<path d="M33 20 L40 7 L46 17 L50 4 L54 17 L60 7 L67 20 Z" fill="#f5c518" stroke="#b8860b" stroke-width="1.5"/>' +
                           '<circle cx="50" cy="8" r="2.4" fill="#ef4444"/><circle cx="40" cy="9" r="1.5" fill="#38bdf8"/><circle cx="60" cy="9" r="1.5" fill="#38bdf8"/>';
      case "halo":  return '<ellipse class="h-halo" cx="50" cy="6" rx="15" ry="4.5" fill="none" stroke="#86efac" stroke-width="3"/>';
      default:      return "";
    }
  }

  var uidSeq = 0;

  // ---- 勇者まるごとのSVG (かわいいチビ・常時歩行) ----
  function buildSVG(level) {
    var idx = Math.max(0, Math.min(MAX_LEVEL, level));
    var f = featuresOf(idx);
    var armor = f.outfit, edge = f.edge;
    var uid = (++uidSeq);
    var dual = f.weapon === "dual";
    var hasWeapon = f.weapon && f.weapon !== "none";

    var svg = '<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">';
    svg += drawAuraBack(f, uid);

    // 本体 (全体が上下バウンド＆わずかに左右に揺れる)
    svg += '<g class="h-body">';

    svg += drawCape(f.cape);

    // 脚 (上下にステップ。足が地面付近に残るので外れて見えない)
    svg += '<g class="h-leg h-leg-a"><rect x="40" y="86" width="9" height="20" rx="4.5" fill="' + edge + '"/><ellipse cx="44.5" cy="107" rx="6" ry="4" fill="#3f2d1a"/></g>';
    svg += '<g class="h-leg h-leg-b"><rect x="51" y="86" width="9" height="20" rx="4.5" fill="' + edge + '"/><ellipse cx="55.5" cy="107" rx="6" ry="4" fill="#3f2d1a"/></g>';

    // 後ろ腕 (二刀流なら剣を持って静止、それ以外は肩を軸に小さく振る)
    if (dual) {
      svg += '<g class="h-arm"><rect x="26" y="60" width="8" height="20" rx="4" fill="' + armor + '" stroke="' + edge + '" stroke-width="1.5"/>' +
             '<g transform="translate(30,60)">' + drawSword("#e2e8f0", 32) + '</g></g>';
    } else {
      svg += '<g class="h-arm h-arm-b"><rect x="26" y="60" width="8" height="20" rx="4" fill="' + armor + '" stroke="' + edge + '" stroke-width="1.5"/></g>';
    }

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
    // 頭装備 (鉢巻/帽子/兜/王冠/光輪)
    svg += drawHead(f);

    // 前腕 (武器を持つなら静止して構える。武器なしなら腕を振る)
    if (hasWeapon) {
      svg += '<g class="h-arm h-arm-f"><rect x="66" y="60" width="8" height="20" rx="4" fill="' + armor + '" stroke="' + edge + '" stroke-width="1.5"/>' +
             '<g transform="translate(70,60)">' + weaponSVG(f) + '</g></g>';
    } else {
      svg += '<g class="h-arm h-arm-f-swing"><rect x="66" y="60" width="8" height="20" rx="4" fill="' + armor + '" stroke="' + edge + '" stroke-width="1.5"/></g>';
    }

    svg += '</g>'; // h-body
    svg += drawFlame(f);  // 炎 (前面)
    svg += drawSparks(f); // きらめき (最前面)
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
