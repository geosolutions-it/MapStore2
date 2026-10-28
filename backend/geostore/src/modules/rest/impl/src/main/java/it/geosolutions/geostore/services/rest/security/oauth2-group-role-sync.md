# OAuth2 / OIDC — User, Role and Group Synchronization

This document describes how GeoStore synchronizes the authenticated user's role and group
memberships from OAuth2/OIDC token claims on every login.

The behavior is implemented in `OAuth2GeoStoreAuthenticationService` and applies to **all
OAuth2/OIDC providers** (Keycloak, Azure AD, Google, etc.).

---

## Overview

After a successful token exchange, GeoStore:

1. Resolves the **principal** (username) from the token.
2. Looks up or auto-creates the **user** in the local DB.
3. Reads **role** and **group** claims from the token.
4. Synchronizes the user's DB role and group memberships to match the claims.
5. Persists the updated user.

---

## Configuration properties (`geostore-ovr.properties`)

| Property | Default | Description |
|---|---|---|
| `rolesClaim` | _(none)_ | JWT claim name that contains the user's roles (e.g. `roles`, `realm_access.roles`) |
| `groupsClaim` | _(none)_ | JWT claim name that contains the user's groups (e.g. `groups`) |
| `roleMappings` | _(none)_ | Comma-separated `TOKENROLE=GEOSTOREROLE` pairs to rename roles |
| `dropUnmapped` | `false` | If `true`, roles/groups not present in the mapping are discarded |
| `defaultGroups` | _(none)_ | Comma-separated group names always assigned on login, regardless of token claims |
| `authenticatedDefaultRole` | `USER` | Role assigned when `rolesClaim` is configured but missing from the token |
| `autoCreateUser` | `true` | Whether to auto-create a DB user on first login |
| `groupNamesUppercase` | `false` | Normalize group names to uppercase before DB lookup/creation |

---

## Role synchronization

### Claim resolution order

`syncRoleFromClaims` tries to read `rolesClaim` from:

1. Primary token (ID token for OIDC, access token for plain OAuth2)
2. Access token (fallback — Keycloak puts `realm_access.roles` here)
3. Userinfo map (response from `/userinfo` endpoint)

### Role mapping

If `roleMappings` is configured, each role string from the token is looked up in the map
(case-insensitive key). If found, the mapped name replaces the original.

If `dropUnmapped=true`, roles not in the mapping are silently discarded before comparison.
If `dropUnmapped=false` (default), unmapped roles are kept as-is.

### Role resolution (`computeRole`)

After mapping, GeoStore compares each role string against its own `Role` enum:

- matches `ADMIN` (case-insensitive) → role is **ADMIN** (returned immediately)
- matches `USER` → role is at least **USER**
- matches `GUEST` → role is at least **GUEST**
- no match → falls through to default

The highest role wins. If no roles match, `authenticatedDefaultRole` is used (default: `USER`).

### Edge cases

| Situation | Result |
|---|---|
| `rolesClaim` not configured | Current DB role preserved |
| `rolesClaim` configured, claim missing from token | `authenticatedDefaultRole` applied |
| Token contains `ADMIN` | User gets `ADMIN` immediately |

---

## Group synchronization

### Claim resolution order

`resolveStringListClaimWithFallback` tries to read `groupsClaim` from:

1. Primary token
2. Access token (fallback)
3. Userinfo map

### Group mapping

Same `groupMappings` / `dropUnmapped` logic as roles.

### Default groups

Groups listed in `defaultGroups` are processed **after** `reconcileRemoteGroups`, in a
separate step. They are not subject to `groupMappings` or `dropUnmapped`, and are created
and assigned even when the token carries no groups at all.

### Reconciliation with DB (`reconcileRemoteGroups`)

GeoStore tracks which groups belong to each OAuth2 provider via the `sourceService` group
attribute. On every login it reconciles only groups tagged with the current provider:

| Situation | Action |
|---|---|
| Group in token, exists in DB, already assigned | No-op |
| Group in token, exists in DB, not yet assigned | Assign to user |
| Group in token, **not** in DB | Create group (with `sourceService=<provider>`) then assign |
| Group **not** in token, assigned, tagged for this provider | Deassign from user |
| Group not in token, assigned, tagged for a **different** provider | Left untouched |
| Group not in token, assigned manually (no `sourceService`) | Left untouched |

> Group creation and assignment only happen when `autoCreateUser=true` and
> `userGroupService` is available.

---

## Examples

### Example 1 — First login, no claims configured

**Setup:** `rolesClaim` and `groupsClaim` not set.

**Result:** User created with role `USER`, no groups assigned.

---

### Example 2 — Role from token

**Setup:**
```properties
rolesClaim=roles
```
Token contains `"roles": ["ADMIN"]`.

**Result:** User role set to `ADMIN`.

---

### Example 3 — Role missing from token

**Setup:**
```properties
rolesClaim=roles
authenticatedDefaultRole=GUEST
```
Token does **not** contain `roles`.

**Result:** User role set to `GUEST`.

---

### Example 4 — Groups from token, first login

**Setup:**
```properties
groupsClaim=groups
```
Token contains `"groups": ["developers", "testers"]`.

**Result:** Groups `developers` and `testers` created in DB (tagged `sourceService=oidc`),
assigned to user.

---

### Example 5 — Group removed from token

**Setup:** Same as Example 4, but on second login token contains only `"groups": ["developers"]`.

**Result:** `testers` deassigned from user (group record in DB is kept).

> **Note:** Deassignment only works from the **second login onwards**. On the very first login
> the user object is freshly created in memory and its group set is empty, so `reconcileRemoteGroups`
> sees `currentGroups=[]` and cannot compute removals. From the second login the user is loaded
> from DB with groups populated, and the reconciliation works correctly.

---

### Example 6 — Group mapping

**Setup:**
```properties
groupsClaim=groups
groupMappings=DEVS:developers,QA:testers
dropUnmapped=true
```
Token contains `"groups": ["DEVS", "QA", "ops"]`.

**Result:** `developers` and `testers` assigned; `ops` dropped (unmapped + `dropUnmapped=true`).

---

### Example 7 — Default groups

**Setup:**
```properties
groupsClaim=groups
defaultGroups=everyone
```
Token contains `"groups": ["developers"]`.

**Result:** Both `developers` and `everyone` assigned (regardless of token content).

---

### Example 8 — Manually assigned group preserved

**Setup:** User has group `admins` assigned manually in DB (no `sourceService` attribute).
Token contains `"groups": []`.

**Result:** `admins` is **not** removed (not tagged for this provider).