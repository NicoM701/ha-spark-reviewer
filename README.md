# Spark PR Review for Home Assistant

Experimental app. ARM64 installation and browser-based account setup have been verified; review execution remains under validation.

The app reviews one open PR authored by NicoM701 per run. It checks the dedicated Spark quota before requesting `gpt-5.3-codex-spark`. Missing quota, either window at 95%, or a model mismatch prevents further review. It never intentionally requests another model or uses an API key. Reviews are diff-only and do not run PR code or tests.

Defaults are disabled with publication disabled. Keep the Windows reviewer until a dry run and a single controlled published review on Green have succeeded. Stop the Windows scheduled task before enabling automatic publication on Green; comment markers alone do not prevent concurrent cross-machine races.

## Installation gates

1. Add `https://github.com/NicoM701/ha-spark-reviewer` to the Home Assistant app store repositories and install Spark PR Review.
2. Alternatively, use Studio Code Server 7.0.0 through authenticated Home Assistant ingress. Its official configuration maps `/addons` and all app configuration directories writable. Upload this app's source to `/addons/spark_review`, reload the store, then install `local_spark_review`. No public repository is required. Never store source or credentials under public `www/`.
3. The app does not expose a shell or setup website. Use the authenticated Studio Code terminal to run trusted Codex and GitHub CLI login tools with their home directories pointing to this app's mapped private configuration folder. Discover the actual folder rather than guessing it. Authenticate with `codex login --device-auth` and `gh auth login --web`. Their corresponding app-container paths are `/config/codex` and `/config/gh`. This terminal path and CLI availability must be verified after HA sign-in. Use browser approval, never paste credentials into chat. Only this app's credentials should live in that folder.
4. Verify `gh api user`, `node /app/reviewer.mjs --quota`, then one `--only=OWNER/REPO#NUMBER` dry run. Confirm exact model, dedicated quota, current SHA, valid report and host memory pressure.
5. Validate clean stop/start during a running review and persisted authentication/state. SIGTERM/SIGINT now stop children and release the lock through normal completion. A lock left by a forced kill still deliberately stops reviews until inspected; do not automatically remove it while a process could still be alive. Completed dry runs are cached separately, so the scheduler does not repeatedly spend Spark quota on the same commit; publication still performs a fresh review.

No host network, Docker socket, Home Assistant API, privileged access or public ports are requested. Node's heap is limited to 128 MB, but this is not a total container memory limit. Measure Codex peak RSS on Green before enabling continuous operation.

State and review artifacts live in `/config/reviewer`, next to the private authentication folders. This permits inspection through the mapped app configuration directory without Docker or host privileges. Version 0.1.0 used `/data/reviewer`; its failed packaging test made no reviews, so the migration starts with an empty review cache. Existing GitHub comment markers still prevent duplicate publication.

Secrets must not be committed or included in ordinary backups. Verify actual Supervisor backup paths before relying on the initial exclusion entries. Authentication can expire and require renewed browser approval.
