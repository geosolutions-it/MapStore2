# How we would like reports written

What a report should contain is in [SECURITY.md](../SECURITY.md). On top of that:

- **Proof of concept** that runs in this image: the URL or saved content, the user role and whether a click is needed.
- **Validity test** we can repeat in a few steps on a local instance, to confirm the issue before and after
  the fix.
- One root cause per report; state the role the attacker starts with and what they gain.
