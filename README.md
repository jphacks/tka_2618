# サンプル（プロダクト名）

[![IMAGE ALT TEXT HERE](https://jphacks.com/wp-content/uploads/2026/07/IMG_5316.png)](https://www.youtube.com/watch?v=piaNsc6ilBI)

## 製品概要
### 背景(製品開発のきっかけ、課題等）
### 製品説明（具体的な製品の説明）
### 特長
#### 1. 特長1
#### 2. 特長2
#### 3. 特長3

### 解決出来ること
### 今後の展望
### 注力したこと（こだわり等）
* 
* 

## 開発技術
### 活用した技術
#### API・データ
* 
* 

#### フレームワーク・ライブラリ・モジュール
* 
* 

#### デバイス
* 
* 

### 独自技術
#### ハッカソンで開発した独自機能・技術
* 独自で開発したものの内容をこちらに記載してください
* 特に力を入れた部分をファイルリンク、またはcommit_idを記載してください。

## ローカル開発環境

Python 3.13 / FastAPI と React / TypeScript / Vite を Docker Compose で起動します。
Docker Desktop（または Docker Engine + Compose v2）を起動しておいてください。

```bash
cd tka_2618
docker compose up --build
```

- フロントエンド: http://localhost:5173
- API ドキュメント（Swagger UI）: http://localhost:8000/docs
- ヘルスチェック: http://localhost:8000/api/health

初回はイメージと依存パッケージのダウンロードに時間がかかります。
画面に「Pythonバックエンドとの接続に成功しました！」と表示されれば接続完了です。
フロントエンドの `/api` リクエストは Vite がバックエンドに転送します。

### ディレクトリ

```text
backend/
  app/main.py          # API のエントリーポイント
  tests/test_api.py    # API テスト
  requirements.txt    # Python の依存パッケージ
frontend/
  src/App.tsx          # React の画面
  src/style.css        # スタイル
  vite.config.ts       # 開発サーバーと API プロキシ
compose.yaml           # 開発用 Docker Compose
```

`backend/app` と `frontend/src` の編集は自動反映されます。
フロントエンドの依存パッケージは専用ボリュームに保存され、起動時の `npm ci` でロックファイルと同期します。
Python の依存パッケージを変更した場合は `docker compose up --build` で再ビルドしてください。

### よく使うコマンド

```bash
# バックグラウンドで起動
docker compose up --build -d

# ログを確認
docker compose logs -f

# API テスト
docker compose exec backend python -m pytest -q

# フロントエンドの型チェックとビルド
docker compose exec frontend npm run build

# フロントエンドの依存パッケージを追加
docker compose exec frontend npm install <package-name>

# 停止
docker compose down
```

ポートが使用中の場合は `.env.example` を `.env` にコピーし、ポートを変更してください。
変更例: `FRONTEND_PORT=5174` / `BACKEND_PORT=8001`。
コンテナ間通信の設定は変更不要です。
この構成はホットリロードを使う開発用です。

### Docker を使わずに起動する場合

Python 3.13 と Node.js 24 を推奨します。別々のターミナルで実行してください。

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

```bash
cd frontend
npm ci
npm run dev
```

参考: [FastAPI の Docker 構成](https://fastapi.tiangolo.com/deployment/docker/)、[Vite の開発環境](https://vite.dev/guide/)。
