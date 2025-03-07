# NOTE: Order MUST stay name, desc, aka (since FTS5 scores based on that in the code)

DROP TABLE IF EXISTS 'all_tags_fts';
DROP TABLE IF EXISTS 'all_modes_fts';

CREATE VIRTUAL TABLE all_tags_fts
USING FTS5(name,desc,aka, id,modeId,type);

CREATE VIRTUAL TABLE all_modes_fts
USING FTS5(name,desc,aka, id);

INSERT INTO all_tags_fts SELECT name, desc, aka, id, modeId, type FROM all_tags;

INSERT INTO all_modes_fts SELECT name, desc, aka, id FROM all_modes;


# all_modes triggers
CREATE TRIGGER all_modes_fts_before_delete BEFORE DELETE ON all_modes BEGIN
    DELETE FROM all_modes_fts WHERE all_modes_fts.id=old.id;
END;

CREATE TRIGGER all_modes_fts_update AFTER UPDATE ON all_modes BEGIN
    INSERT INTO all_modes_fts(name, desc, aka, id) SELECT name, desc, aka, id FROM all_modes WHERE new.id = all_modes.id;
END;

CREATE TRIGGER all_modes_fts_after_insert AFTER INSERT ON all_modes BEGIN
    INSERT INTO all_modes_fts(name, desc, aka, id) SELECT name, desc, aka, id FROM all_modes WHERE new.id = all_modes.id;
END;

CREATE TRIGGER all_modes_fts_before_update BEFORE UPDATE ON all_modes BEGIN
    DELETE FROM all_modes_fts WHERE all_modes_fts.id=old.id;
END;



# all_tags triggers
CREATE TRIGGER all_tags_fts_before_delete BEFORE DELETE ON all_tags BEGIN
    DELETE FROM all_tags_fts WHERE all_tags_fts.id=old.id;
END;

CREATE TRIGGER all_tags_fts_update AFTER UPDATE ON all_tags BEGIN
    INSERT INTO all_tags_fts(name, desc, aka, id, modeId, type) SELECT name, desc, aka, id, modeId, type FROM all_tags WHERE new.id = all_tags.id;
END;

CREATE TRIGGER all_tags_fts_after_insert AFTER INSERT ON all_tags BEGIN
    INSERT INTO all_tags_fts(name, desc, aka, id, modeId, type) SELECT name, desc, aka, id, modeId, type FROM all_tags WHERE new.id = all_tags.id;
END;

CREATE TRIGGER all_tags_fts_before_update BEFORE UPDATE ON all_tags BEGIN
    DELETE FROM all_tags_fts WHERE all_tags_fts.id=old.id;
END;