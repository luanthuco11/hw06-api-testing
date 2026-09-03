# Confirmed Defect Candidate Summary

| ID | Endpoint | Finding | Proposed severity |
| --- | --- | --- | --- |
| BUG-FR01-001 | Register | Missing server-side field validation | High |
| BUG-FR01-002 | Register | Email uniqueness not enforced atomically | High |
| BUG-FR01-003 | Register/Login | Plaintext password storage/exposure | Critical |
| BUG-FR01-004 | Register | Parser stack disclosure and wrong media status | High |
| BUG-FR11-001 | Order history | Response violates strict/minimized schema | Medium |
| BUG-FR11-002 | Order history | Authorization scheme parsing is inconsistent | High |
| BUG-FR11-003 | Order history | Deleted/nonexistent principals remain authorized | High |
| BUG-FR11-004 | Order history | Hard-coded signing secret enables forged-token IDOR | Critical |
| BUG-FR11-005 | Order history | JWT claims lack semantic validation | High |
| BUG-FR14GET-001 | Category GET | Unacceptable HTML media is ignored | Low |
| BUG-FR14POST-001 | Category POST | Name validation/normalization/extra-field policy absent | High |
| BUG-FR14POST-002 | Category POST | Parser/media errors disclose internals or return 500 | High |
| BUG-FR14POST-003 | Category POST | Admin authorization not enforced | Critical |
| BUG-FR14POST-004 | Category POST | Empty Authorization classified incorrectly | Low |
| BUG-FR14POST-005 | Category POST | Unacceptable response media is ignored | Low |
| BUG-FR14PUT-001 | Category PUT | Name validation/normalization/extra-field policy absent | High |
| BUG-FR14PUT-002 | Category PUT | Parser/media errors disclose internals or return 500 | High |
| BUG-FR14PUT-003 | Category PUT | Invalid/nonexistent IDs falsely report success | Medium |
| BUG-FR14PUT-004 | Category PUT | Admin authorization not enforced | Critical |
| BUG-FR14PUT-005 | Category PUT | Empty Authorization classified incorrectly | Low |
| BUG-FR14PUT-006 | Category PUT | Unacceptable response media is ignored | Low |
| BUG-FR14DELETE-001 | Category DELETE | ID coercion and affected-row checks allow false/unintended deletion | High |
| BUG-FR14DELETE-002 | Category DELETE | Admin authorization not enforced | Critical |
| BUG-FR14DELETE-003 | Category DELETE | Referenced category deletion creates orphan products | High |
| BUG-FR14DELETE-004 | Category DELETE | Unexpected bodies/media are ignored | Medium |
| BUG-FR14DELETE-005 | Category DELETE | Empty Authorization classified incorrectly | Low |
| BUG-FR14DELETE-006 | Category DELETE | Unacceptable response media is ignored | Low |

These 27 entries are endpoint-attributable candidates. Related root causes may be linked across GitHub Issues, but evidence and affected test IDs remain in the endpoint execution reports.
