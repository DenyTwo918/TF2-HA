# 1.0.1 – Ingress URL hotfix

Fixes Home Assistant ingress requests where `req.url` can be `//`, which caused Node.js `ERR_INVALID_URL` during path normalization.
