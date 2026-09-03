# Agent Skill Demo Script

Target duration: 4–6 minutes. The student records and narrates this demonstration.

1. Show the repository and open `agent-skill/audited-api-test-workflow/SKILL.md`.
2. Explain the sequence: extract requirements → generate cases → human oracle audit → human-added cases → deterministic fixture → Newman evidence → defect grouping.
3. Open `references/oracle-checklist.md` and mention two decisions that required student input.
4. Run:

   ```powershell
   node agent-skill/audited-api-test-workflow/scripts/validate_collection.js postman/eshop-hw06.postman_collection.json 35 5
   ```

5. Point out all six endpoint families and their AI/human counts.
6. Run the Newman summarizer against one or more `.runtime` JSON files and explain that its totals come from execution evidence.
7. Open one `human-audit.md`, one `human-added.md`, one Newman HTML report, and its matching `execution-results.md`.
8. Show the public CI pass and intentional-fail run pages.
9. End by showing the final branch is green and stating that incomplete oracles were observations, not reported defects.

Do not expose database backups, tokens, local user paths, or unrelated browser tabs in the recording.
