---
name: manage-pull-requests
description: Create and manage GitHub Pull Requests from reviewable repository changes. Use when Codex needs to open a PR, update its title or description, push follow-up commits, monitor or diagnose PR checks, decide whether ELSI UI screenshots apply, or report a PR's review status. Enforce early PR creation, CI-first validation, explicit screenshot profiles, and user-owned merging.
---

# Manage Pull Requests

Manage the complete PR lifecycle while keeping review feedback fast and leaving the merge decision to the user.

## Inspect the repository

1. Read the applicable `AGENTS.md` instructions.
2. Inspect the worktree, current branch, remotes, intended base branch, PR template, and relevant workflows.
3. Check whether the current branch already has a PR. Update it instead of creating a duplicate.
4. Preserve unrelated user changes and never push directly to `main`.

## Prepare a reviewable change

1. Create or use a focused feature branch from the intended base.
2. Review the diff and ensure the change is coherent enough for feedback.
3. Commit only files belonging to the requested change.
4. Open the PR as soon as the change is reviewable; let CI provide the complete validation signal.

## Decide screenshot handling

Make exactly one decision before finalizing the PR description:

- When the change belongs to a mission, document it as `Misión ID: ELS-XXXX`.
- For relevant UI changes, check `Requiere capturas`, provide the mission ID, and list one or more profiles: `public`, `account`, or `admin`.
- For changes without relevant UI evidence, check `No requiere capturas`. Keep the mission reference when one exists.
- Keep the selected capture set at or below the Zipform limit of 20 files. Published PR groups use the stable name `elsi-pr-{PR_NUMBER}`.

Select exactly one screenshot checkbox. After creating or editing the PR, read the persisted body and confirm that the workflow will take the intended path.

## Open and refine the PR

1. Push the focused branch and open a normal PR. Use a draft only when the user explicitly requests one.
2. Follow the repository template. Describe the change, mission, validation strategy, screenshot decision, profiles, risks, and relevant context accurately.
3. Do not claim that a check passed unless it ran and passed.
4. Continue refinements through follow-up commits on the same branch. Update the PR body when its scope or evidence changes.

## Rely on CI

- Treat the PR pipeline as the source of truth for lint, type checking, tests, and requested screenshot builds.
- Avoid duplicating the entire automated suite locally unless the user asks, immediate verification is necessary, or CI lacks a required structural check.
- Monitor checks after opening the PR. Inspect failed logs, distinguish change-related failures from infrastructure failures, and fix failures within the requested scope.
- Report pending, passing, failing, and skipped checks precisely.

## Preserve user control

- Never merge, squash, rebase-and-merge, enable auto-merge, close, or delete the PR unless the user explicitly requests that action.
- Never present a green pipeline as permission to merge.
- Return the PR URL, branch, screenshot decision, selected profiles, and current check status.
