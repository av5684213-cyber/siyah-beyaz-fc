-- GRUP 9: Oyuncu sigorta sistemi - sakatlık anında tazminat
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_insured BOOLEAN DEFAULT false;
