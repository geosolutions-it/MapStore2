"""
check_milestone.py

For a given GitHub milestone, verifies that every issue has a corresponding
Pull Request merged into the target release branch.

Configuration (priority: CLI args > environment variables > defaults):
  --token TOKEN          GitHub Personal Access Token
  --repo OWNER/NAME      Repository (default: geosolutions-it/MapStore2)
  --milestone TITLE      Milestone title to check (e.g. 2026.01.01)
  --main-branch BRANCH   Main development branch (default: master)
  --branch BRANCH        Release/backport target branch (e.g. 2026.01.xx)

Environment variable equivalents:
  GITHUB_TOKEN, REPO, MILESTONE_TITLE, MAIN_BRANCH, TARGET_BRANCH

Usage example:
  python check_milestone.py \\
      --token ghp_... \\
      --milestone 2026.01.01 \\
      --branch 2026.01.xx

Icon legend per row:
  ✅  PR merged on main AND backport merged (or pre-branch-cut: no backport needed)
  ⚠️  PR merged on main but backport is missing
  📥  PR merged on main, backport PR is open (in progress)
  🏗️  PR on main is still open
  ❓  No PR found anywhere (may be a release task or manual item)
"""

import argparse
import os
import sys
import time
from datetime import datetime

import requests

# ---------------------------------------------------------------------------
# CLI parameters
# ---------------------------------------------------------------------------

_parser = argparse.ArgumentParser(
    description="Verify that all milestone issues have been backported to the release branch."
)
_parser.add_argument("--token",       default=os.environ.get("GITHUB_TOKEN", ""),
                     help="GitHub Personal Access Token")
_parser.add_argument("--repo",        default=os.environ.get("REPO", "geosolutions-it/MapStore2"),
                     help="Repository in owner/name format")
_parser.add_argument("--milestone",   default=os.environ.get("MILESTONE_TITLE", "2026.01.01"),
                     help="Milestone title to verify")
_parser.add_argument("--main-branch", default=os.environ.get("MAIN_BRANCH", "master"),
                     dest="main_branch",
                     help="Main development branch (default: master)")
_parser.add_argument("--branch",      default=os.environ.get("TARGET_BRANCH", "2026.01.xx"),
                     help="Release/backport target branch")
_ARGS = _parser.parse_args()

TOKEN       = _ARGS.token
REPO        = _ARGS.repo
MILESTONE   = _ARGS.milestone
MAIN_BRANCH = _ARGS.main_branch
TARGET      = _ARGS.branch

HEADERS = {"Accept": "application/vnd.github.v3+json"}
if TOKEN:
    HEADERS["Authorization"] = f"token {TOKEN}"

# GitHub Search API rate limits: 30 req/min (authenticated) / 10 req/min (unauthenticated).
# We sleep between search calls and retry with exponential back-off on 403/429.
_SEARCH_INTERVAL = 2.5 if TOKEN else 7.0
_MAX_RETRIES     = 5

_LINE  = "─" * 80
_DLINE = "═" * 80


# ---------------------------------------------------------------------------
# HTTP helpers
# ---------------------------------------------------------------------------

def _get(url, params=None):
    """GET with exponential back-off on 403/429 (rate-limit) responses."""
    for attempt in range(_MAX_RETRIES):
        res = requests.get(url, headers=HEADERS, params=params)
        if res.status_code in (403, 429):
            retry_after = int(res.headers.get("Retry-After", 0))
            wait = retry_after if retry_after > 0 else (2 ** attempt) * 10
            print(f"  ⏳ Rate limit hit — waiting {wait}s "
                  f"(attempt {attempt + 1}/{_MAX_RETRIES})...", flush=True)
            time.sleep(wait)
            continue
        res.raise_for_status()
        return res.json()
    print("❌ Max retries exceeded. Aborting.")
    sys.exit(3)


def _search_prs(base_branch, issue_number):
    """
    Search for PRs targeting base_branch that reference issue_number.

    Returns:
        merged_dates (list[datetime]): merge timestamps of merged PRs found.
        has_open     (bool): True if at least one open PR was found.
    """
    time.sleep(_SEARCH_INTERVAL)
    query = f"repo:{REPO} is:pr base:{base_branch} {issue_number}"
    data  = _get("https://api.github.com/search/issues",
                 params={"q": query, "per_page": 100})
    merged_dates = []
    has_open     = False
    for item in data.get("items", []):
        if item.get("state") == "open":
            has_open = True
        merged_at = item.get("pull_request", {}).get("merged_at")
        if merged_at:
            merged_dates.append(
                datetime.fromisoformat(merged_at.replace("Z", "+00:00"))
            )
    return merged_dates, has_open


# ---------------------------------------------------------------------------
# GitHub data fetchers
# ---------------------------------------------------------------------------

def get_milestone_id(title):
    """Resolve a milestone title to its numeric API id."""
    page = 1
    while True:
        milestones = _get(
            f"https://api.github.com/repos/{REPO}/milestones",
            params={"state": "all", "per_page": 100, "page": page},
        )
        if not milestones:
            break
        for m in milestones:
            if m["title"] == title:
                return m["number"]
        page += 1
    return None


def get_all_issues(milestone_id):
    """Fetch all issues in the milestone, excluding GitHub PR entries."""
    items = []
    page  = 1
    while True:
        page_items = _get(
            f"https://api.github.com/repos/{REPO}/issues",
            params={"milestone": milestone_id, "state": "all",
                    "per_page": 100, "page": page},
        )
        if not page_items:
            break
        items.extend(page_items)
        page += 1
    # GitHub's /issues endpoint also returns PRs — exclude them.
    return [i for i in items if "pull_request" not in i]


def get_branch_cut_date():
    """
    Return the UTC datetime at which TARGET diverged from MAIN_BRANCH,
    by inspecting the merge-base commit of the two branches.

    PRs merged on main BEFORE this date are already included in the target
    branch and do not need a separate backport PR.

    Returns None if the branch does not exist or the date cannot be resolved.
    """
    try:
        compare = _get(
            f"https://api.github.com/repos/{REPO}/compare/{MAIN_BRANCH}...{TARGET}"
        )
        sha    = compare["merge_base_commit"]["sha"]
        commit = _get(f"https://api.github.com/repos/{REPO}/commits/{sha}")
        date_s = commit["commit"]["committer"]["date"]
        return datetime.fromisoformat(date_s.replace("Z", "+00:00"))
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Status classification
# ---------------------------------------------------------------------------

def classify(issue, branch_cut):
    """
    Determine the backport status of a single issue.

    Returns (icon, category, detail) where category is one of:
        "ok"               — fully aligned
        "no_pr"            — no PR found anywhere
        "missing_backport" — main merged but backport absent
        "in_progress"      — at least one PR is still open
    """
    num = issue["number"]

    # Two search API calls — one per branch.
    main_dates,   main_open = _search_prs(MAIN_BRANCH, num)
    target_dates, tgt_open  = _search_prs(TARGET, num)

    main_merged   = bool(main_dates)
    target_merged = bool(target_dates)
    has_any       = main_merged or main_open or target_merged or tgt_open

    if not has_any:
        return "❓", "no_pr", "No PR found"

    # Backport already merged → always OK regardless of main status.
    if target_merged:
        return "✅", "ok", "Backport merged"

    if main_merged:
        if tgt_open:
            return "📥", "in_progress", "Main merged — backport open"
        # No backport PR at all: check whether main was merged before branch cut.
        if branch_cut:
            if min(main_dates) < branch_cut:
                cut_s = branch_cut.strftime("%Y-%m-%d")
                return "✅", "ok", f"Merged on main before branch cut ({cut_s}) — no backport needed"
        return "⚠️", "missing_backport", "Main merged — backport missing"

    # Main PR still open.
    if main_open:
        detail = "Main PR open, backport open" if tgt_open else "Main PR open"
        return "🏗️", "in_progress", detail

    # Only target-branch activity (e.g. direct fix on release branch).
    if tgt_open:
        return "🏗️", "in_progress", "Backport open (no main PR yet)"

    return "❓", "no_pr", "No PR found"


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def check_backports():
    print(f"\n{_DLINE}")
    print(f"  Milestone backport check  |  {REPO}  |  milestone: {MILESTONE}")
    print(_DLINE)

    print(f"\n  [1/3] Resolving milestone '{MILESTONE}'...")
    milestone_id = get_milestone_id(MILESTONE)
    if milestone_id is None:
        print(f"  ❌ Milestone '{MILESTONE}' not found.")
        sys.exit(2)
    print(f"        → id = {milestone_id}")

    print(f"\n  [2/3] Fetching issues...")
    issues = get_all_issues(milestone_id)
    print(f"        → {len(issues)} issue(s) found")

    print(f"\n  [2b]  Resolving branch cut date ({MAIN_BRANCH} → {TARGET})...")
    branch_cut = get_branch_cut_date()
    if branch_cut:
        print(f"        → Branch '{TARGET}' was cut on "
              f"{branch_cut.strftime('%Y-%m-%d %H:%M UTC')}")
        print("          PRs merged on main before this date need no backport.")
    else:
        print(f"        → Could not determine branch cut date. "
              "Pre-branch-cut check is disabled.")

    print(f"\n  [3/3] Checking {len(issues)} issue(s)...\n")
    print(f"  {'':5}  {'#':>6}  Title")
    print(f"  {_LINE}")

    results = []
    for issue in issues:
        num   = issue["number"]
        title = issue["title"]
        icon, category, detail = classify(issue, branch_cut)
        results.append((num, title, icon, category, detail))
        title_s = (title[:74] + "..") if len(title) > 76 else title
        print(f"  {icon:<5}  #{num:>6}  {title_s}  [{detail}]")

    # --- Bucket results ---
    ok       = [(n, t, d) for n, t, i, c, d in results if c == "ok"]
    no_pr    = [(n, t, d) for n, t, i, c, d in results if c == "no_pr"]
    missing  = [(n, t, d) for n, t, i, c, d in results if c == "missing_backport"]
    progress = [(n, t, d) for n, t, i, c, d in results if c == "in_progress"]

    print(f"\n{_DLINE}")
    print(f"  SUMMARY  —  milestone: {MILESTONE}  →  target branch: {TARGET}")
    print(_LINE)
    print(f"  ✅   OK (merged & aligned)  : {len(ok)}")
    print(f"  ❓   No PR found            : {len(no_pr)}")
    print(f"  ⚠️    Missing backport       : {len(missing)}")
    print(f"  🏗️    In progress            : {len(progress)}")
    print(_DLINE)

    if no_pr:
        print(f"\n  ❓ Issues with no PR — may be release tasks or manual items:")
        for n, t, d in no_pr:
            print(f"     • #{n} — {t}")

    if missing:
        print(f"\n  ⚠️  Issues missing a backport to '{TARGET}':")
        for n, t, d in missing:
            print(f"     • #{n} — {t}")

    if progress:
        print(f"\n  🏗️  Issues still in progress:")
        for n, t, d in progress:
            print(f"     • #{n} — {t}  [{d}]")

    print()
    # Exit code 1 only when there are confirmed missing backports.
    sys.exit(1 if missing else 0)


if __name__ == "__main__":
    check_backports()
