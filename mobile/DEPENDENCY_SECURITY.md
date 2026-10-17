# 依存パッケージのセキュリティ修正

確認日: 2026-10-17。対象は `mobile/` の依存ツリーです。

## 現在の対応

- `uuid`: xcode配下を修正済みの11.1.1にoverride。
- `braces@3.0.3`: パーサーおよびcompile/expand/stringifyの再帰処理に深さ制限を追加。
- `node-forge@1.4.0`: RSA PKCS#1 v1.5検証時、DigestAlgorithm内の要素数を厳密に検証。

後者2つは公式修正版が未公開のため、プロジェクトで管理するローカル修正です。
`npm audit`はパッケージのバージョンから判定するため、修正適用後も16件のhigh警告が残ります。
これは2つのアドバイザリが依存先のExpo関連パッケージにも波及して数えられたものです。
地図表示で追加した `react-native-maps` の1件も、新しいアドバイザリではなく、既に計上されている
React Nativeの依存関係が影響先としてもう1件表示されたものです。
監査を無効化したり、バージョンを偽装して警告を消したりはしていません。

`npm audit fix --force` は実行しないでください。Expo 57からExpo 44への破壊的な
ダウングレードが提案され、React Native 0.86との構成を壊します。
`npm audit fix` を実行してローカル修正が外れた場合は、`npm ci`を再実行するか、
`node scripts/security-patches.cjs`で修正を再適用してください。

## 他の開発者への反映

```bash
cd mobile
npm ci
npm run test:security
```

`postinstall` が `scripts/security-patches.cjs` を実行し、`patches/security.json` に記録した修正を適用します。
ロックファイルにある対象パッケージの全配置を調べ、バージョンとファイル全体のSHA-256を照合します。
既に適用済みなら変更しません。想定外の内容やバージョンではインストールをエラーにし、再確認を求めます。
`npm start` / `npm run ios` / `npm run android` の前にも適用状態を検査します。

`npm ci --ignore-scripts` では適用されません。その場合は以下を明示的に実行してください。

```bash
node scripts/security-patches.cjs
npm run test:security
```

直接 `npx expo` を実行する場合やCIでも、事前に `npm run security:check` を実行してください。

## 修正内容と制約

### braces

深さ100に達する入力を `SyntaxError` で拒否します。波括弧だけでなく丸括弧のネスト、
閉じられていない入力、parseを迂回するAST引数も制限します。
通常の範囲展開・選択肢・エスケープ・引用符は維持します。
極端に深い既存パターンは使用できなくなります。呼び出し側は他の不正入力と同様に例外を処理する必要があります。
これは既知の再帰深度問題への対策であり、任意の正規表現や組合せ展開に対する一般的な資源制限ではありません。

参考: [上流issue #70](https://github.com/micromatch/braces/issues/70)、
[GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)。

### node-forge

既存のASN.1検証に加え、DigestAlgorithmがOIDと任意のNULL以外の要素を含まないことを検証します。
[上流PR #1152](https://github.com/digitalbazaar/forge/pull/1152)の要素数検証と同じ条件です。
PRは未マージのため、公式修正版としては扱いません。

参考: [上流issue #1149](https://github.com/digitalbazaar/forge/issues/1149)、
[GHSA-86w9-cpqp-85rv](https://github.com/advisories/GHSA-86w9-cpqp-85rv)。

### uuid

`overrides.xcode.uuid` は11.1.1を指定しています。xcodeの指定範囲を超えるため、対象をxcode配下に限定しています。
xcodeが使うCommonJS読み込みとv4によるID生成を確認済みです。
[GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq)はv3/v5/v6の問題で、現行xcodeのv4使用箇所は直接の対象外です。

## 検証と今後の更新

`tests/security.test.cjs` は実際にインストールされた依存に対して、異常入力の拒否と正常系を確認します。
修正前は脆弱性関連の3テストが失敗し、修正後は適用処理の検証を含む全6テストが成功しました。
RSAテストはテスト用の鍵で不正なDigestInfoを署名し、公開RSA検証APIから拒否を確認します。
秘密鍵なしの署名偽造そのものを再現するテストではなく、不備のあった検証経路の回帰テストです。

```bash
npm run test:security
npm run typecheck
npm run lint
npx expo export --platform ios --platform android --platform web
npm audit
```

公式修正版が出たら、依存を更新し、このローカル修正とuuidのoverrideを再評価してください。
バージョン変更時にハッシュだけを書き換えて検証を通すことはせず、修正内容と回帰テストを確認します。
署名付きネイティブビルドと実機動作は未確認です。
