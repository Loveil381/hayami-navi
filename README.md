# 便利ツール集 (Hayami-Navi)

日本の暮らしに役立つ計算・早見ツールを集めた静的ウェブサイト。

🔗 https://hayami-navi.com

## ツール一覧
- 📅 年齢早見表
- 🔄 西暦⇔和暦変換
- 🐉 干支早見表
- 🎓 入学・卒業年度計算
- ⛩️ 厄年早見表

## 開発

### 必要なもの
- Node.js 18+

### ビルド
```bash
npm run build       # 全ページをビルド
npm run validate    # ビルド結果を検証
```

### ディレクトリ構造
```
src/
  pages/         — ページテンプレート（編集対象）
  partials/      — 共通パーツ（head, header, footer）
  css/           — スタイルシート
  js/            — 共有JavaScript
  data/          — 設定・データファイル
scripts/         — ビルド・検証スクリプト
build.js         — ビルドスクリプト
*.html (root)    — ビルド出力（直接編集禁止）
```

### 年度更新
`src/data/config.json` の `currentYear` を更新して `npm run build` を実行するだけ。