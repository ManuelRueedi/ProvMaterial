PRAGMA foreign_keys = off;

/* 1. new structure — articleIdentifier → id TEXT PRIMARY KEY */
CREATE TABLE articles_new (
  id               TEXT PRIMARY KEY NOT NULL,          -- was articleIdentifier
  type             TEXT NOT NULL,
  ampacity         INTEGER NOT NULL,
  connector        TEXT,
  outputs          TEXT,
  tags             TEXT,
  lengthInMeter    REAL NOT NULL,
  locationId       INTEGER REFERENCES locations(id)       ON UPDATE CASCADE,
  storageLocationId INTEGER REFERENCES locations(id)      ON UPDATE CASCADE,
  storageLocationSection INTEGER,
  currentProjectId INTEGER REFERENCES projects(id)        ON UPDATE CASCADE,
  createdAt        INTEGER DEFAULT CURRENT_TIMESTAMP,
  updatedAt        INTEGER DEFAULT CURRENT_TIMESTAMP
);

/* 2. move the rows — copy articleIdentifier into the new id column */
INSERT INTO articles_new (
  id, type, ampacity, connector, outputs, tags, lengthInMeter,
  locationId, storageLocationId, storageLocationSection,
  currentProjectId, createdAt, updatedAt
)
SELECT
  articleIdentifier, type, ampacity, connector, outputs, tags, lengthInMeter,
  locationId, storageLocationId, storageLocationSection,
  currentProjectId, createdAt, updatedAt
FROM articles;

/* 3. swap */
DROP TABLE articles;
ALTER TABLE articles_new RENAME TO articles;

PRAGMA foreign_keys = on;
