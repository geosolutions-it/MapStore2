# LDAP integration with MapStore

The purpose of this guide is to explain how to configure MapStore to use an LDAP repository for authentication and accounting (users, roles and user-groups) instead of the standard database.

## Overview

By default the MapStore backend users service (also known as [GeoStore](https://github.com/geosolutions-it/geostore)), uses a relational database to store and fetch users details, implement authentication and assign resource access rights to users and groups (for maps, dashboards, etc.).

If you already have your users on an LDAP repository you can anyway configure MapStore to connect to your service and use it to authenticate users and associate user groups and roles, instead of using the default database. In this case the relational database will store only resources and accessory data (permissions, attributes ...) referring the users of your service.

Notice that the LDAP storage is read-only. This means that the MapStore User/Groups management UI cannot be used to manage users and groups.
This makes sense because an LDAP repository is considered an external source and should be managed externally.

If this can create confusion, you can eventually fully disable the UI when using LDAP, by removing the corresponding plugin from the MapStore configuration.

The LDAP storage can be configured in two different ways:

 * *synchronized* mode
 * *direct connection* mode (experimental)

### Synchronized mode

In _synchronized mode_, user data (users, groups, roles) is read from LDAP on every login and copied on the internal database.

Any other operation, for example getting user permissions on maps, always uses the internal database.

Synchronized mode is faster for normal use, but data may disalign when users are removed from the LDAP repository.

In general we suggest to use synchronized mode, since it is the most stable and tested one.

### Direct connection mode (experimental)

In direct connection mode, user data is always read from LDAP, for any operation, so there is no risk of misaligned data.

Direct connection is still experimental and not tested in all the possible scenarios, but will hopefully become the standard mode in an early future, because the approach is simpler and avoids most the synchronized mode defects (e.g. misalignments).

## Configuration

Configuring MapStore to use the LDAP storage requires:

 * filling out the LDAP configuration properties in the web/src/ldap/ldap.properties file to match your LDAP repository structure
 * invoking the build with the **ldap** profile 

```bash 
./build.sh <version> ldap
```

### Configuration properties

Configurable properties in the ldap.properties file include the following:

```properties 
## name of the LDAP server host
ldap.host=localhost
## port of the LDAP server
ldap.port=10389
## root path for all searches
ldap.root=dc=acme,dc=org
## complete DN of an LDAP user, with browse permissions on the used LDAP tree (optional, if browse is available to anoymous users)
ldap.userDn=
## password of the userDn LDAP user (optional, if browse is available to anoymous users)
ldap.password=
## root path for seaching users 
ldap.userBase=ou=people
## root path for seaching groups
ldap.groupBase=ou=groups
## root path for seaching roles
ldap.roleBase=ou=groups
## LDAP filter used to search for a given username ({0} is the username to search for)
ldap.userFilter=(uid={0})
## LDAP filter used to search for groups membership of a given user ({0} is the full user DN)
ldap.groupFilter=(member={0})
## LDAP filter used to search for role membership of a given user ({0} is the full user DN)
ldap.roleFilter=(member={0})

## enables / disables support for nested (hierarchical) groups; when true, a user is assigned groups recursively if its groups belong to other groups
ldap.hierachicalGroups=false
## LDAP filter used to search for groups membership of a given group ({0} is the full group DN)
ldap.nestedGroupFilter=(member={0})
## max number of nested groups that are used
ldap.nestedGroupLevels=3

## if true, all the searches are recursive from the relative root path
ldap.searchSubtree=true
## if true, all users, groups and roles names are transformed to uppercase in MapStore
ldap.convertToUpperCase=true
```

### Enabling direct connection mode

The default configuration enables the synchronized mode. To switch to direct connection mode you have to manually edit the final `geostore-spring-security.xml` to uncomment the related section at the end of the file:

```xml 
<!-- enable direct connection mode -->
<bean id="ldapUserDAO" [...]>
        [...]
    </bean>
    <bean id="ldapUserGroupDAO" [...]>
        [...]
    </bean>
    <!-- -->
```

## Testing LDAP support
If you don't have an LDAP repository at hand, a very light solution for testing is the acme-ldap java server included in the GeoServer LDAP documentation [here](https://github.com/geoserver/geoserver/blob/master/doc/en/user/source/security/tutorials/ldap/acme-ldap/src/main/java/org/acme/Ldap.java).

You can easily customize the sample data tree, editing the java code.

The sample MapStore LDAP configuration in the default `ldap.properties` file works seamlessly with acme-ldap.

## Advanced Configuration

More information about the MapStore backend storage and security service, GeoStore, is available [here](https://github.com/geosolutions-it/geostore).

In particular, more information about LDAP usage with GeoStore is in the following [Wiki page](https://github.com/geosolutions-it/geostore/wiki/LDAP-Authentication).
