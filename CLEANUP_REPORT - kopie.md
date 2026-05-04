# TF2-HA Cleanup Report

This cleaned package keeps only the Home Assistant add-on files needed for the repository/runtime.

Removed from the uploaded folder:

- `.git/` history/cache from the ZIP package. Keep your local `.git` folder in your existing repo; do not delete it locally if you use GitHub Desktop.
- `tmpdata/` temporary runtime data.
- old `UPDATE_*.md` files except the current release note.
- old `tf2-trading-hub/docs/RELEASE_*.md` archive files.
- transient work/cache folders are blocked by `.gitignore`.

Kept:

- `repository.yaml`
- `tf2-trading-hub/` with Dockerfiles, config, dist, public, scripts and package metadata.
- `tf2-sda-bridge/` with Dockerfiles, config, dist, public and package metadata.

Deployment note:

Extract/copy this package into your existing GitHub working folder so the existing `.git` folder stays intact, then Commit + Push in GitHub Desktop.


5.13.27 patch applied: sell-first maintainer priority.
