CREATE TABLE gs_ip_range (
    id BIGINT NOT NULL,
    cidr VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    ip_low NUMERIC(39,0),
    ip_high NUMERIC(39,0),
    CONSTRAINT gs_ip_range_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_ip_range_lookup ON gs_ip_range(ip_low, ip_high);

CREATE TABLE gs_security_ip_range (
    security_id BIGINT NOT NULL,
    ip_range_id BIGINT NOT NULL,
    CONSTRAINT gs_security_ip_range_unique_security_id_ip_range_id UNIQUE (security_id, ip_range_id),
    CONSTRAINT fk_gs_security FOREIGN KEY (security_id) REFERENCES gs_security(id),
    CONSTRAINT fk_gs_ip_range FOREIGN KEY (ip_range_id) REFERENCES gs_ip_range(id)
);
CREATE INDEX idx_security_ip_range_ip_range_id ON gs_security_ip_range (ip_range_id);
CREATE INDEX idx_security_ip_range_security_id ON gs_security_ip_range (security_id);
