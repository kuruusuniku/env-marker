# Task-003 QA Instruction

## Goal
誤判定とUI崩れを重点検証し、再現可能な証跡を残す。

## Test Matrix
- `prod/stg/dev/local` 判定
- URL境界ケース（サブドメイン、ポート、IP）
- バナー表示ON/OFF
- options変更の反映タイミング

## Steps
1. 各ケースの前提条件と期待値を先に定義する。
2. 実行結果をケース単位で記録する。
3. 失敗ケースは再現手順を明記する。
4. 未検証範囲を明示する。

## Output
`qa/deliverables/task-003-test-report.md`

## Required Sections
- Test Cases
- Results (Pass/Fail)
- Defects with Reproduction Steps
- Untested Scope
