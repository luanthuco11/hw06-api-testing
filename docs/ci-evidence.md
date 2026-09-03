# GitHub Actions CI Evidence

## Workflow

- Workflow: `API smoke`
- SUT: teacher repository pinned to commit `85af3ba875c88283615e22cb108f13e2fccaf0e9`
- Runner: Ubuntu with Node.js 22 and Newman 6.2.2
- Attribution: collection pre-request script logs `X-Student-Id: 23127414` for every request
- Scope: a separate three-request smoke collection proves the CI harness. The full audited contract collection intentionally retains confirmed SUT failures and is not relabeled as passing behavior.

## Required pass/fail history

| Purpose | Commit | Run | Result |
| --- | --- | --- | --- |
| Initial all-pass run | `2aa67f6` | [GitHub Actions run 33666325233](https://github.com/luanthuco11/hw06-api-testing/actions/runs/33666325233) | Success |
| Intentional one-fail demonstration | `ee9c636` | [GitHub Actions run 33708693475](https://github.com/luanthuco11/hw06-api-testing/actions/runs/33708693475) | Failure |
| Final restored run | `eb779bd` | [GitHub Actions run 33708895230](https://github.com/luanthuco11/hw06-api-testing/actions/runs/33708895230) | Success |

The failing commit changed only `ciExpectedStatus` from 200 to 418. Therefore CI-001 produced one intentional assertion failure while the remaining smoke assertions stayed valid. The next commit restored 200, and the final public run confirms that the repository returned to green.

Real UI screenshots remain pending because no connected interactive browser is available in the current environment. The immutable public run URLs above are preserved for verification and later screenshot capture.
