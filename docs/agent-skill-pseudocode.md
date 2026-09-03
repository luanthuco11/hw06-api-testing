# Audited API Test Generator — Pseudocode

```text
INPUT: API specification, selected endpoint, required AI count,
       required human count, student ID, runnable SUT

contract := extract_explicit_requirements(specification, endpoint)
implementation_notes := inspect_SUT_only_for_fixture_and_execution_details()

ai_cases := generate_partitioned_cases(
    contract,
    domains = [valid, invalid, boundary, schema, auth, security,
               state, concurrency, media, non_mutation]
)
assert count(ai_cases) >= required_AI_count

FOR each case IN ai_cases:
    IF expected_result follows explicit contract:
        case.verdict := VALID
    ELSE IF case contradicts contract or combines unrelated concerns:
        case.verdict := INVALID
        case := human_correct(case)
    ELSE:
        case.verdict := INCOMPLETE
        ask_student_for_material_oracle(case)
        IF student decides:
            case := apply_student_oracle(case)
        ELSE:
            case.mode := OBSERVATION_ONLY

human_cases := student_select_or_authorize_additional_cases(
    gaps_in(ai_cases), minimum = required_human_count
)

fixture_plan := create_deterministic_fixture_plan(ai_cases + human_cases)
start_SUT()
FOR each independent fixture_mode IN fixture_plan:
    seed_after_startup(fixture_mode)
    collection_folder := build_postman_requests_and_assertions(fixture_mode)
    validate_student_header(collection_folder, student_ID)
    compile_test_scripts(collection_folder)
    result := run_newman(collection_folder)
    IF result.has_harness_error:
        reject_result()
        fix_harness()
        reset_fixture()
        rerun_complete_affected_scope()
    save_HTML_and_JSON_evidence(result)

all_results := aggregate_newman_results()
defects := group_failed_valid_oracles_by_root_cause(all_results)
observations := separate_incomplete_or_hardening_findings(all_results)

restore_original_database()
write_AI_audit_cases_reports_and_commit_log()
OUTPUT: collection, fixtures, Newman evidence, Excel summary,
        defect drafts, CI workflow, audit, critique, and report
```

The accompanying diagram is available as [`agent-skill-diagram.mmd`](agent-skill-diagram.mmd) and [`agent-skill-diagram.png`](agent-skill-diagram.png). It was generated with AI assistance under the teacher's clarified permission and reviewed by the student against this implemented control flow.
