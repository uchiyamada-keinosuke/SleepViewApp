# 睡眠ステージ × 室温・湿度ビューア

自分の端末・PCから、パスワードでログインして見られる個人用Webアプリです。
Cloudflare Pages（+ Functions）にデプロイします。

## 構成

```
sleep-viz/
├─ index.html              アプリ本体（要ログイン）
├─ login.html              ログイン画面
├─ functions/
│  ├─ _middleware.js       全ページの認証ゲート
│  └─ api/
│     ├─ login.js          パスワード照合→Cookie発行
│     └─ logout.js         ログアウト
└─ data/                   サンプルCSV（アップロードの見本）
   ├─ sleep.csv
   └─ env.csv
```

データはCSVをアプリ画面からアップロードして読み込みます（サーバーには保存されず、
その端末のブラウザに保存）。睡眠ステージCSVと温度・湿度CSVは別々のボタンで取り込みます。

## デプロイ手順（推奨：Wrangler）

前提：Cloudflareアカウント、Node.js。

```bash
cd sleep-viz
npx wrangler login
npx wrangler pages project create sleep-viz --production-branch main
npx wrangler pages deploy . --project-name sleep-viz
```

続けて、ログイン用の環境変数（Secret）を登録します。

```bash
npx wrangler pages secret put APP_PASSWORD  --project-name sleep-viz
npx wrangler pages secret put SESSION_SECRET --project-name sleep-viz
```

- `APP_PASSWORD` … ログインに使うパスワード（好きな文字列）
- `SESSION_SECRET` … Cookie署名用のランダム文字列。例：
  ```
  7e9dcdecdb6581a53d1c3808faddfd9c49f9d1e5629f6dd50856e92276d753c1
  ```

Secret登録後にもう一度 `npx wrangler pages deploy . --project-name sleep-viz` を実行して反映。
発行されたURL（例 https://sleep-viz.pages.dev ）にアクセスするとログイン画面が出ます。

## デプロイ手順（ダッシュボードのみ）

1. Cloudflare ダッシュボード → Workers & Pages → Create → Pages → Upload assets。
2. `sleep-viz` フォルダの中身一式（`functions` を含む）をアップロード。
3. できたプロジェクト → Settings → Variables and Secrets で
   `APP_PASSWORD` と `SESSION_SECRET` を追加（Secret推奨）。
4. Deployments から Retry deployment（再デプロイ）で反映。

※ Functions（ログイン処理）を確実に動かすなら Wrangler 経由が安心です。
  ダッシュボードのDirect uploadでログインが効かない場合は Wrangler をお試しください。

## 使い方

- ログイン画面で `APP_PASSWORD` を入力。
- アプリ上部の「睡眠ステージCSV」「温度・湿度CSV」から各CSVをアップロード。
- チェックボックスで表示切替、グラフを指でなぞると各値を表示。
- 右上「ログアウト」でCookie破棄。

## CSVフォーマット

**睡眠ステージ（sleep.csv）**
```
start,end,stage
2026-07-20T23:10,2026-07-20T23:25,awake
```
stage は awake / rem / core / deep（覚醒・レム・コア・深い でも可）。

**温度・湿度（env.csv）**
```
time,room_temp,room_humidity,outdoor_temp,outdoor_humidity
2026-07-21T05:00,31.8,67,28.0,82
```
使わない列は空欄でOK。日時は日をまたぐため `YYYY-MM-DDTHH:MM` を推奨。

新しい夜のデータは、画像をこちら（Claude）に渡してCSV化してもらい、
上の2スロットにアップすれば差し替わります。

## セキュリティ注記

個人利用向けの簡易認証です。パスワードはサーバー側（環境変数）で照合し、
ログイン状態は HttpOnly・Secure・署名付きCookie で保持します（既定30日）。
`SESSION_SECRET` は長いランダム文字列にし、外部に出さないでください。
より厳格にしたい場合は Cloudflare Access（Zero Trust）での保護も検討できます。

## 日付切り替え（複数の夜）

- 画面上部のプルダウン（‹ ›ボタン）で夜ごとに切り替えられます。
- CSVをアップすると、日時（最も遅い時刻＝起床側の朝）から自動で日付を判定し、その日に取り込みます。
- 睡眠CSVと温度・湿度CSVが同じ夜なら、自動で同じ日付にペアリングされます。
- 温度・湿度が未取込の日は、睡眠ステージだけを表示します（あとで環境CSVを足せば重なります）。
- サンプルとして 7月21日（睡眠＋室温湿度）と 7月22日（睡眠＋室温湿度）を同梱しています。
