package it.geosolutions.geostore.services.rest.security;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import it.geosolutions.geostore.core.ldap.IterableNamingEnumeration;
import it.geosolutions.geostore.core.ldap.MockContextSource;
import it.geosolutions.geostore.core.security.SimpleGrantedAuthoritiesMapper;

import org.junit.Test;
import org.springframework.ldap.core.DirContextAdapter;
import org.springframework.security.core.GrantedAuthority;

import java.util.*;

import javax.naming.NamingEnumeration;
import javax.naming.NamingException;
import javax.naming.directory.BasicAttributes;
import javax.naming.directory.DirContext;
import javax.naming.directory.SearchControls;
import javax.naming.directory.SearchResult;

public class GeoStoreLdapAuthoritiesPopulatorTest {

    DirContext ctx =
            new DirContextAdapter() {
                @Override
                public NamingEnumeration<SearchResult> search(
                        String name, String filter, SearchControls cons) throws NamingException {
                    if ("ou=groups".equals(name)) {
                        if ("(member=uid=bill,ou=people)".equals(filter)) {
                            List<SearchResult> groups = new ArrayList<SearchResult>();
                            SearchResult sr =
                                    new SearchResult(
                                            "cn=group1",
                                            null,
                                            new MockDirContextOperations() {

                                                @Override
                                                public String getNameInNamespace() {
                                                    return "cn=group1,ou=groups";
                                                }

                                                @Override
                                                public String getStringAttribute(String name) {
                                                    if ("cn".equals(name)) {
                                                        return "group1";
                                                    }
                                                    return "";
                                                }
                                            },
                                            new BasicAttributes());

                            SearchResult sr2 =
                                    new SearchResult(
                                            "cn=group2",
                                            null,
                                            new MockDirContextOperations() {

                                                @Override
                                                public String getNameInNamespace() {
                                                    return "cn=group2,ou=groups";
                                                }

                                                @Override
                                                public String getStringAttribute(String name) {
                                                    if ("cn".equals(name)) {
                                                        return "group2";
                                                    }
                                                    return "";
                                                }
                                            },
                                            new BasicAttributes());
                            return new IterableNamingEnumeration(Arrays.asList(sr, sr2));
                        } else if ("(member=cn=group1,ou=groups)".equals(filter)) {
                            List<SearchResult> groups = new ArrayList<SearchResult>();
                            SearchResult sr =
                                    new SearchResult(
                                            "cn=parentgroup1",
                                            null,
                                            new MockDirContextOperations() {

                                                @Override
                                                public String getNameInNamespace() {
                                                    return "cn=parentgroup1,ou=groups";
                                                }

                                                @Override
                                                public String getStringAttribute(String name) {
                                                    if ("cn".equals(name)) {
                                                        return "parentgroup1";
                                                    }
                                                    return "";
                                                }
                                            },
                                            new BasicAttributes());
                            return new IterableNamingEnumeration(Collections.singletonList(sr));
                        }
                    }
                    return new IterableNamingEnumeration(Collections.EMPTY_LIST);
                }
            };

    @Test
    public void testNestedGroupsEnabled() {
        GeoStoreLdapAuthoritiesPopulator authoritiesPopulator =
                new GeoStoreLdapAuthoritiesPopulator(
                        new MockContextSource(ctx), "ou=groups", "ou=roles");
        authoritiesPopulator.setEnableHierarchicalGroups(true);
        Set<GrantedAuthority> authorities =
                authoritiesPopulator.getGroupMembershipRoles("uid=bill,ou=people", "bill");
        assertEquals(3, authorities.size());
    }

    @Test
    public void testNestedGroupsDisabled() {

        GeoStoreLdapAuthoritiesPopulator authoritiesPopulator =
                new GeoStoreLdapAuthoritiesPopulator(
                        new MockContextSource(ctx), "ou=groups", "ou=roles");
        authoritiesPopulator.setEnableHierarchicalGroups(false);
        Set<GrantedAuthority> authorities =
                authoritiesPopulator.getGroupMembershipRoles("uid=bill,ou=people", "bill");
        assertEquals(2, authorities.size());
    }

    @Test
    public void testDropUnmappedRoles() {

        GeoStoreLdapAuthoritiesPopulator authoritiesPopulator =
                new GeoStoreLdapAuthoritiesPopulator(
                        new MockContextSource(ctx), "ou=groups", "ou=groups");
        authoritiesPopulator.setEnableHierarchicalGroups(false);
        Map<String, String> mappings = new HashMap<>();
        mappings.put("ROLE_GROUP2", "ROLE_ADMIN");
        SimpleGrantedAuthoritiesMapper mapper = new SimpleGrantedAuthoritiesMapper(mappings);
        mapper.setDropUnmapped(true);
        authoritiesPopulator.setRoleMapper(mapper);
        Set<GrantedAuthority> authorities =
                authoritiesPopulator.getGroupMembershipRoles("uid=bill,ou=people", "bill");
        List<String> expected = Arrays.asList("ROLE_ADMIN", "GROUP1", "GROUP2");
        List<String> stringAuthorities = authorities.stream().map(a -> a.getAuthority()).toList();
        assertEquals(expected.size(), stringAuthorities.size());
        assertTrue(stringAuthorities.containsAll(expected));
    }

    @Test
    public void testDropUnmappedGroups() {

        GeoStoreLdapAuthoritiesPopulator authoritiesPopulator =
                new GeoStoreLdapAuthoritiesPopulator(
                        new MockContextSource(ctx), "ou=groups", "ou=roles");
        authoritiesPopulator.setEnableHierarchicalGroups(false);
        Map<String, String> mappings = new HashMap<>();
        mappings.put("GROUP2", "MAPPED_GROUP");
        SimpleGrantedAuthoritiesMapper mapper = new SimpleGrantedAuthoritiesMapper(mappings);
        mapper.setDropUnmapped(true);
        authoritiesPopulator.setGroupMapper(mapper);
        Set<GrantedAuthority> authorities =
                authoritiesPopulator.getGroupMembershipRoles("uid=bill,ou=people", "bill");
        assertEquals(1, authorities.size());
        assertEquals("MAPPED_GROUP", authorities.iterator().next().getAuthority());
    }
}
