# Postman and Newman Features Used

| Feature | How it is used | Evidence |
| --- | --- | --- |
| Collection and folders | One exported collection groups each independently counted endpoint, setup steps, audited AI cases, and human-added cases. | `postman/eshop-hw06.postman_collection.json` |
| Collection variables | Stores `baseUrl`, `studentId`, login tokens, and state shared by requests. | Full collection variables and test scripts |
| Environment | Supplies the local execution base URL and student identity to Newman. | `postman/local.postman_environment.json` |
| Collection pre-request script | Upserts and logs `X-Student-Id: 23127414` for every top-level request. | Collection-level `prerequest` event and Newman console output |
| Request headers and raw bodies | Exercises Authorization, Content-Type, Accept, CORS, method override, malformed JSON, and adversarial values. | Per-case requests in the collection |
| Test scripts and Chai assertions | Validates status, exact schema, types, values, headers, isolation, persistence, and non-mutation. | Per-request `test` events and Newman HTML reports |
| `pm.sendRequest` workflows | Performs follow-up reads, replay, state transitions, authentication setup, and concurrent requests inside one attributable case. | FR-01, FR-11, and FR-14 workflow cases |
| Collection variables at runtime | Saves login JWTs for authenticated follow-up requests. | FR-11 setup folder and CI smoke collection |
| Folder selection | Runs only the folder matching a prepared deterministic fixture. | Newman commands documented in endpoint reports |
| Multiple reporters | Produces CLI, JSON, JUnit, and htmlextra HTML outputs for diagnostics, CI, and submission evidence. | `reports/newman`, `.runtime`, and GitHub Actions artifact |
| Newman CLI integration | Executes exported Postman artifacts reproducibly outside the GUI. | npm scripts and execution metadata |
| CI/CD execution | GitHub Actions installs the pinned SUT, runs the smoke collection, executes all 12 deterministic full-suite modes, and verifies the exact accepted baseline. | `.github/workflows/api-smoke.yml`, `scripts/run-full-ci-suite.js`, and public run links |

Postman monitors, mock servers, and cloud workspaces were not claimed because they were not needed for a local, deterministic SQLite SUT and no attributable execution evidence was produced for them.
