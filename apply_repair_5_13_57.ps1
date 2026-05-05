$ErrorActionPreference = "Stop"

Write-Host "=== TF2-HA 5.13.57 repository repair ==="

function Write-Utf8NoBom {
    param([string]$Path, [string]$Text)
    $dir = Split-Path -Parent $Path
    if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    $enc = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Text, $enc)
}

function Fix-Versions {
    param([string]$Path)
    if (-not (Test-Path $Path)) { return }
    $t = [System.IO.File]::ReadAllText($Path)
    $t = $t -replace "5\.13\.(47|48|49|50|51|52|53|54|55|56)", "5.13.57"
    $t = $t -replace "[ \t]+(`r?`n)", '$1'
    Write-Utf8NoBom -Path $Path -Text $t
}

$repoRoot = (git rev-parse --show-toplevel 2>$null).Trim()
if (-not $repoRoot) { throw "Run this from inside the TF2-HA repo folder." }

Write-Host "Repo root: $repoRoot"

$configYaml = @'
slug: tf2_trading_hub
name: TF2 Trading Hub
version: "5.13.57"
description: Minimal safe TF2 Trading Hub with manual maintainer control.
url: https://github.com/DenyTwo918/TF2-HA
arch:
  - amd64
  - aarch64
  - armv7
  - armhf
  - i386
startup: application
boot: auto
init: false
ingress: true
ingress_entry: /
ingress_port: 8099
homeassistant_api: true
panel_icon: mdi:chart-line
panel_title: TF2 Trading Hub

options:
  global_kill_switch: false

  persistent_classifieds_maintainer_enabled: true
  persistent_classifieds_maintainer_safe_minimal_mode_enabled: true
  persistent_classifieds_maintainer_auto_run_enabled: false
  controlled_fill_one_enabled: true
  persistent_classifieds_interval_minutes: 5
  persistent_classifieds_max_publishes_per_cycle: 20

  backpack_tf_enabled: true
  backpack_tf_user_agent: TF2-HA-TF2-Trading-Hub/5.13.57
  backpack_tf_base_url: https://backpack.tf
  backpack_tf_cache_ttl_minutes: 30
  backpack_tf_retry_count: 2
  backpack_tf_write_mode: guarded

  fast_dashboard_status_enabled: true
  maintainer_async_status_mode: true
  operations_cockpit_enabled: true
  runtime_event_logging_enabled: true
  runtime_debug_logging: false
  runtime_log_level: info
  action_feed_limit: 500

  allow_live_classifieds_writes: false
  allow_guarded_backpack_publish: false
  allow_live_trade_accepts: false
  allow_live_backpack_writes: false
  allow_sda_trade_confirmations: false
  allow_live_trade_counteroffers: false
  auto_accept_enabled: false
  steamguard_auto_confirm: false
  sda_auto_confirm: false

  archive_classifieds_on_startup: false
  archive_classifieds_on_startup_confirmed: false
  archive_classifieds_on_startup_requires_write_sliders: true
  archive_classifieds_on_startup_run_maintainer_after: false
  archive_classifieds_on_startup_delay_seconds: 5
  archive_classifieds_on_startup_cooldown_seconds: 20

  startup_rebuild_enabled: false
  startup_rebuild_run_after_archive: true
  startup_rebuild_fast_fill_minutes: 10
  startup_rebuild_batch_size: 20
  startup_rebuild_normal_batch_size: 20
  startup_rebuild_max_runs: 3

  listing_fill_mode: cap
  backpack_tf_account_listing_cap: 600
  max_total_active_listings: 600
  listing_fill_reserve_slots: 0
  target_active_buy_listings: 600
  target_active_sell_listings: 50
  stock_cap_per_item: 1
  stock_cap_include_pending_offers: true
  stock_cap_count_active_sell_as_stock: false
  stock_cap_count_sell_drafts_as_stock: false
  stock_cap_effective_count_enabled: true

  publish_duplicate_guard_enabled: true
  allow_duplicate_guard_override: false
  guarded_publish_cooldown_seconds: 30
  publish_error_inspector_enabled: true
  publish_error_inspector_recent_runs: 8
  publish_error_inspector_sample_limit: 12

  maintainer_skip_per_listing_verify: true
  maintainer_verify_after_cycle: true
  maintainer_publish_batch_hard_cap: 20
  maintainer_skip_unaffordable_buy_candidates: true
  maintainer_unaffordable_skip_does_not_consume_batch: true
  maintainer_affordable_candidate_rotation_enabled: true
  maintainer_dashboard_suppress_unaffordable_currency_noise: true
  maintainer_prune_unactionable_buy_drafts: false
  maintainer_mark_unactionable_queue_held: true
  maintainer_currency_skip_window_multiplier: 80
  maintainer_trading_brain_block_does_not_consume_batch: true
  maintainer_publish_brain_block_is_safe_filter: true

  adaptive_fill_controller_enabled: true
  adaptive_fill_target_per_cycle: 10
  adaptive_fill_max_per_cycle: 20
  adaptive_fill_min_per_cycle: 3
  adaptive_fill_rate_limit_backoff_per_cycle: 5
  adaptive_fill_error_slowdown_threshold: 10
  adaptive_fill_success_boost_threshold: 8
  adaptive_fill_dashboard_enabled: true

  inventory_sync_enabled: true
  inventory_cache_ttl_minutes: 30
  inventory_max_pages: 2
  market_scanner_enabled: true
  market_scanner_mode: balanced
  market_scanner_max_candidates: 300
  market_scanner_min_item_ref: 0.11
  market_scanner_max_item_ref: 25
  market_scanner_min_profit_ref: 0.22
  market_scanner_key_ref_estimate: 77

  strategy_builder_enabled: true
  strategy_mode: balanced
  strategy_min_profit_ref: 0.22
  strategy_min_liquidity_score: 45
  strategy_max_risk_score: 30

  trading_brain_v513_enabled: true
  trading_brain_require_profit_for_buy: true
  trading_brain_min_profit_ref: 0.22
  trading_brain_min_margin_percent: 3
  trading_brain_skip_buy_when_no_sell_market: true
  trading_brain_archive_all_mode: manual_only
  trading_brain_counteroffer_mode: dry_run
  trading_brain_stock_match_mode: sku
  trading_brain_dashboard_samples: 8
  trading_brain_enforcement_enabled: true
  trading_brain_enforce_on_publish: true
  trading_brain_enforce_on_maintainer: true
  trading_brain_enforce_no_sell_market: false
  trading_brain_enforcement_mode: balanced
  trading_brain_suppress_unactionable_blocked_buy_samples: true
  trading_brain_block_extreme_unprofitable_high_value_buys: true

  pricing_engine_enabled: true
  pricing_min_margin_percent: 3
  pricing_min_profit_ref: 0.11
  pricing_unknown_item_risk: 22
  min_profit_ref: 0.11
  max_risk_score: 30
  max_offer_value_ref: 100
  do_not_trade_tags: scam,blocked,do_not_trade

  market_pricing_pipeline_enabled: true
  market_pricing_use_for_buy: true
  market_pricing_use_for_sell: true
  market_pricing_snapshot_cache_minutes: 15
  market_pricing_max_snapshot_checks_per_cycle: 100
  market_pricing_buy_bonus_ref: 0.11
  market_pricing_sell_undercut_ref: 0.11
  market_pricing_min_spread_ref: 0.66
  market_pricing_min_buyers: 0
  market_pricing_min_sellers: 1
  market_pricing_strict_mode: false
  market_pricing_apply_to_existing_drafts: true
  market_pricing_block_crossed_markets: true
  market_pricing_never_buy_above_profit_safe_sell: true
  market_pricing_exclude_unaffordable_buys: true
  market_pricing_ignore_corrupt_snapshot_when_buy_gt_sell: true
  market_pricing_no_snapshot_fallback_enabled: true
  market_pricing_no_snapshot_fallback_allow_buy: true
  market_pricing_no_snapshot_fallback_min_profit_ref: 0.22
  market_pricing_no_snapshot_fallback_max_buy_ref: 120
  market_pricing_suppress_corrupt_samples: true

  liquidity_min_listing_count: 4
  liquidity_first_trading_mode_enabled: true
  liquidity_first_apply_to_buy_listings: true
  liquidity_first_apply_to_owned_sell_listings: false
  liquidity_first_require_snapshot_for_buy: true
  liquidity_first_min_active_buyers: 1
  liquidity_first_min_active_sellers: 2
  liquidity_first_min_spread_ref: 0.33
  liquidity_first_allow_schema_fallback_as_filler: true
  liquidity_first_fallback_max_active_buy_listings: 80
  liquidity_first_owned_inventory_sell_anything_above_min_ref: true
  liquidity_first_dashboard_enabled: true

  auto_sell_owned_inventory_above_min_ref_enabled: false
  auto_sell_owned_inventory_min_ref: 0.11
  auto_sell_owned_inventory_max_per_run: 20
  auto_sell_owned_inventory_include_currency: false
  auto_sell_owned_inventory_include_cases: false
  manual_owned_sell_detector_enabled: true
  manual_owned_sell_detector_force_inventory_sync: false
  manual_owned_sell_detector_publish: false
  manual_owned_sell_detector_scan_existing_unlisted: true
  manual_owned_sell_detector_include_unpriced_as_min: false
  manual_owned_sell_detector_max_per_run: 20

  maintainer_sell_first_priority_enabled: false
  maintainer_sell_first_publish_owned_before_buy: false
  maintainer_sell_backlog_blocks_buy_until_empty: false
  maintainer_sell_first_defer_buy_when_sell_work_found: false
  maintainer_sell_first_min_sell_attempts_per_cycle: 3
  maintainer_sell_first_dashboard_enabled: true

  sell_booster_enabled: false
  sell_booster_use_classifieds_lowest_seller: true
  sell_booster_undercut_ref: 0.11
  sell_booster_min_sell_ref: 0.11
  sell_booster_reprice_existing_enabled: false
  sell_booster_reprice_threshold_ref: 0.22
  sell_booster_public_text_style: clean
  strict_sell_classifieds_pricing_enabled: true
  strict_sell_classifieds_skip_without_snapshot: false
  strict_sell_classifieds_undercut_ref: 0.11
  strict_sell_classifieds_max_per_run: 20
  sell_profit_guard_enabled: true
  sell_profit_guard_min_profit_ref: 0.22
  sell_profit_guard_min_margin_percent: 3
  sell_profit_guard_skip_when_classifieds_below_profit: true
  sell_profit_guard_max_above_lowest_ref: 0.66
  sell_market_sanity_guard_enabled: true
  sell_market_sanity_max_above_lowest_ref: 0.66
  sell_market_sanity_max_inventory_multiplier: 1.35
  sell_no_cost_basis_force_market_price: true
  sell_no_cost_basis_max_above_lowest_ref: 0.22
  sell_cost_basis_trust_guard_enabled: true
  sell_cost_basis_untrusted_market_multiplier: 3
  sell_cost_basis_untrusted_max_above_market_ref: 2

  quantity_aware_sell_pricing_enabled: true
  stack_sell_quantity_parse_enabled: true
  stack_sell_reprice_active_listing_enabled: false
  stack_sell_reprice_threshold_ref: 0.11
  stack_sell_exclude_own_listing_from_market: true
  stack_sell_hold_when_active_listing_price_differs: true
  sell_status_use_published_price_as_truth: true

  fallback_metrics_enabled: true
  fallback_fill_boost_enabled: true
  fallback_fill_boost_min_candidates: 120
  fallback_fill_boost_max_approved_per_run: 60
  fallback_fill_publish_target_per_cycle: 10
  fallback_fill_prioritize_affordable_schema_fallback: true
  trading_brain_allow_no_snapshot_schema_fallback: true
  dashboard_show_schema_fallback_fill: true

  stale_sell_listing_guard_enabled: true
  stale_sell_listing_guard_archive_missing_asset: false
  stale_sell_listing_guard_auto_archive_enabled: false
  stale_sell_listing_guard_auto_archive_requires_write_sliders: true
  stale_sell_listing_guard_archive_max_per_run: 3

  listing_text_sync_with_published_price: true
  listing_text_force_rebuild_on_publish: true
  listing_text_sync_existing_drafts: false

  targeted_buy_orders_enabled: true
  targeted_buy_order_max_active: 600
  hub_autopilot_enabled: true
  hub_autopilot_sync_backpack: true
  hub_autopilot_build_market: true
  hub_autopilot_sync_inventory: true
  hub_autopilot_build_core: true
  autonomy_mode: observe
  autonomy_interval_minutes: 5
  autonomy_build_brain: true
  autonomy_build_watchlist: true
  autonomy_require_manual_approval: true

  actionable_plans_enabled: true
  actionable_plan_max_actions: 300
  actionable_plan_protect_last_key: true
  actionable_plan_min_score: 55
  max_actions_per_cycle: 3
  max_actions_per_day: 10
  max_ref_per_action: 2
  max_ref_per_day: 10

  get_sent_offers: true
  get_received_offers: true
  get_descriptions: true
  active_only: true
  auto_review_enabled: true
  review_interval_minutes: 5
  notify_on_accept_recommended: true
  notify_on_needs_review: true
  ha_notifications_enabled: true
  min_profit_ref_for_accept: 0
  max_risk_for_accept: 25
  provider_timeout_seconds: 15
  max_notifications_per_cycle: 5
  manual_review_base_url: https://steamcommunity.com
  pricelist_path: /data/steam-companion-pricelist.json
  steam_retry_count: 2
  steam_retry_backoff_seconds: 3
  steam_offer_dedupe_ttl_days: 14
  steam_offer_history_limit: 1000

  trade_approval_mode: manual
  trade_mismatch_auto_decline_enabled: true
  trade_mismatch_auto_decline_received_only: true
  trade_mismatch_auto_decline_negative_profit: true
  trade_mismatch_profit_floor_ref: -0.01
  trade_guard_leave_overpay: true
  trade_mismatch_counteroffer_enabled: true
  trade_counteroffer_dry_run_validation_enabled: true
  trade_counteroffer_live_requires_dry_run_ok: true
  trade_counteroffer_dry_run_min_cycles: 3
  trade_counteroffer_mode: draft_only
  trade_counteroffer_decline_if_unsendable: true
  trade_counteroffer_min_shortfall_ref: 0.11
  trade_counteroffer_max_shortfall_ref: 100
  trade_counteroffer_min_profit_ref: 0.11
  trade_counteroffer_max_per_cycle: 3
  trade_counteroffer_message: Adjusted to fair value. Good or overpay offers are accepted manually.

  multi_account_enabled: false
  account_scope_mode: main_only
  main_account_label: Main account
  active_account_id: main
  ollama_enabled: false
  ollama_base_url: http://10.0.0.25:11434
  ollama_model: qwen2.5:7b
  ollama_timeout_seconds: 20
  ollama_max_decisions: 8

  steamguard_embedded: false
  steamguard_confirm_delay_seconds: 3
  sda_enabled: true
  sda_base_url: http://tf2-sda-bridge:8098
  sda_password: ""
  sda_poll_interval_seconds: 10

  notification_center_enabled: true
  data_migration_enabled: true
  backup_before_migration: true
  dashboard_hide_unactionable_brain_samples: true
  dashboard_hide_corrupt_market_samples: true
  currency_helper_use_actionable_candidate_only: true
  currency_helper_show_exact_deficit: true
  currency_helper_hold_buy_when_missing_currency: true
  currency_helper_sell_first_when_buy_currency_missing: true
  currency_helper_missing_currency_is_warning: true
  safe_filtered_errors_do_not_slow_fill: true
  publish_error_inspector_count_brain_blocks_as_filtered: true
  adaptive_fill_ignore_safe_filtered_errors: true
  adaptive_fill_provider_error_only_slowdown: true

schema:
  global_kill_switch: bool
  persistent_classifieds_maintainer_enabled: bool
  persistent_classifieds_maintainer_safe_minimal_mode_enabled: bool
  persistent_classifieds_maintainer_auto_run_enabled: bool
  controlled_fill_one_enabled: bool
  persistent_classifieds_interval_minutes: int(0,1000000)
  persistent_classifieds_max_publishes_per_cycle: int(0,1000000)
  backpack_tf_enabled: bool
  backpack_tf_user_agent: str
  backpack_tf_base_url: str
  backpack_tf_cache_ttl_minutes: int(0,1000000)
  backpack_tf_retry_count: int(0,1000000)
  backpack_tf_write_mode: list(off|guarded|active)
  fast_dashboard_status_enabled: bool
  maintainer_async_status_mode: bool
  operations_cockpit_enabled: bool
  runtime_event_logging_enabled: bool
  runtime_debug_logging: bool
  runtime_log_level: list(error|warn|info|debug)
  action_feed_limit: int(0,1000000)
  allow_live_classifieds_writes: bool
  allow_guarded_backpack_publish: bool
  allow_live_trade_accepts: bool
  allow_live_backpack_writes: bool
  allow_sda_trade_confirmations: bool
  allow_live_trade_counteroffers: bool
  auto_accept_enabled: bool
  steamguard_auto_confirm: bool
  sda_auto_confirm: bool
  archive_classifieds_on_startup: bool
  archive_classifieds_on_startup_confirmed: bool
  archive_classifieds_on_startup_requires_write_sliders: bool
  archive_classifieds_on_startup_run_maintainer_after: bool
  archive_classifieds_on_startup_delay_seconds: int(0,1000000)
  archive_classifieds_on_startup_cooldown_seconds: int(0,1000000)
  startup_rebuild_enabled: bool
  startup_rebuild_run_after_archive: bool
  startup_rebuild_fast_fill_minutes: int(0,1000000)
  startup_rebuild_batch_size: int(0,1000000)
  startup_rebuild_normal_batch_size: int(0,1000000)
  startup_rebuild_max_runs: int(0,1000000)
  listing_fill_mode: list(target|cap)
  backpack_tf_account_listing_cap: int(0,1000000)
  max_total_active_listings: int(0,1000000)
  listing_fill_reserve_slots: int(0,1000000)
  target_active_buy_listings: int(0,1000000)
  target_active_sell_listings: int(0,1000000)
  stock_cap_per_item: int(0,1000000)
  stock_cap_include_pending_offers: bool
  stock_cap_count_active_sell_as_stock: bool
  stock_cap_count_sell_drafts_as_stock: bool
  stock_cap_effective_count_enabled: bool
  publish_duplicate_guard_enabled: bool
  allow_duplicate_guard_override: bool
  guarded_publish_cooldown_seconds: int(0,1000000)
  publish_error_inspector_enabled: bool
  publish_error_inspector_recent_runs: int(0,1000000)
  publish_error_inspector_sample_limit: int(0,1000000)
  maintainer_skip_per_listing_verify: bool
  maintainer_verify_after_cycle: bool
  maintainer_publish_batch_hard_cap: int(0,1000000)
  maintainer_skip_unaffordable_buy_candidates: bool
  maintainer_unaffordable_skip_does_not_consume_batch: bool
  maintainer_affordable_candidate_rotation_enabled: bool
  maintainer_dashboard_suppress_unaffordable_currency_noise: bool
  maintainer_prune_unactionable_buy_drafts: bool
  maintainer_mark_unactionable_queue_held: bool
  maintainer_currency_skip_window_multiplier: int(0,1000000)
  maintainer_trading_brain_block_does_not_consume_batch: bool
  maintainer_publish_brain_block_is_safe_filter: bool
  adaptive_fill_controller_enabled: bool
  adaptive_fill_target_per_cycle: int(0,1000000)
  adaptive_fill_max_per_cycle: int(0,1000000)
  adaptive_fill_min_per_cycle: int(0,1000000)
  adaptive_fill_rate_limit_backoff_per_cycle: int(0,1000000)
  adaptive_fill_error_slowdown_threshold: int(0,1000000)
  adaptive_fill_success_boost_threshold: int(0,1000000)
  adaptive_fill_dashboard_enabled: bool
  inventory_sync_enabled: bool
  inventory_cache_ttl_minutes: int(0,1000000)
  inventory_max_pages: int(0,1000000)
  market_scanner_enabled: bool
  market_scanner_mode: list(strict|balanced|relaxed|watchlist)
  market_scanner_max_candidates: int(0,1000000)
  market_scanner_min_item_ref: float(-100000,1000000)
  market_scanner_max_item_ref: int(0,1000000)
  market_scanner_min_profit_ref: float(-100000,1000000)
  market_scanner_key_ref_estimate: int(0,1000000)
  strategy_builder_enabled: bool
  strategy_mode: list(safe|balanced|aggressive)
  strategy_min_profit_ref: float(-100000,1000000)
  strategy_min_liquidity_score: int(0,1000000)
  strategy_max_risk_score: int(0,1000000)
  trading_brain_v513_enabled: bool
  trading_brain_require_profit_for_buy: bool
  trading_brain_min_profit_ref: float(-100000,1000000)
  trading_brain_min_margin_percent: int(0,1000000)
  trading_brain_skip_buy_when_no_sell_market: bool
  trading_brain_archive_all_mode: list(manual_only|confirmed_startup)
  trading_brain_counteroffer_mode: list(dry_run|guarded_live)
  trading_brain_stock_match_mode: list(sku|name)
  trading_brain_dashboard_samples: int(0,1000000)
  trading_brain_enforcement_enabled: bool
  trading_brain_enforce_on_publish: bool
  trading_brain_enforce_on_maintainer: bool
  trading_brain_enforce_no_sell_market: bool
  trading_brain_enforcement_mode: list(balanced|strict)
  trading_brain_suppress_unactionable_blocked_buy_samples: bool
  trading_brain_block_extreme_unprofitable_high_value_buys: bool
  pricing_engine_enabled: bool
  pricing_min_margin_percent: int(0,1000000)
  pricing_min_profit_ref: float(-100000,1000000)
  pricing_unknown_item_risk: int(0,1000000)
  min_profit_ref: float(-100000,1000000)
  max_risk_score: int(0,1000000)
  max_offer_value_ref: int(0,1000000)
  do_not_trade_tags: str
  market_pricing_pipeline_enabled: bool
  market_pricing_use_for_buy: bool
  market_pricing_use_for_sell: bool
  market_pricing_snapshot_cache_minutes: int(0,1000000)
  market_pricing_max_snapshot_checks_per_cycle: int(0,1000000)
  market_pricing_buy_bonus_ref: float(-100000,1000000)
  market_pricing_sell_undercut_ref: float(-100000,1000000)
  market_pricing_min_spread_ref: float(-100000,1000000)
  market_pricing_min_buyers: int(0,1000000)
  market_pricing_min_sellers: int(0,1000000)
  market_pricing_strict_mode: bool
  market_pricing_apply_to_existing_drafts: bool
  market_pricing_block_crossed_markets: bool
  market_pricing_never_buy_above_profit_safe_sell: bool
  market_pricing_exclude_unaffordable_buys: bool
  market_pricing_ignore_corrupt_snapshot_when_buy_gt_sell: bool
  market_pricing_no_snapshot_fallback_enabled: bool
  market_pricing_no_snapshot_fallback_allow_buy: bool
  market_pricing_no_snapshot_fallback_min_profit_ref: float(-100000,1000000)
  market_pricing_no_snapshot_fallback_max_buy_ref: int(0,1000000)
  market_pricing_suppress_corrupt_samples: bool
  liquidity_min_listing_count: int(0,1000000)
  liquidity_first_trading_mode_enabled: bool
  liquidity_first_apply_to_buy_listings: bool
  liquidity_first_apply_to_owned_sell_listings: bool
  liquidity_first_require_snapshot_for_buy: bool
  liquidity_first_min_active_buyers: int(0,1000000)
  liquidity_first_min_active_sellers: int(0,1000000)
  liquidity_first_min_spread_ref: float(-100000,1000000)
  liquidity_first_allow_schema_fallback_as_filler: bool
  liquidity_first_fallback_max_active_buy_listings: int(0,1000000)
  liquidity_first_owned_inventory_sell_anything_above_min_ref: bool
  liquidity_first_dashboard_enabled: bool
  auto_sell_owned_inventory_above_min_ref_enabled: bool
  auto_sell_owned_inventory_min_ref: float(-100000,1000000)
  auto_sell_owned_inventory_max_per_run: int(0,1000000)
  auto_sell_owned_inventory_include_currency: bool
  auto_sell_owned_inventory_include_cases: bool
  manual_owned_sell_detector_enabled: bool
  manual_owned_sell_detector_force_inventory_sync: bool
  manual_owned_sell_detector_publish: bool
  manual_owned_sell_detector_scan_existing_unlisted: bool
  manual_owned_sell_detector_include_unpriced_as_min: bool
  manual_owned_sell_detector_max_per_run: int(0,1000000)
  maintainer_sell_first_priority_enabled: bool
  maintainer_sell_first_publish_owned_before_buy: bool
  maintainer_sell_backlog_blocks_buy_until_empty: bool
  maintainer_sell_first_defer_buy_when_sell_work_found: bool
  maintainer_sell_first_min_sell_attempts_per_cycle: int(0,1000000)
  maintainer_sell_first_dashboard_enabled: bool
  sell_booster_enabled: bool
  sell_booster_use_classifieds_lowest_seller: bool
  sell_booster_undercut_ref: float(-100000,1000000)
  sell_booster_min_sell_ref: float(-100000,1000000)
  sell_booster_reprice_existing_enabled: bool
  sell_booster_reprice_threshold_ref: float(-100000,1000000)
  sell_booster_public_text_style: str
  strict_sell_classifieds_pricing_enabled: bool
  strict_sell_classifieds_skip_without_snapshot: bool
  strict_sell_classifieds_undercut_ref: float(-100000,1000000)
  strict_sell_classifieds_max_per_run: int(0,1000000)
  sell_profit_guard_enabled: bool
  sell_profit_guard_min_profit_ref: float(-100000,1000000)
  sell_profit_guard_min_margin_percent: int(0,1000000)
  sell_profit_guard_skip_when_classifieds_below_profit: bool
  sell_profit_guard_max_above_lowest_ref: float(-100000,1000000)
  sell_market_sanity_guard_enabled: bool
  sell_market_sanity_max_above_lowest_ref: float(-100000,1000000)
  sell_market_sanity_max_inventory_multiplier: float(-100000,1000000)
  sell_no_cost_basis_force_market_price: bool
  sell_no_cost_basis_max_above_lowest_ref: float(-100000,1000000)
  sell_cost_basis_trust_guard_enabled: bool
  sell_cost_basis_untrusted_market_multiplier: int(0,1000000)
  sell_cost_basis_untrusted_max_above_market_ref: int(0,1000000)
  quantity_aware_sell_pricing_enabled: bool
  stack_sell_quantity_parse_enabled: bool
  stack_sell_reprice_active_listing_enabled: bool
  stack_sell_reprice_threshold_ref: float(-100000,1000000)
  stack_sell_exclude_own_listing_from_market: bool
  stack_sell_hold_when_active_listing_price_differs: bool
  sell_status_use_published_price_as_truth: bool
  fallback_metrics_enabled: bool
  fallback_fill_boost_enabled: bool
  fallback_fill_boost_min_candidates: int(0,1000000)
  fallback_fill_boost_max_approved_per_run: int(0,1000000)
  fallback_fill_publish_target_per_cycle: int(0,1000000)
  fallback_fill_prioritize_affordable_schema_fallback: bool
  trading_brain_allow_no_snapshot_schema_fallback: bool
  dashboard_show_schema_fallback_fill: bool
  stale_sell_listing_guard_enabled: bool
  stale_sell_listing_guard_archive_missing_asset: bool
  stale_sell_listing_guard_auto_archive_enabled: bool
  stale_sell_listing_guard_auto_archive_requires_write_sliders: bool
  stale_sell_listing_guard_archive_max_per_run: int(0,1000000)
  listing_text_sync_with_published_price: bool
  listing_text_force_rebuild_on_publish: bool
  listing_text_sync_existing_drafts: bool
  targeted_buy_orders_enabled: bool
  targeted_buy_order_max_active: int(0,1000000)
  hub_autopilot_enabled: bool
  hub_autopilot_sync_backpack: bool
  hub_autopilot_build_market: bool
  hub_autopilot_sync_inventory: bool
  hub_autopilot_build_core: bool
  autonomy_mode: list(observe|plan|guarded|active)
  autonomy_interval_minutes: int(0,1000000)
  autonomy_build_brain: bool
  autonomy_build_watchlist: bool
  autonomy_require_manual_approval: bool
  actionable_plans_enabled: bool
  actionable_plan_max_actions: int(0,1000000)
  actionable_plan_protect_last_key: bool
  actionable_plan_min_score: int(0,1000000)
  max_actions_per_cycle: int(0,1000000)
  max_actions_per_day: int(0,1000000)
  max_ref_per_action: int(0,1000000)
  max_ref_per_day: int(0,1000000)
  get_sent_offers: bool
  get_received_offers: bool
  get_descriptions: bool
  active_only: bool
  auto_review_enabled: bool
  review_interval_minutes: int(0,1000000)
  notify_on_accept_recommended: bool
  notify_on_needs_review: bool
  ha_notifications_enabled: bool
  min_profit_ref_for_accept: int(0,1000000)
  max_risk_for_accept: int(0,1000000)
  provider_timeout_seconds: int(0,1000000)
  max_notifications_per_cycle: int(0,1000000)
  manual_review_base_url: str
  pricelist_path: str
  steam_retry_count: int(0,1000000)
  steam_retry_backoff_seconds: int(0,1000000)
  steam_offer_dedupe_ttl_days: int(0,1000000)
  steam_offer_history_limit: int(0,1000000)
  trade_approval_mode: list(manual|accept_recommended|accept_and_confirm)
  trade_mismatch_auto_decline_enabled: bool
  trade_mismatch_auto_decline_received_only: bool
  trade_mismatch_auto_decline_negative_profit: bool
  trade_mismatch_profit_floor_ref: float(-100000,1000000)
  trade_guard_leave_overpay: bool
  trade_mismatch_counteroffer_enabled: bool
  trade_counteroffer_dry_run_validation_enabled: bool
  trade_counteroffer_live_requires_dry_run_ok: bool
  trade_counteroffer_dry_run_min_cycles: int(0,1000000)
  trade_counteroffer_mode: list(draft_only|send_when_safe)
  trade_counteroffer_decline_if_unsendable: bool
  trade_counteroffer_min_shortfall_ref: float(-100000,1000000)
  trade_counteroffer_max_shortfall_ref: int(0,1000000)
  trade_counteroffer_min_profit_ref: float(-100000,1000000)
  trade_counteroffer_max_per_cycle: int(0,1000000)
  trade_counteroffer_message: str
  multi_account_enabled: bool
  account_scope_mode: list(main_only|multi_ready|planning_all_enabled|live_main_only)
  main_account_label: str
  active_account_id: str
  ollama_enabled: bool
  ollama_base_url: str
  ollama_model: str
  ollama_timeout_seconds: int(0,1000000)
  ollama_max_decisions: int(0,1000000)
  steamguard_embedded: bool
  steamguard_confirm_delay_seconds: int(0,1000000)
  sda_enabled: bool
  sda_base_url: str
  sda_password: password
  sda_poll_interval_seconds: int(0,1000000)
  notification_center_enabled: bool
  data_migration_enabled: bool
  backup_before_migration: bool
  dashboard_hide_unactionable_brain_samples: bool
  dashboard_hide_corrupt_market_samples: bool
  currency_helper_use_actionable_candidate_only: bool
  currency_helper_show_exact_deficit: bool
  currency_helper_hold_buy_when_missing_currency: bool
  currency_helper_sell_first_when_buy_currency_missing: bool
  currency_helper_missing_currency_is_warning: bool
  safe_filtered_errors_do_not_slow_fill: bool
  publish_error_inspector_count_brain_blocks_as_filtered: bool
  adaptive_fill_ignore_safe_filtered_errors: bool
  adaptive_fill_provider_error_only_slowdown: bool

'@
$dockerfile = @'
ARG BUILD_ARCH=amd64
FROM ghcr.io/home-assistant/${BUILD_ARCH}-base:latest

ARG BUILD_VERSION=5.13.57
ARG BUILD_ARCH=amd64

LABEL io.hass.name="TF2 Trading Hub" \
      io.hass.description="Minimal safe TF2 Trading Hub with manual maintainer control." \
      io.hass.type="addon" \
      io.hass.version="${BUILD_VERSION}" \
      maintainer="DenyTwo918" \
      org.opencontainers.image.title="TF2 Trading Hub" \
      org.opencontainers.image.version="${BUILD_VERSION}" \
      org.opencontainers.image.source="https://github.com/DenyTwo918/TF2-HA"

RUN apk add --no-cache nodejs

WORKDIR /app

COPY dist ./dist
COPY public ./public
COPY package.json ./package.json
COPY config.yaml ./config.yaml
COPY run.sh /run.sh

RUN chmod +x /run.sh

EXPOSE 8099

CMD ["/run.sh"]

'@
$buildYaml = @'
build_from:
  amd64: ghcr.io/home-assistant/amd64-base:latest
  aarch64: ghcr.io/home-assistant/aarch64-base:latest
  armv7: ghcr.io/home-assistant/armv7-base:latest
  armhf: ghcr.io/home-assistant/armhf-base:latest
  i386: ghcr.io/home-assistant/i386-base:latest
args:
  BUILD_VERSION: "5.13.57"
labels:
  org.opencontainers.image.title: "TF2 Trading Hub"
  org.opencontainers.image.version: "5.13.57"
  org.opencontainers.image.source: "https://github.com/DenyTwo918/TF2-HA"

'@
$runSh = @'
#!/usr/bin/env sh
set -eu

echo "[tf2-hub] version: 5.13.57"
echo "[tf2-hub] Minimal UI + Controlled Fill One"
exec node /app/dist/server.js

'@
$repositoryYaml = @'
name: TF2-HA
url: https://github.com/DenyTwo918/TF2-HA
maintainer: DenyTwo918

'@
$packageJson = @'
{
  "name": "tf2-trading-hub",
  "version": "5.13.57",
  "description": "Minimal safe TF2 Trading Hub with controlled fill one",
  "main": "dist/server.js",
  "scripts": {
    "start": "node dist/server.js"
  },
  "dependencies": {}
}

'@
$readme = @'
# TF2-HA

Current TF2 Trading Hub build: 5.13.57 - Minimal UI + Controlled Fill One.

Repository contains the TF2 Trading Hub Home Assistant add-on and optional SDA Bridge helper.

Safety defaults remain guarded/manual: no live trade accepts, no Steam confirmations, no unsafe automatic publishing.

'@
$update = @'
# Update 5.13.57 - Minimal UI + Controlled Fill One

- Restored valid multiline Home Assistant add-on files.
- Fixed config.yaml option defaults.
- Restored run.sh and repository.yaml.
- Kept Safe Minimal Maintainer enabled.
- Kept Controlled Fill One enabled.
- Kept auto maintainer disabled.
- Kept manual/guarded safety defaults.

'@

Write-Utf8NoBom (Join-Path $repoRoot "tf2-trading-hub/config.yaml") $configYaml
Write-Utf8NoBom (Join-Path $repoRoot "tf2-trading-hub/Dockerfile") $dockerfile
Write-Utf8NoBom (Join-Path $repoRoot "tf2-trading-hub/build.yaml") $buildYaml
Write-Utf8NoBom (Join-Path $repoRoot "tf2-trading-hub/run.sh") $runSh
Write-Utf8NoBom (Join-Path $repoRoot "tf2-trading-hub/package.json") $packageJson
Write-Utf8NoBom (Join-Path $repoRoot "repository.yaml") $repositoryYaml
Write-Utf8NoBom (Join-Path $repoRoot "README.md") $readme
Write-Utf8NoBom (Join-Path $repoRoot "tf2-trading-hub/UPDATE_5_13_57.md") $update

$files = @(
 "tf2-trading-hub/dist/server.js",
 "tf2-trading-hub/dist/index.js",
 "tf2-trading-hub/public/app.js",
 "tf2-trading-hub/public/index.html",
 "README.md",
 "tf2-trading-hub/config.yaml",
 "tf2-trading-hub/Dockerfile",
 "tf2-trading-hub/build.yaml",
 "tf2-trading-hub/run.sh",
 "tf2-trading-hub/package.json",
 "repository.yaml"
)
foreach ($f in $files) { Fix-Versions (Join-Path $repoRoot $f) }

git diff --check
if ($LASTEXITCODE -ne 0) { throw "git diff --check failed" }

$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if ($nodeCmd) {
    node --check (Join-Path $repoRoot "tf2-trading-hub/dist/server.js")
    if ($LASTEXITCODE -ne 0) { throw "node --check server.js failed" }
    if (Test-Path (Join-Path $repoRoot "tf2-trading-hub/dist/index.js")) {
        node --check (Join-Path $repoRoot "tf2-trading-hub/dist/index.js")
        if ($LASTEXITCODE -ne 0) { throw "node --check index.js failed" }
    }
} else {
    Write-Host "Node.js not found, skipping node --check."
}

git add README.md repository.yaml tf2-trading-hub/config.yaml tf2-trading-hub/Dockerfile tf2-trading-hub/build.yaml tf2-trading-hub/run.sh tf2-trading-hub/package.json tf2-trading-hub/UPDATE_5_13_57.md tf2-trading-hub/dist/server.js tf2-trading-hub/dist/index.js tf2-trading-hub/public/app.js tf2-trading-hub/public/index.html
git commit -m "5.13.57 - repair HA repo files and minimal config"
if ($LASTEXITCODE -ne 0) { Write-Host "Commit skipped or nothing to commit." }

Write-Host "Pushing HEAD directly to origin/main..."
git push origin HEAD:main
if ($LASTEXITCODE -ne 0) {
    $branch = (git branch --show-current).Trim()
    Write-Host "Direct push failed; pushing current branch $branch."
    git push -u origin $branch
    if ($LASTEXITCODE -ne 0) { throw "Push failed." }
    Write-Host "Open GitHub and merge branch $branch into main."
} else {
    Write-Host "Done. origin/main updated."
}
