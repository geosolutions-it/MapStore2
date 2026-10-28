alter table gs_resource add column creator varchar(255);
alter table gs_resource add column editor varchar(255);
alter table gs_resource add column advertised bool not null default true;

-- Set the Resource Creator whether this is NULL
update gs_resource as gsr
set creator = subquery.name
from
(select gsu.name, gss.resource_id from geostore.gs_security as gss join geostore.gs_user as gsu on (gss.user_id = gsu.id)
 where gss.user_id IS NOT NULL) as subquery
where gsr.id = subquery.resource_id and gsr.creator IS NULL;