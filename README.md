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

Python 3.13 / FastAPI のバックエンドをDocker Composeで、React Native / ExpoのアプリをNode.jsで起動します。
Dockerを使う場合、PCにPythonを個別にインストールする必要はありません。アプリにはNode.js 24を使用します。

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
docker compose up --build -d backend
```

- API ドキュメント（Swagger UI）: http://localhost:8001/docs
- ヘルスチェック: http://localhost:8001/api/health

初回はイメージと依存パッケージのダウンロードに時間がかかります。モバイルアプリの起動方法は後述します。

### ディレクトリ

```text
backend/
  app/main.py          # API のエントリーポイント
  tests/test_api.py    # API テスト
  requirements.txt    # Python の依存パッケージ
mobile/
  App.tsx              # React Nativeの画面
  app.json             # Expoの設定
  package.json         # モバイルアプリの依存関係
compose.yaml           # 開発用 Docker Compose
```

`backend/app` の編集は自動反映されます。
Python の依存パッケージを変更した場合は `docker compose up --build` で再ビルドしてください。

### よく使うコマンド

```bash
# バックグラウンドで起動
docker compose up --build -d

# ログを確認
docker compose logs -f

# API テスト
docker compose exec backend python -m pytest -q

# 停止
docker compose down
```

ポートが使用中の場合は `.env.example` を `.env` にコピーし、ポートを変更してください。
変更例: `BACKEND_PORT=8001`。
この構成はホットリロードを使う開発用です。

### Docker を使わずに起動する場合

Python 3.13を推奨します。

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

参考: [FastAPI のDocker構成](https://fastapi.tiangolo.com/deployment/docker/)。

### ホットペッパーグルメAPI

[リクルートWEBサービスのAPIキー発行ページ](https://webservice.recruit.co.jp/register)で登録し、自分のAPIキーを取得してください。
取得したキーはリポジトリ直下の `.env` に設定します。`.env` がない場合のみ `.env.example` をコピーして作成してください。

```dotenv
BACKEND_PORT=8001
BACKEND_HOST=127.0.0.1
CORS_ORIGINS=http://localhost:8000,http://127.0.0.1:8000
HOTPEPPER_API_KEY=取得したAPIキー
```

`.env` は Git の管理対象外です。実際のキーを `.env.example` やモバイルアプリの環境変数に設定しないでください。
Docker Compose がキーをバックエンドだけに渡します。変更後は次を実行して反映します。

```bash
docker compose up -d backend
```

http://localhost:8001/docs の `GET /api/restaurants` で検索できます。

```bash
curl --get 'http://localhost:8001/api/restaurants' \
  --data-urlencode 'keyword=新宿 居酒屋' \
  --data 'count=10' \
  --data 'start=1'
```

- `keyword`: 必須の検索語句
- `count`: 取得件数（1〜100、初期値10）
- `start`: 取得開始位置（1以上、初期値1）
- レスポンス: `results_available`（総件数）、`results_start`（開始位置）、`shops`（店舗一覧）

モバイルアプリからは、設定したAPI URLの `/api/restaurants?keyword=...` を呼び出せます。APIキーをアプリから送る必要はありません。
キー未設定は503、外部APIのエラーは502、タイムアウトは504を返します。
Dockerを使わない場合は、起動するシェルに `HOTPEPPER_API_KEY` を設定してください（ルートの `.env` は自動読込しません）。

店舗情報を表示する画面を作成する際は、[公式のご利用案内](https://webservice.recruit.co.jp/doc/hotpepper/guideline.html)に従ってクレジットを表示してください。
検索項目・店舗データの詳細は[APIリファレンス](https://webservice.recruit.co.jp/doc/hotpepper/reference.html)を参照してください。

## アプリ（React Native / Expo）

`mobile/` の同じコードからiOS・Android・Web版を起動できます。
バックエンド接続確認・再接続画面を備え、Python APIを使用します。
ホットペッパーのAPIキーは引き続きバックエンドだけで管理します。

### スマートフォンで起動

Node.js 24、Expo SDK 57に対応したExpo Goを用意し、PCとスマホを同じWi-Fiに接続してください。

1. リポジトリ直下の既存 `.env` に `BACKEND_HOST=0.0.0.0` を追加します。
   DockerのAPIをLANから接続可能にする開発用設定です。PCだけで使う場合の初期値は `127.0.0.1` です。
2. リポジトリ直下でバックエンドを起動します。

   ```bash
   docker compose up -d --build backend
   ```

3. モバイル用の依存パッケージと設定を用意します。`.env` のコピーはファイルがまだない場合だけ実行してください。

   ```bash
   cd mobile
   npm ci
   cp .env.example .env
   ```

4. `mobile/.env` の `EXPO_PUBLIC_API_URL` をPCのLAN IPアドレスに変更します。
   例えば `EXPO_PUBLIC_API_URL=http://192.168.1.20:8001` です。末尾に `/api` は付けません。
   `BACKEND_PORT` を変更した場合は、このURLのポートも合わせてください。
   実機の `localhost` はスマホ自身を指すため、PCのIPを指定します。
5. スマホのブラウザで `http://PCのIP:8001/api/health` が開き、`{"status":"ok"}` が表示されることを確認します。
6. `mobile/` で起動し、表示されたQRコードをExpo Goで開きます。

   ```bash
   npm start
   ```

「Pythonバックエンドとの接続に成功しました！」と表示されれば接続完了です。
APIのURLを変更した場合はアプリを再読み込みしてください。
このプロジェクトは、実機のExpo Go 57.0.9に合わせてSDK 57へ固定しています。
Expo Goを更新した後にSDK不一致が出る場合は、[公式の案内](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/)を確認し、プロジェクトとExpo Goを同じSDK世代に揃えてください。

### シミュレーター・エミュレーター

| 環境 | `EXPO_PUBLIC_API_URL` の例 | 起動コマンド |
| --- | --- | --- |
| iOS Simulator（Mac・Xcodeが必要） | `http://localhost:8001` | `npm run ios` |
| Android Emulator（Android Studioが必要） | `http://10.0.2.2:8001` | `npm run android` |
| iOS / Android実機 | `http://PCのLANのIP:8001` | `npm start` |
| PCのブラウザ | `http://localhost:8000` | `npm run web` |

### ブラウザで起動

バックエンドを起動し、`mobile/.env` のAPI URLをPC向けに設定してからExpo Webを起動します。

```bash
docker compose up -d --build backend
cd mobile
npm ci
cp .env.example .env  # .envがまだない場合のみ
```

`mobile/.env`を次のように設定します。

```dotenv
EXPO_PUBLIC_WEB_API_URL=http://localhost:8001
```

起動後、`http://localhost:8000` がブラウザで開きます。

```bash
npm run web
```

別のPCやスマホのブラウザからExpo Webへアクセスする場合は、リポジトリ直下の`.env`に
その画面のOriginを追加します。複数指定するときはカンマで区切ります。

```dotenv
CORS_ORIGINS=http://localhost:8000,http://192.168.1.20:8000
```

設定変更後は `docker compose up -d backend` でバックエンドを再作成してください。

Dockerを使わず実機から接続する場合は、バックエンドを `uvicorn app.main:app --host 0.0.0.0 --reload --port 8001` で起動します。
接続できない場合は、PCのファイアウォールとWi-Fiの端末間通信制限も確認してください。
ExpoのトンネルはPython APIを公開しないため、APIにも端末から到達できるURLが必要です。

### 開発・検証

`npm ci` 時に依存ライブラリのセキュリティ修正を自動適用します。
修正の内容と監査警告が残る理由は [依存パッケージのセキュリティ修正](mobile/DEPENDENCY_SECURITY.md) を参照してください。

```bash
cd mobile
npm run test:security
npm run typecheck
npm run lint
npx expo export --platform ios --platform android --platform web
```

- `mobile/App.tsx`: モバイル画面とAPI接続処理
- `mobile/app.json`: アプリ名・プラットフォーム設定
- `mobile/.env.example`: API接続先の設定例

`EXPO_PUBLIC_` の値はアプリへ埋め込まれるため、APIキーなどの秘密情報は設定しません。
詳細は[Expoの環境変数ドキュメント](https://docs.expo.dev/guides/environment-variables/)を参照してください。
この手順はExpo Goによる開発確認用です。ストア配信用の署名・ビルド設定は含みません。
配布用アプリではHTTPSのAPIを使用します。
