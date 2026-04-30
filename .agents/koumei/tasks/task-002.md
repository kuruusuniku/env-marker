# Task-002: MV3基盤と最小権限アーキテクチャ実装

## Objective
安全な Manifest V3 の土台を作る。

## Scope
- `manifest.json` の最小権限化
- `background`/`content`/`options` の基本骨格
- 環境判定ロジックの共通化
- ローカル保存 I/O 層の分離

## Owners
- Primary: `extension-dev`
- Mandatory: `security`
- Mandatory Review: `devils-advocate`

## Deliverables
- `extension-dev/deliverables/task-002-architecture.md`
- `security/deliverables/task-002-permission-audit.md`
- `devils-advocate/reviews/task-002-review.md`

## Acceptance Criteria
- Manifest V3 で動作する。
- 権限理由が全て文書化されている。
- `devils-advocate` が PASS。

