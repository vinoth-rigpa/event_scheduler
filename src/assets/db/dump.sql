CREATE TABLE IF NOT EXISTS device_codes(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT NOT NULL,
    activation_code TEXT NOT NULL
);

INSERT or IGNORE INTO device_codes(id, uuid, activation_code) VALUES (1, 'b7159bb6810cd0fc', '733891');
INSERT or IGNORE INTO device_codes(id, uuid, activation_code) VALUES (2, 'b7159bb6810cd0fd', '123456');
INSERT or IGNORE INTO device_codes(id, uuid, activation_code) VALUES (3, 'b7159bb6810cd0ff', '987654');

CREATE TABLE IF NOT EXISTS device_config(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT NOT NULL,
    room_id TEXT NOT NULL,
    room_name TEXT NOT NULL,
    room_password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS departments(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dept_name TEXT NOT NULL, 
    dept_password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS events(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id TEXT NOT NULL, 
    event_name TEXT NOT NULL, 
    dept_name TEXT NOT NULL, 
    organizer TEXT NOT NULL, 
    start_datetime TEXT NOT NULL, 
    end_datetime TEXT NOT NULL, 
    dept_password TEXT NOT NULL,
    event_status INTEGER DEFAULT 0,
    sync_status INTEGER DEFAULT 0
);