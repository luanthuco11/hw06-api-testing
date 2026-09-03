# HW06 — API Testing

API testing assignment for the EShop SUT.

- Student ID: `23127414`
- Toolchain: Postman + Newman
- SUT: <https://github.com/ttbhanh/eshop-sut>
- Base URL: `http://localhost:3000`

## Selected scope

| Pool | Feature | Endpoint(s) |
| --- | --- | --- |
| A | FR-01 Account Registration | `POST /api/register` |
| B | FR-11 User Order History | `GET /api/orders/my-orders` |
| C | FR-14 Category CRUD | `GET /api/categories`, `POST /api/categories`, `PUT /api/categories/:id`, `DELETE /api/categories/:id` |

Every request includes `X-Student-Id: 23127414` through the collection pre-request script. Each endpoint contains at least 35 AI-generated cases plus at least 5 separately documented human-added cases.

## Final execution summary

| Metric | Result |
| --- | ---: |
| AI-generated cases | 240 |
| Human-added cases | 39 |
| Total executed cases | 279 |
| HTTP requests | 585 |
| Assertions passed | 247 |
| Assertions failed | 136 |
| Confirmed endpoint-attributable defect candidates | 27 |

The assertion failures are retained as evidence of SUT contract mismatches. They are not test-harness failures; all accepted runs have zero script failures.

## Main deliverables

- Full Postman collection: [`postman/eshop-hw06.postman_collection.json`](postman/eshop-hw06.postman_collection.json)
- Test report: [`docs/test-report.md`](docs/test-report.md)
- Bug summary: [`docs/bug-summary.md`](docs/bug-summary.md)
- AI audit: [`docs/ai-audit.md`](docs/ai-audit.md)
- AI critique: [`docs/ai-critique.md`](docs/ai-critique.md)
- CI evidence: [`docs/ci-evidence.md`](docs/ci-evidence.md)
- Student-reviewed generator diagram: [`docs/agent-skill-diagram.png`](docs/agent-skill-diagram.png) and [`docs/agent-skill-diagram.mmd`](docs/agent-skill-diagram.mmd)
- Screenshot evidence: [`evidence`](evidence)
- Published defect Issues: [GitHub Issues](https://github.com/luanthuco11/hw06-api-testing/issues)
- Excel workbook: [`reports/HW06_Test_Cases_23127414.xlsx`](reports/HW06_Test_Cases_23127414.xlsx)
- PDF report: [`reports/HW06_Report_23127414.pdf`](reports/HW06_Report_23127414.pdf)
- Reusable Agent Skill: [`agent-skill/audited-api-test-workflow/SKILL.md`](agent-skill/audited-api-test-workflow/SKILL.md)
- Newman HTML evidence: [`reports/newman`](reports/newman)

## Reproduce generated deliverables

```powershell
npm install
npm run build:deliverables
```

The generator reads raw Newman JSON from the sibling `.runtime` diagnostics directory. Database backups and raw results are intentionally excluded from Git.

## CI proof

- [Passing run](https://github.com/luanthuco11/hw06-api-testing/actions/runs/33666325233)
- [Intentional one-failure run](https://github.com/luanthuco11/hw06-api-testing/actions/runs/33708693475)
- [Final restored passing run](https://github.com/luanthuco11/hw06-api-testing/actions/runs/33708895230)
- [Full audited-suite baseline run](https://github.com/luanthuco11/hw06-api-testing/actions/runs/33716503581) — 279 cases, 585 requests, exact accepted baseline

## Self-assessment checkpoint

| No. | Official criterion | Maximum | Self-assessed grade |
| ---: | --- | ---: | ---: |
| 1 | API 1 — full pipeline | 30 | 30 |
| 2 | API 2 — full pipeline | 30 | 30 |
| 3 | API 3 — full pipeline | 30 | 30 |
| 4 | Agent Skill — AI-driven test generator | 10 | 10 |
| | **Total** | **100** | **100** |

Completion evidence:

| Requirement | Evidence | Status |
| --- | --- | --- |
| Pool A/B/C scope | Six endpoint families in collection/report | Complete |
| ≥35 AI cases per endpoint | 40 for each endpoint | Complete |
| ≥5 human-added per endpoint | 5–7 for each endpoint | Complete |
| Human AI audit | 240 verdicts: 219 valid, 5 corrected, 16 incomplete | Complete |
| Postman/Newman execution | 279 cases and committed HTML reports | Complete |
| AI audit and 200–300 word critique | Audit log and 239-word critique | Complete |
| CI pass and one-fail history | Three immutable public runs | Complete |
| Reusable Agent Skill | Validated skill plus two forward-tested scripts | Complete |
| GitHub Issues with screenshots | 27 published Issues, each with one representative execution screenshot | Complete |
| Generator diagram | Mermaid source and rendered PNG reviewed by the student under the teacher-approved AI policy | Complete |
| Demo video | Recording script is ready; the assignment describes video as encouraged | Optional |
| Final self-assessed grade/ZIP | Student selected 100/100; package name `23127414_HW06_AI_API_100.zip` | Complete |

See [`docs/student-actions.md`](docs/student-actions.md) for the completed submission checklist and optional video item.
