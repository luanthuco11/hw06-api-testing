# GitHub Actions CI Evidence

## Workflow

- Workflow: `API smoke`
- SUT: teacher repository pinned to commit `85af3ba875c88283615e22cb108f13e2fccaf0e9`
- Runner: Ubuntu with Node.js 22 and Newman 6.2.2
- Attribution: collection pre-request script logs `X-Student-Id: 23127414` for every request
- Scope: a three-request smoke collection demonstrates ordinary pass/fail behavior. A second step executes the complete audited suite and compares its exact results with the accepted baseline without relabeling known contract failures as passes.

## Required pass/fail history

| Purpose | Commit | Run | Result |
| --- | --- | --- | --- |
| Initial all-pass run | `2aa67f6` | [GitHub Actions run 33666325233](https://github.com/luanthuco11/hw06-api-testing/actions/runs/33666325233) | Success |
| Intentional one-fail demonstration | `ee9c636` | [GitHub Actions run 33708693475](https://github.com/luanthuco11/hw06-api-testing/actions/runs/33708693475) | Failure |
| Final restored run | `eb779bd` | [GitHub Actions run 33708895230](https://github.com/luanthuco11/hw06-api-testing/actions/runs/33708895230) | Success |

The failing commit changed only `ciExpectedStatus` from 200 to 418. Therefore CI-001 produced one intentional assertion failure while the remaining smoke assertions stayed valid. The next commit restored 200, and the final public run confirms that the repository returned to green.

## Complete audited-suite CI

| Commit | Run | Result | Verified scope |
| --- | --- | --- | --- |
| `c13d9a4` | [GitHub Actions run 33716503581](https://github.com/luanthuco11/hw06-api-testing/actions/runs/33716503581) | Success | 12 deterministic executions; 279 cases; 585 requests; 383 assertions; 247 passed and 136 known failed assertions |

The full-suite step prepares each deterministic database fixture, runs all selected folders, rejects request/script/infrastructure failures, and compares every aggregate metric and failing case ID with `reports/execution-summary.json`. Green therefore means the audited behavior is reproducible and unchanged, not that the 136 confirmed SUT contract mismatches disappeared.

Captured UI evidence is committed as [`02-ci-passing-run.png`](../evidence/02-ci-passing-run.png) and [`03-ci-failing-run.png`](../evidence/03-ci-failing-run.png). The public run links remain the authoritative, immutable evidence.
