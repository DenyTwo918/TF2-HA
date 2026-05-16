# TF2 Trading Hub 5.13.55 – Backpack Price Schema Memory Cache

## What changed

- Added an in-memory Backpack.tf price schema cache.
- Reduced repeated `JSON.parse` / `readFileSync` of 45k+ Backpack.tf price entries.
- Changed price schema writes to compact JSON to reduce synchronous serialization overhead.
- Changed `Maintain now` to use cached provider sync instead of forcing a fresh heavy Backpack.tf price-schema refresh every manual cycle.
- Kept the existing guarded/manual trading safety model.

## Safety

- No credential vault logic changed.
- No Backpack token/API key handling changed.
- No unsafe live trade accepts enabled.
- No automatic Steam confirmations enabled.

## Expected result

`Maintain now` should create far fewer CPU spikes after `backpack_tf_sync_completed` and should be less likely to be killed by Home Assistant Supervisor on smaller hosts.
