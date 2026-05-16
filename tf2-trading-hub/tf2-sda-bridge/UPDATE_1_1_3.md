# 1.1.3

Fixes Home Assistant ingress-relative API calls so the frontend no longer requests `/api/*` from the HA root and receives `404: Not Found`. Also hardens backend ingress path normalization.
