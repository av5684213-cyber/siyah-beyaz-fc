-- PROMPT 7: Seed facility_upgrade_costs levels 6-10
-- Each level doubles cost and duration from the previous max (level 5)
-- Uses incremental multipliers: level 6 = 2x, level 7 = 4x, level 8 = 8x, level 9 = 16x, level 10 = 32x

-- First, insert levels 6-10 based on level 5 costs if they don't exist
-- Using a procedural approach since we need to iterate

-- Level 6 (2x level 5)
INSERT INTO facility_upgrade_costs (facility_type, target_level, credits_cost, upgrade_days)
SELECT facility_type, 6, credits_cost * 2, upgrade_days * 2
FROM facility_upgrade_costs
WHERE target_level = 5
ON CONFLICT (facility_type, target_level) DO NOTHING;

-- Level 7 (4x level 5)
INSERT INTO facility_upgrade_costs (facility_type, target_level, credits_cost, upgrade_days)
SELECT facility_type, 7, credits_cost * 4, upgrade_days * 3
FROM facility_upgrade_costs
WHERE target_level = 5
ON CONFLICT (facility_type, target_level) DO NOTHING;

-- Level 8 (8x level 5)
INSERT INTO facility_upgrade_costs (facility_type, target_level, credits_cost, upgrade_days)
SELECT facility_type, 8, credits_cost * 8, upgrade_days * 4
FROM facility_upgrade_costs
WHERE target_level = 5
ON CONFLICT (facility_type, target_level) DO NOTHING;

-- Level 9 (16x level 5)
INSERT INTO facility_upgrade_costs (facility_type, target_level, credits_cost, upgrade_days)
SELECT facility_type, 9, credits_cost * 16, upgrade_days * 5
FROM facility_upgrade_costs
WHERE target_level = 5
ON CONFLICT (facility_type, target_level) DO NOTHING;

-- Level 10 (32x level 5)
INSERT INTO facility_upgrade_costs (facility_type, target_level, credits_cost, upgrade_days)
SELECT facility_type, 10, credits_cost * 32, upgrade_days * 6
FROM facility_upgrade_costs
WHERE target_level = 5
ON CONFLICT (facility_type, target_level) DO NOTHING;
