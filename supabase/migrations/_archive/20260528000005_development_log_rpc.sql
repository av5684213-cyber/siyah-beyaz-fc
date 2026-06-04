-- player_development_log tablosu için summary view
-- API route tarafından kullanılır
CREATE OR REPLACE VIEW player_development_log_summary AS
SELECT
  player_id,
  week,
  ROUND((ovr_after - ovr_before)::numeric, 1) as ovr_change,
  TO_CHAR(created_at, 'DD Mon') as week_label,
  created_at
FROM player_development_log
ORDER BY created_at DESC;
