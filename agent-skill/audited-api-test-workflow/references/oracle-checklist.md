# Oracle Review Checklist

Ask for an explicit decision when the supplied requirements do not define any of these:

- exact success and error status codes;
- strict versus extensible response schema;
- case sensitivity, duplicate policy, and Unicode normalization;
- whitespace trimming and empty-versus-blank validation;
- minimum or maximum lengths and numeric bounds;
- handling of unknown query parameters or extra body fields;
- authorization role and stale/deleted-account behavior;
- missing, empty, malformed, expired, or forged credential distinctions;
- referenced-record deletion, cascade, orphan, or conflict policy;
- unsupported media types and unacceptable `Accept` values;
- ordering, pagination, cache headers, ETags, and performance thresholds.

Use `INCOMPLETE` when no decision exists. An observation may record actual behavior, but it must not inflate the confirmed-defect count.

For concurrency, define the invariant rather than an invented order. Examples: exactly one successful unique insert; final value is one submitted value; a deleted row does not reappear; foreign-user sentinels never leak.
