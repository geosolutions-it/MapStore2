create table gs_ip_range (
    id number(19,0) not null,
    cidr varchar2(50 char) not null,
    description varchar2(255 char),
    ip_low number(39,0) not null,
    ip_high number(39,0) not null,
    constraint gs_ip_range_pkey primary key (id)
);
create index idx_ip_range_lookup on gs_ip_range(ip_low, ip_high);

create table gs_security_ip_range (
    security_id number(19,0) not null,
    ip_range_id number(19,0) not null,
    constraint gs_security_ip_range_unique_security_id_ip_range_id unique (security_id, ip_range_id),
    constraint fk_gs_security foreign key (security_id) references gs_security(id),
    constraint fk_gs_ip_range foreign key (ip_range_id) references gs_ip_range(id)
);

create index idx_security_ip_range_ip_range_id on gs_security_ip_range (ip_range_id);
create index idx_security_ip_range_security_id on gs_security_ip_range (security_id);
