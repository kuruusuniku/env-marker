# Task-002 Extension Dev Instruction

## Goal
安全なMV3基盤を実装する。

## Rules
- 権限は最小化する。
- リモートコードは禁止。
- 環境判定ロジックを1箇所に集約。

## Steps
1. manifest の権限理由をコメント付きで整理。
2. background/content/options の責務を分割。
3. storageアクセスをラップし、バリデーションを入れる。
4. 最低限の起動確認手順を記録する。

## Output
`extension-dev/deliverables/task-002-architecture.md`
