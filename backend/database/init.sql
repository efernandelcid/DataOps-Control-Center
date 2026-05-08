CREATE TABLE IF NOT EXISTS connections (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    motor VARCHAR(50) NOT NULL,
    host VARCHAR(100) NOT NULL,
    port INT NOT NULL,
    database_name VARCHAR(100) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    password_encrypted TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS db_metrics (
    id SERIAL PRIMARY KEY,
    db_id INT REFERENCES connections(id),
    cpu NUMERIC(5,2),
    memory NUMERIC(5,2),
    connections_count INT,
    locks_count INT,
    deadlocks_count INT,
    disk_usage_mb NUMERIC(10,2),
    capture_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alert_log (
    id SERIAL PRIMARY KEY,
    db_id INT REFERENCES connections(id),
    severity VARCHAR(20),
    condition_triggered TEXT,
    status VARCHAR(20) DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS query_log (
    id SERIAL PRIMARY KEY,
    db_id INT REFERENCES connections(id),
    query_text TEXT,
    duration_ms INT,
    rows_returned INT,
    index_used VARCHAR(255),
    execution_plan TEXT,
    classification VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tx_log (
    id SERIAL PRIMARY KEY,
    db_id INT REFERENCES connections(id),
    session_id VARCHAR(100),
    operation_type VARCHAR(20),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    wait_time_ms INT,
    lock_type VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS backup_history (
    id SERIAL PRIMARY KEY,
    db_id INT REFERENCES connections(id),
    backup_type VARCHAR(20),
    file_name VARCHAR(255),
    file_size_mb NUMERIC(10,2),
    duration_seconds INT,
    restore_point TIMESTAMP,
    remote_url TEXT,
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);