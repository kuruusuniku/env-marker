# env-marker Agent Team Operating Manual

## Mission
Chrome Web Store の `Environment Marker` に相当する機能を、外部サービス依存なしで安全に内製する。

## Team Structure
- `koumei/` 最高指揮官。タスク起票、優先順位、完了判定を担当。
- `analyst/` 要件整理、ユースケース定義、受け入れ条件を担当。
- `security/` 権限最小化、脅威モデリング、セキュリティレビューを担当。
- `extension-dev/` Manifest V3 実装を担当。
- `qa/` 実行検証担当。テスト設計・実施・再現手順・証跡作成を担当。
- `devils-advocate/` 品質ゲート担当。全成果物を批判的にレビューし、問題点・リスク・改善点を指摘して最終判定する。

## Directory Rules
- 指示書: `./<role>/instructions/`
- 成果物: `./<role>/deliverables/`
- レビュー記録: `./devils-advocate/reviews/`
- 全体タスク: `./koumei/tasks/`
- 最終報告: `./koumei/reports/`

## Role Boundary: qa vs devils-advocate
- `qa` の責務:
  - 仕様に沿った検証観点を作る。
  - 実際にテストを実行して事実を記録する。
  - 不具合の再現手順、期待値、実測結果を残す。
- `qa` の非責務:
  - リリース可否の最終ゲート判定。
  - 設計妥当性の最終裁定。
- `devils-advocate` の責務:
  - analyst/security/extension-dev/qa の全成果物を横断レビューする。
  - 問題点・リスク・改善案を重大度付きで提示する。
  - PASS/FAIL の品質ゲート判定を行う。
- `devils-advocate` の非責務:
  - 網羅的な手動試験の代行。

## Mandatory Flow (Instruction-Based)
1. `koumei` が `tasks/task-XXX.md` を起票。
2. 各担当が対応する `instructions/task-XXX-*.md` に従って成果物を作成。
3. `qa` は対象Taskでテストを実行し、証跡付きレポートを作成。
4. `devils-advocate` が全成果物を批判的にレビューし、`devils-advocate/reviews/task-XXX-review.md` を作成。
5. `koumei` は `devils-advocate` が PASS になるまでクローズ不可。

## Definition of Done
- 実装が受け入れ条件を満たす。
- `qa` の検証証跡が必要Taskで提出されている。
- `devils-advocate` レビューが PASS。
- `security` の必須項目が完了。
- 変更内容と未解決リスクが `koumei/reports/` に記録済み。

## Security Baseline for env-marker
- Manifest V3 を使用。
- リモートコード読み込み禁止。
- 権限は最小化し、不要な `host_permissions` を避ける。
- データはローカル保存のみ。外部送信なし。
- 設定エクスポートは明示操作時のみ。
