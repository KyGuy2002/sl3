# NOTE: Order MUST stay name, desc, aka (since FTS5 scores based on that in the code)

DROP TABLE IF EXISTS 'all_tags_fts';
DROP TABLE IF EXISTS 'all_modes_fts';

CREATE VIRTUAL TABLE all_tags_fts
USING FTS5(name,desc,aka, id,modeId,type);

CREATE VIRTUAL TABLE all_modes_fts
USING FTS5(name,desc,aka, id);

INSERT INTO all_tags_fts SELECT name, desc, aka, id, modeId, type FROM all_tags;

INSERT INTO all_modes_fts SELECT name, desc, aka, id FROM all_modes;