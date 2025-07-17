const { DatabaseSync } = require('node:sqlite')
const db = new DatabaseSync('database.db')

db.prepare(
  `CREATE TABLE IF NOT EXISTS Patients (
  id INTEGER,
  card_no INTEGER,
  name TEXT,
  mobile TEXT,
  nid INTEGER,
  address TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
)`
).run()

db.prepare(
  `CREATE TABLE IF NOT EXISTS Users (
  id INTEGER,
  name TEXT,
  password TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
)`
).run()

db.close()
