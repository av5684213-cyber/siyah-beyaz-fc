-- FFP (Financial Fair Play) kısıtlama flag'i
-- ffp_restricted=true olan profiller transfer yapamaz
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ffp_restricted BOOLEAN DEFAULT FALSE;
