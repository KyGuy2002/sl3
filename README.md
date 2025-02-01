CREATE VIRTUAL TABLE all_tags_fts
USING FTS5(name,desc,aka);

CREATE VIRTUAL TABLE all_modes_fts
USING FTS5(name,desc,aka);

INSERT INTO all_tags_fts SELECT name, desc, aka FROM all_tags;

INSERT INTO all_modes_fts SELECT name, desc, aka FROM all_modes;

TODO update