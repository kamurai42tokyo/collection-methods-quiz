/*
 * Collection Methods Quiz - アプリ本体
 * -----------------------------------
 * 設計の要点:
 *  - 選択肢は固定で持たず、出題のたびに「正解 + ダミー」をプールから動的抽選し
 *    シャッフルして提示する → 毎回顔ぶれ・並びが変わる。
 *  - ダミーは同じ型を優先して抽出し、難度と学習効果を高める。
 *  - 直近に出した問題は localStorage に記録し、しばらく再出題を避ける。
 */

(function () {
  "use strict";

  var DATA = window.METHOD_DATA || [];

  // 出題形式の定義
  var MODES = [
    { key: "describe", label: "動作当て" }, // メソッド → 説明文を選ぶ
    { key: "name", label: "名前当て" },     // 説明文 → メソッドを選ぶ
    { key: "output", label: "出力予想" }    // コード → 出力を選ぶ
  ];

  var TYPES = ["list", "dict", "set", "tuple", "str"];
  var RECENT_KEY = "cmq_recent";   // 直近出題の保存キー
  var RECENT_MAX = 8;              // 何問ぶん再出題を避けるか

  // ------- 状態 -------
  var state = {
    selectedTypes: new Set(TYPES),
    selectedModes: new Set(["describe", "name", "output"]),
    questions: [],
    index: 0,
    score: 0,
    answered: false
  };

  // ------- ユーティリティ -------
  function $(id) { return document.getElementById(id); }

  // Fisher-Yates シャッフル
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function sample(arr, n) { return shuffle(arr).slice(0, n); }

  function methodId(m) { return m.type + "." + m.name; }

  function getRecent() {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; }
    catch (e) { return []; }
  }

  function pushRecent(id) {
    var recent = getRecent();
    recent.push(id);
    while (recent.length > RECENT_MAX) recent.shift();
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(recent)); } catch (e) {}
  }

  // ------- 出題プール構築 -------
  function buildPool() {
    return DATA.filter(function (m) { return state.selectedTypes.has(m.type); });
  }

  // 1問を生成する。pool から正解を選び、形式に応じて選択肢を動的に作る。
  function makeQuestion(pool, recentSet) {
    // 直近に出していない候補を優先
    var fresh = pool.filter(function (m) { return !recentSet.has(methodId(m)); });
    var candidates = fresh.length >= 1 ? fresh : pool;
    var answer = sample(candidates, 1)[0];

    var modeKey = sample(Array.from(state.selectedModes), 1)[0];
    var mode = MODES.filter(function (m) { return m.key === modeKey; })[0];

    // ダミー候補: 正解と別メソッド。同じ型を優先。
    var others = pool.filter(function (m) { return methodId(m) !== methodId(answer); });

    var q = { mode: mode, answer: answer };

    if (modeKey === "describe") {
      // 問題: メソッドの動作は? / 選択肢: 説明文
      q.questionText = answer.signature + " の動作は?";
      q.code = null;
      q.distractorPool = dedupeBy(others, "description");
      q.correctText = answer.description;
      q.optionField = "description";
    } else if (modeKey === "name") {
      // 問題: この動作をするメソッドは? / 選択肢: メソッド名(signature)
      q.questionText = "「" + answer.description + "」を行うメソッドは?";
      q.code = null;
      q.distractorPool = dedupeBy(others, "signature");
      q.correctText = answer.signature;
      q.optionField = "signature";
      q.mono = true;
    } else {
      // 問題: このコードの出力は? / 選択肢: 出力結果
      q.questionText = "次のコードの出力は?";
      q.code = answer.example;
      // 出力が同じ値(True等)はダミーにならないよう、結果が異なるものから抽出
      q.distractorPool = others.filter(function (m) { return m.result !== answer.result; });
      q.distractorPool = dedupeBy(q.distractorPool, "result");
      q.correctText = answer.result;
      q.optionField = "result";
      q.mono = true;
    }

    // 選択肢を組み立て: 正解 + ダミー3
    // まず選択中の型から抽選し、足りなければ全データから補充して必ず4択にする
    // (例: set + 出力予想 のみだと結果が True などに偏り、選択肢が不足しうる)
    var globalOthers = DATA.filter(function (m) { return methodId(m) !== methodId(answer); });
    if (modeKey === "output") {
      globalOthers = globalOthers.filter(function (m) { return m.result !== answer.result; });
    }
    var distractors = sample(q.distractorPool, 3).map(function (m) { return m[q.optionField]; });
    distractors = ensureCount(distractors, q.correctText, [others, globalOthers], q.optionField, 3);

    q.options = shuffle([q.correctText].concat(distractors));
    return q;
  }

  // 同じテキストの重複を除いた配列を返す
  function dedupeBy(arr, field) {
    var seen = {};
    var out = [];
    arr.forEach(function (m) {
      var v = m[field];
      if (!seen[v]) { seen[v] = true; out.push(m); }
    });
    return out;
  }

  // ダミーが need 個に満たない場合、pools を順に試して重複しないよう補充する
  // pools: 候補メソッド配列の配列 (先に渡したものを優先)
  function ensureCount(distractors, correct, pools, field, need) {
    var set = {};
    set[correct] = true;
    var result = [];
    distractors.forEach(function (d) { if (!set[d]) { set[d] = true; result.push(d); } });
    for (var p = 0; p < pools.length && result.length < need; p++) {
      var extra = shuffle(pools[p]);
      for (var i = 0; i < extra.length && result.length < need; i++) {
        var v = extra[i][field];
        if (!set[v]) { set[v] = true; result.push(v); }
      }
    }
    return result.slice(0, need);
  }

  // ------- クイズ進行 -------
  function startQuiz() {
    var pool = buildPool();
    var count = parseInt($("question-count").value, 10);
    var recentSet = new Set(getRecent());

    state.questions = [];
    for (var i = 0; i < count; i++) {
      var q = makeQuestion(pool, recentSet);
      state.questions.push(q);
      recentSet.add(methodId(q.answer)); // 同一セット内の連続重複も避ける
    }
    state.index = 0;
    state.score = 0;
    showScreen("quiz-screen");
    renderQuestion();
  }

  function renderQuestion() {
    state.answered = false;
    var q = state.questions[state.index];
    var total = state.questions.length;

    $("progress").textContent = (state.index + 1) + " / " + total;
    $("score").textContent = "正解 " + state.score;
    $("progress-fill").style.width = ((state.index) / total * 100) + "%";
    $("q-tag").textContent = q.mode.label;
    $("question-text").textContent = q.questionText;

    var codeEl = $("question-code");
    if (q.code) { codeEl.textContent = q.code; codeEl.hidden = false; }
    else { codeEl.hidden = true; }

    var choicesEl = $("choices");
    choicesEl.innerHTML = "";
    q.options.forEach(function (opt) {
      var btn = document.createElement("button");
      btn.className = "choice" + (q.mono ? " mono" : "");
      btn.textContent = opt;
      btn.addEventListener("click", function () { onAnswer(btn, opt, q); });
      choicesEl.appendChild(btn);
    });

    $("feedback").hidden = true;
    $("next-btn").hidden = true;
  }

  function onAnswer(btn, chosen, q) {
    if (state.answered) return;
    state.answered = true;

    var isCorrect = chosen === q.correctText;
    if (isCorrect) state.score++;
    pushRecent(methodId(q.answer));

    // 全選択肢を無効化し、正解/不正解を着色
    var buttons = $("choices").querySelectorAll(".choice");
    buttons.forEach(function (b) {
      b.disabled = true;
      if (b.textContent === q.correctText) b.classList.add("correct");
      else if (b === btn) b.classList.add("wrong");
    });

    // 解説
    var fb = $("feedback");
    var a = q.answer;
    fb.innerHTML =
      '<span class="verdict ' + (isCorrect ? "ok" : "ng") + '">' +
      (isCorrect ? "正解!" : "不正解") + '</span> ' +
      '<code>' + escapeHtml(a.signature) + '</code>' +
      '<div class="explain">' + escapeHtml(a.description) +
      '（戻り値: ' + escapeHtml(a.returns) + ' / ' +
      (a.mutating ? "破壊的: 元を変更する" : "非破壊的: 元は変わらない") + '）</div>';
    fb.hidden = false;

    $("score").textContent = "正解 " + state.score;

    var nextBtn = $("next-btn");
    nextBtn.textContent = (state.index + 1 < state.questions.length) ? "次の問題 →" : "結果を見る →";
    nextBtn.hidden = false;
  }

  function nextQuestion() {
    state.index++;
    if (state.index < state.questions.length) renderQuestion();
    else showResult();
  }

  function showResult() {
    showScreen("result-screen");
    var total = state.questions.length;
    var pct = Math.round(state.score / total * 100);
    $("result-score").textContent = state.score + " / " + total;
    var msg;
    if (pct === 100) msg = "満点! 完璧です 🎉";
    else if (pct >= 80) msg = "good! あと少しで満点 💪";
    else if (pct >= 50) msg = "その調子。解説を見て復習しよう 📖";
    else msg = "まずはリファレンスで確認してみよう 🌱";
    $("result-message").textContent = "正答率 " + pct + "% — " + msg;
  }

  // ------- 画面切替 -------
  function showScreen(id) {
    ["start-screen", "quiz-screen", "result-screen"].forEach(function (s) {
      $(s).hidden = (s !== id);
    });
    window.scrollTo(0, 0);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // ------- フィルタUI -------
  function renderFilters() {
    var typeBox = $("type-filters");
    TYPES.forEach(function (t) {
      var chip = makeChip(t, state.selectedTypes.has(t), function (on) {
        if (on) state.selectedTypes.add(t); else state.selectedTypes.delete(t);
      });
      typeBox.appendChild(chip);
    });

    var modeBox = $("mode-filters");
    MODES.forEach(function (m) {
      var chip = makeChip(m.label, state.selectedModes.has(m.key), function (on) {
        if (on) state.selectedModes.add(m.key); else state.selectedModes.delete(m.key);
      });
      modeBox.appendChild(chip);
    });
  }

  function makeChip(label, pressed, onToggle) {
    var chip = document.createElement("button");
    chip.className = "chip";
    chip.type = "button";
    chip.textContent = label;
    chip.setAttribute("aria-pressed", pressed ? "true" : "false");
    chip.addEventListener("click", function () {
      var now = chip.getAttribute("aria-pressed") !== "true";
      chip.setAttribute("aria-pressed", now ? "true" : "false");
      onToggle(now);
    });
    return chip;
  }

  function validateStart() {
    if (state.selectedTypes.size === 0 || state.selectedModes.size === 0) {
      $("start-error").hidden = false;
      return false;
    }
    // 選んだ型にデータがあるか
    if (buildPool().length < 4) {
      $("start-error").textContent = "選んだ範囲のメソッドが少なすぎます。型を増やしてください。";
      $("start-error").hidden = false;
      return false;
    }
    $("start-error").hidden = true;
    return true;
  }

  // ------- 初期化 -------
  function init() {
    renderFilters();
    $("start-btn").addEventListener("click", function () {
      if (validateStart()) startQuiz();
    });
    $("next-btn").addEventListener("click", nextQuestion);
    $("retry-btn").addEventListener("click", startQuiz);
    $("home-btn").addEventListener("click", function () { showScreen("start-screen"); });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
