ALTER TABLE players ADD COLUMN IF NOT EXISTS specific_position VARCHAR(50);

UPDATE players SET specific_position =
  CASE
    WHEN position = 'GK' THEN 'GK'
    WHEN position = 'DEF' THEN (ARRAY['CB','LB','RB','LWB','RWB'])[floor(random()*5)+1]
    WHEN position = 'MID' THEN (ARRAY['CDM','CM','CAM','LM','RM','LW','RW'])[floor(random()*7)+1]
    WHEN position = 'FWD' THEN (ARRAY['CF','ST','LW','RW'])[floor(random()*4)+1]
    ELSE 'CM'
  END
WHERE specific_position IS NULL;
