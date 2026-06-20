# 📚 Collection Methods Quiz

Python の**コレクション型**（`list` / `dict` / `set` / `tuple` / `str`）のメソッドを
クイズ形式で学べる、スマホ対応の Web アプリです。バックエンド不要・静的ファイルのみで動きます。

## ✨ 特長

- **3つの出題形式**
  - 動作当て: メソッド → 動作を選ぶ
  - 名前当て: 動作 → メソッドを選ぶ
  - 出力予想: コード → 出力結果を選ぶ
- **選択肢は毎回ちがう**: 正解＋ダミーを出題のたびにプールから抽選・シャッフル。位置や顔ぶれで覚えられません。
- **出題範囲を選べる**: 型・形式・問題数を自由に組み合わせ。
- **直近の問題を避ける**: `localStorage` に履歴を保存し、出題の偏りを軽減。
- **スマホ最適化**: レスポンシブ + PWA（ホーム画面に追加可）。

## 🚀 ローカルでの動かし方

データを JS に埋め込んでいるため、`index.html` をブラウザで開くだけで動きます。

```bash
# 方法1: ファイルを直接開く
open index.html        # macOS

# 方法2: 簡易サーバー（推奨・PWAも確認できる）
python3 -m http.server 8000
# → http://localhost:8000 を開く
```

## 🌐 公開（GitHub Pages）

1. このディレクトリを GitHub リポジトリとして push
2. リポジトリの **Settings → Pages** を開く
3. **Source** で `main` ブランチ / `/ (root)` を選択して保存
4. 数十秒後 `https://<ユーザー名>.github.io/<リポジトリ名>/` で公開

## 🗂 構成

```
App/
├── index.html        画面の骨組み
├── css/style.css     スタイル（ダーク・モバイル優先）
├── js/
│   ├── data.js       メソッド定義（ここに追記すれば出題が増える）
│   └── app.js        クイズの出題・採点ロジック
├── manifest.json     PWA 設定
├── icon.svg          アプリアイコン
└── README.md
```

## ➕ メソッドを追加するには

`js/data.js` の配列に1要素追加するだけです。

```js
{ type: "list", name: "append", signature: "list.append(x)", category: "追加",
  mutating: true, returns: "None",
  description: "末尾に要素を1つ追加する",
  example: "lst = [1, 2]\nlst.append(3)\nprint(lst)", result: "[1, 2, 3]" }
```

## 🛣 今後の拡張案

- リファレンス／フラッシュカードモード
- Pyodide による「プレイグラウンド」（ブラウザ内で本物の Python 実行）
- 苦手メソッドの重点出題

---
Made for learning Python collection methods.
