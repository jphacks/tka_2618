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
* ddddddddddd
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
Docker を使う場合、PC に Python や Node.js を個別にインストールする必要はありません。

### Docker のインストール

#### macOS

1. [Docker Desktop for Mac の公式ページ](https://docs.docker.com/desktop/setup/install/mac-install/)からインストーラーをダウンロードします。「この Mac について」でチップを確認し、Apple Silicon（M シリーズ）または Intel に合ったものを選んでください。
2. ダウンロードした `Docker.dmg` を開き、Docker を Applications フォルダにドラッグします。
3. アプリケーションから Docker を起動し、画面の案内に従って初期設定を完了します。
4. Docker Desktop のエンジンが起動するまで待ちます。Docker Compose も同時にインストールされます。

#### Windows（WSL 2）

1. [Docker Desktop for Windows の公式ページ](https://docs.docker.com/desktop/setup/install/windows-install/)で対応 OS とシステム要件を確認します。
2. WSL が未導入の場合は、管理者として開いた PowerShell で次を実行し、案内に従って PC を再起動します。

   ```powershell
   wsl --install
   ```

3. PowerShell で `wsl --update` を実行して WSL を更新します。
4. 公式ページから PC のアーキテクチャに合った Docker Desktop をダウンロードし、インストーラーを実行します。バックエンドを選択する画面では WSL 2 を選びます。
5. Docker Desktop を起動して初期設定を完了し、エンジンの起動を待ちます。このプロジェクトでは Linux コンテナを使用します。

WSL 内のターミナルから開発する場合は、Docker Desktop の Settings → Resources → WSL Integration で使用するディストリビューションとの連携を有効にしてください。Docker Compose は Docker Desktop に含まれています。

#### Linux（Ubuntu など）

[Docker Engine の公式インストール手順](https://docs.docker.com/engine/install/)から使用するディストリビューションを選び、Docker Engine と Compose プラグインをインストールします。

Ubuntu の場合は、[Ubuntu 向け手順](https://docs.docker.com/engine/install/ubuntu/)の「Install using the apt repository」に従って公式リポジトリを登録した後、次を実行します。

```bash
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl start docker
sudo docker run --rm hello-world
```

Docker の操作で権限エラーになる場合は、この README の `docker` コマンドに `sudo` を付けて実行してください。

#### インストール後の確認

macOS / Windows は Docker Desktop を起動した状態で、新しく開いたターミナル（Windows は PowerShell または連携済みの WSL）から確認します。

```bash
docker --version
docker compose version
docker info
docker run --rm hello-world
```

バージョンが表示され、最後のコマンドで `Hello from Docker!` と表示されれば準備完了です。初回は確認用イメージをダウンロードするため、インターネット接続が必要です。

- `docker` が見つからない場合: インストールが完了していることを確認し、ターミナルを開き直してください。
- `Cannot connect to the Docker daemon` と表示される場合: Docker Desktop または Linux の Docker サービスを起動してください。
- `docker compose` が見つからない場合: Docker Desktop のインストール状態、または Linux の `docker-compose-plugin` を確認してください。

### アプリケーションの起動

Docker Desktop（または Linux の Docker サービス）を起動してから実行します。

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
