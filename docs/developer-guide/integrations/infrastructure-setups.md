# Possible setups

Accordingly with your infrastructure, there are several setups you can imagine with MapStore and GeoServer.

## MapStore-GeoServer integration

```mermaid
flowchart TB
      MapStore -->|"Resources <br/> (e.g. maps)"| DB[(MapStore<br/> Database)]
      MapStore -->| Users, Groups, Roles| DB[(MapStore<br/> Database)]
      GeoServer --> |Users, Groups, Roles| DB
      GeoServer <--> |authkey| MapStore
```

## MapStore-LDAP + MapStore-GeoServer

```mermaid
flowchart TB
    MapStore -->| Users, Groups, Roles| DB[(MapStore<br/> Database)]
    MapStore -->|"Resources <br/> (e.g. maps)"| DB[(MapStore<br/> Database)]
    GeoServer <--> |authkey| MapStore
    DB <--> | sync on login | LDAP[(LDAP)]
    GeoServer --> |Users, Groups, Roles| DB
```

## MapStore-GeoServer + MapStore-LDAP + GeoServer-LDAP

```mermaid
flowchart TB
    MapStore -->|"Resources <br/> (e.g.maps)"| DB[(MapStore<br/> Database)]
    MapStore -->| Users, Groups, Roles| DB
    GeoServer <--> |authkey| MapStore
    GeoServer --> |Users, Groups, Roles| LDAP
    DB <--> | sync on login | LDAP[(LDAP)]
```

## MapStore-GeoServer + MapStore-LDAP (direct) + GeoServer-LDAP

```mermaid
flowchart TB
    MapStore -->|"Resources <br/> (e.g. maps)"| DB[(MapStore<br/> Database)]
    GeoServer <--> |authkey| MapStore
    MapStore -->| Users, Groups, Roles| LDAP[(LDAP)]
    GeoServer --> |Users, Groups, Roles| LDAP
```
