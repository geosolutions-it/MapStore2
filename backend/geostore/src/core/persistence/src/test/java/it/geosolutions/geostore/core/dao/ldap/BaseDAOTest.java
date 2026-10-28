/*
 *  Copyright (C) 2021 GeoSolutions S.A.S.
 *  http://www.geo-solutions.it
 *
 *  GPLv3 + Classpath exception
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package it.geosolutions.geostore.core.dao.ldap;

import it.geosolutions.geostore.core.ldap.IterableNamingEnumeration;
import it.geosolutions.geostore.core.ldap.MockDirContextOperations;

import org.springframework.ldap.core.DirContextAdapter;

import java.util.Arrays;
import java.util.Collections;

import javax.naming.NamingEnumeration;
import javax.naming.NamingException;
import javax.naming.directory.BasicAttributes;
import javax.naming.directory.DirContext;
import javax.naming.directory.SearchControls;
import javax.naming.directory.SearchResult;

public abstract class BaseDAOTest {
    protected DirContext buildContextForUsers() {
        return new DirContextAdapter() {
            @Override
            public NamingEnumeration<SearchResult> search(
                    String name, String filter, SearchControls cons) throws NamingException {
                if ("ou=users".equals(name)) {
                    if ("cn=*".equals(filter)) {
                        SearchResult sr1 =
                                new SearchResult(
                                        "cn=*",
                                        null,
                                        new MockDirContextOperations() {

                                            @Override
                                            public String getNameInNamespace() {
                                                return "cn=username,ou=users";
                                            }

                                            @Override
                                            public String getStringAttribute(String name) {
                                                if ("cn".equals(name)) {
                                                    return "username";
                                                }
                                                return "";
                                            }
                                        },
                                        new BasicAttributes());
                        SearchResult sr2 =
                                new SearchResult(
                                        "cn=*",
                                        null,
                                        new MockDirContextOperations() {

                                            @Override
                                            public String getNameInNamespace() {
                                                return "cn=username2,ou=users";
                                            }

                                            @Override
                                            public String getStringAttribute(String name) {
                                                if ("cn".equals(name)) {
                                                    return "username2";
                                                }
                                                return "";
                                            }
                                        },
                                        new BasicAttributes());
                        return new IterableNamingEnumeration(Arrays.asList(sr1, sr2));
                    } else if ("(& (cn=*) (cn=username))".equals(filter)) {
                        SearchResult sr =
                                new SearchResult(
                                        "cn=*",
                                        null,
                                        new MockDirContextOperations() {

                                            @Override
                                            public String getNameInNamespace() {
                                                return "cn=username,ou=users";
                                            }

                                            @Override
                                            public String getStringAttribute(String name) {
                                                if ("cn".equals(name)) {
                                                    return "username";
                                                }
                                                return "";
                                            }
                                        },
                                        new BasicAttributes());
                        return new IterableNamingEnumeration(Collections.singletonList(sr));
                    } else if ("(& (cn=*) (cn=username2))".equals(filter)) {
                        SearchResult sr =
                                new SearchResult(
                                        "cn=*",
                                        null,
                                        new MockDirContextOperations() {

                                            @Override
                                            public String getNameInNamespace() {
                                                return "cn=username2,ou=users";
                                            }

                                            @Override
                                            public String getStringAttribute(String name) {
                                                if ("cn".equals(name)) {
                                                    return "username2";
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
    }

    protected DirContext buildContextForGroupsMembership(final String memberString) {
        return new DirContextAdapter() {
            @Override
            public NamingEnumeration<SearchResult> search(
                    String name, String filter, SearchControls cons) throws NamingException {
                if ("ou=groups".equals(name)) {
                    if ("(& (cn=*) (cn=group))".equals(filter)) {
                        SearchResult sr =
                                new SearchResult(
                                        "cn=*",
                                        null,
                                        new MockDirContextOperations() {

                                            @Override
                                            public String getNameInNamespace() {
                                                return "cn=group,ou=groups";
                                            }

                                            @Override
                                            public String getStringAttribute(String name) {
                                                if ("cn".equals(name)) {
                                                    return "group";
                                                }
                                                return "";
                                            }

                                            @Override
                                            public String[] getStringAttributes(String name) {
                                                if ("member".equals(name)) {
                                                    return new String[] {
                                                        memberString == null
                                                                ? "username"
                                                                : memberString
                                                    };
                                                }
                                                return new String[] {};
                                            }
                                        },
                                        new BasicAttributes());
                        return new IterableNamingEnumeration(Collections.singletonList(sr));
                    }
                }
                return new IterableNamingEnumeration(Collections.EMPTY_LIST);
            }
        };
    }

    protected DirContext buildContextForGroups() {
        return new DirContextAdapter() {
            @Override
            public NamingEnumeration<SearchResult> search(
                    String name, String filter, SearchControls cons) throws NamingException {
                if ("ou=groups".equals(name)) {
                    if ("cn=*".equals(filter)) {
                        SearchResult sr1 =
                                new SearchResult(
                                        "cn=*",
                                        null,
                                        new MockDirContextOperations() {

                                            @Override
                                            public String getNameInNamespace() {
                                                return "cn=group,ou=groups";
                                            }

                                            @Override
                                            public String getStringAttribute(String name) {
                                                if ("cn".equals(name)) {
                                                    return "group";
                                                }
                                                return "";
                                            }
                                        },
                                        new BasicAttributes());
                        SearchResult sr2 =
                                new SearchResult(
                                        "cn=*",
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
                        return new IterableNamingEnumeration(Arrays.asList(sr1, sr2));
                    } else if ("(& (cn=*) (cn=group))".equals(filter)) {
                        SearchResult sr =
                                new SearchResult(
                                        "cn=*",
                                        null,
                                        new MockDirContextOperations() {

                                            @Override
                                            public String getNameInNamespace() {
                                                return "cn=group,ou=groups";
                                            }

                                            @Override
                                            public String getStringAttribute(String name) {
                                                if ("cn".equals(name)) {
                                                    return "group";
                                                }
                                                return "";
                                            }

                                            @Override
                                            public String[] getStringAttributes(String name) {
                                                if ("member".equals(name)) {
                                                    return new String[] {"username"};
                                                }
                                                return super.getStringAttributes(name);
                                            }
                                        },
                                        new BasicAttributes());
                        return new IterableNamingEnumeration(Collections.singletonList(sr));
                    } else if ("(& (cn=*) (member=cn=username,ou=users))".contentEquals(filter)) {
                        SearchResult sr1 =
                                new SearchResult(
                                        "cn=*",
                                        null,
                                        new MockDirContextOperations() {

                                            @Override
                                            public String getNameInNamespace() {
                                                return "cn=group,ou=groups";
                                            }

                                            @Override
                                            public String getStringAttribute(String name) {
                                                if ("cn".equals(name)) {
                                                    return "group";
                                                }
                                                return "";
                                            }

                                            @Override
                                            public String[] getStringAttributes(String name) {
                                                if ("member".equals(name)) {
                                                    return new String[] {"username"};
                                                }
                                                return super.getStringAttributes(name);
                                            }
                                        },
                                        new BasicAttributes());
                        SearchResult sr2 =
                                new SearchResult(
                                        "cn=*",
                                        null,
                                        new MockDirContextOperations() {

                                            @Override
                                            public String getNameInNamespace() {
                                                return "cn=admin,ou=groups";
                                            }

                                            @Override
                                            public String getStringAttribute(String name) {
                                                if ("cn".equals(name)) {
                                                    return "admin";
                                                }
                                                return "";
                                            }
                                        },
                                        new BasicAttributes());
                        return new IterableNamingEnumeration(
                                Arrays.asList(new SearchResult[] {sr1, sr2}));
                    } else if ("(& (cn=*) (member=cn=username2,ou=users))".contentEquals(filter)) {
                        SearchResult sr =
                                new SearchResult(
                                        "cn=*",
                                        null,
                                        new MockDirContextOperations() {

                                            @Override
                                            public String getNameInNamespace() {
                                                return "cn=group,ou=groups";
                                            }

                                            @Override
                                            public String getStringAttribute(String name) {
                                                if ("cn".equals(name)) {
                                                    return "group";
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
    }
}
