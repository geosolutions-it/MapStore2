/*
 *  Copyright (C) 2015-2025 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.services.rest.security;

import static org.junit.Assert.*;

import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserAttribute;
import it.geosolutions.geostore.core.model.UserGroup;
import it.geosolutions.geostore.core.model.UserGroupAttribute;
import it.geosolutions.geostore.core.model.enums.Role;
import it.geosolutions.geostore.core.security.MapExpressionUserMapper;
import it.geosolutions.geostore.services.UserGroupService;
import it.geosolutions.geostore.services.dto.ShortResource;
import it.geosolutions.geostore.services.exception.BadRequestServiceEx;
import it.geosolutions.geostore.services.exception.NotFoundServiceEx;
import it.geosolutions.geostore.services.rest.utils.MockedUserService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mockito;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.context.request.RequestContextHolder;

import java.io.IOException;
import java.util.*;

/**
 * Enhanced tests for GeoStore authentication filters covering: - username remapping -
 * provider-scoped reconciliation of remote groups - uppercase group handling & tagging with
 * sourceService - role recomputation (present/empty/missing roles claims)
 *
 * <p>Plus: tests for UserGroupService#getWithAttributes and #upsertAttribute and a guard to ensure
 * no lazy attribute access during reconciliation.
 */
public class GeoStoreAuthenticationFilterTest {

    private static final String USERNAME_HEADER = "username";
    private static final String SAMPLE_USER = "myuser";

    private MockedUserService userService;
    private GeoStoreRequestHeadersAuthenticationFilter headerFilter;
    private HttpServletRequest req;
    private HttpServletResponse resp;

    @Before
    public void setUp() {
        // Setup for the header-based filter tests.
        userService = new MockedUserService();
        headerFilter = new GeoStoreRequestHeadersAuthenticationFilter();
        headerFilter.setUserNameHeader(USERNAME_HEADER);
        headerFilter.setUserService(userService);
        headerFilter.setAutoCreateUser(true);

        req = Mockito.mock(HttpServletRequest.class);
        resp = Mockito.mock(HttpServletResponse.class);

        Mockito.when(req.getHeader(USERNAME_HEADER)).thenReturn(SAMPLE_USER);
        Mockito.when(req.getHeader("header1")).thenReturn("value1");
        Mockito.when(req.getHeaderNames())
                .thenReturn(new Vector<>(Arrays.asList(USERNAME_HEADER, "header1")).elements());
    }

    @After
    public void tearDown() {
        SecurityContextHolder.getContext().setAuthentication(null);
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    public void testAutoCreate() throws IOException, ServletException, NotFoundServiceEx {
        headerFilter.doFilter(
                req,
                resp,
                new FilterChain() {
                    @Override
                    public void doFilter(ServletRequest arg0, ServletResponse arg1)
                            throws IOException, ServletException {
                        // No-op chain for testing.
                    }
                });

        User user = userService.get(SAMPLE_USER);
        checkUser(user);
        assertTrue("User should be enabled", user.isEnabled());
    }

    @Test
    public void testAutoCreateDisabled() throws IOException, ServletException, NotFoundServiceEx {
        headerFilter.setEnableAutoCreatedUsers(false);
        headerFilter.doFilter(
                req,
                resp,
                new FilterChain() {
                    @Override
                    public void doFilter(ServletRequest arg0, ServletResponse arg1)
                            throws IOException, ServletException {
                        // No-op chain for testing.
                    }
                });

        User user = userService.get(SAMPLE_USER);
        checkUser(user);
        assertFalse("User should be disabled", user.isEnabled());
    }

    @Test
    public void testAutoCreateAttributesMapping()
            throws IOException, ServletException, NotFoundServiceEx {

        // Map header "header1" to user attribute "attr1".
        headerFilter.setUserMapper(
                new MapExpressionUserMapper(Collections.singletonMap("attr1", "header1")));

        headerFilter.doFilter(
                req,
                resp,
                new FilterChain() {
                    @Override
                    public void doFilter(ServletRequest arg0, ServletResponse arg1)
                            throws IOException, ServletException {
                        // No-op chain for testing.
                    }
                });

        User user = userService.get(SAMPLE_USER);
        checkUser(user);
        assertNotNull("Attributes should not be null", user.getAttribute());
        assertEquals("Should have one attribute", 1, user.getAttribute().size());
        UserAttribute attr = user.getAttribute().get(0);
        assertEquals("Attribute name should be 'attr1'", "attr1", attr.getName());
        assertEquals("Attribute value should be 'value1'", "value1", attr.getValue());
    }

    //
    //    // ---------------------------------------------------------------------
    //    // OAuth2/OIDC related tests
    //    // ---------------------------------------------------------------------
    //
    //    /**
    //     * Username remapping via uniqueUsername claim. createPreAuthentication() receives the
    //     * already-resolved username from getPreAuthenticatedPrincipal(), so the remapping is done
    //     * there. Here we verify that createPreAuthentication() faithfully passes the username
    // through
    //     * to retrieveUserWithAuthorities() and produces the correct User principal.
    //     */
    //    @Test
    //    public void testUsernameRemapping() throws Exception {
    //        final String REMAPPED_USERNAME = "remappedUser";
    //
    //        TestOAuth2Configuration config = new TestOAuth2Configuration();
    //        config.setPrincipalKey("principal");
    //        config.setUniqueUsername("unique");
    //        config.setBeanName("testBean");
    //        config.setAutoCreateUser(true);
    //
    //        GeoStoreOAuthRestTemplate rt = Mockito.mock(GeoStoreOAuthRestTemplate.class);
    //        OAuth2ClientContext ctx = Mockito.mock(OAuth2ClientContext.class);
    //        Mockito.when(ctx.getAccessToken()).thenReturn(new DefaultOAuth2AccessToken("t"));
    //        Mockito.when(rt.getOAuth2ClientContext()).thenReturn(ctx);
    //
    //        OAuth2GeoStoreAuthenticationFilter oauth2Filter =
    //                new OAuth2GeoStoreAuthenticationFilter(null, rt, config, null) {
    //
    //                    @Override
    //                    protected User retrieveUserWithAuthorities(
    //                            String username,
    //                            HttpServletRequest request,
    //                            HttpServletResponse response) {
    //                        User user = new User();
    //                        user.setName(username);
    //                        user.setRole(Role.USER);
    //                        user.setEnabled(true);
    //                        user.setAttribute(Collections.emptyList());
    //                        user.setGroups(new HashSet<>());
    //                        return user;
    //                    }
    //
    //                    @Override
    //                    protected void configureRestTemplate() {
    //                        /* no-op */
    //                    }
    //                };
    //
    //        MockHttpServletRequest req = new MockHttpServletRequest();
    //        MockHttpServletResponse resp = new MockHttpServletResponse();
    //        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(req));
    //
    //        // Simulate that getPreAuthenticatedPrincipal() already resolved the unique username
    //        PreAuthenticatedAuthenticationToken authToken =
    //                oauth2Filter.createPreAuthentication(REMAPPED_USERNAME, req, resp);
    //        assertNotNull("Authentication token should not be null", authToken);
    //
    //        User user = (User) authToken.getPrincipal();
    //        assertNotNull("User should not be null", user);
    //        assertEquals(
    //                "Username should match the resolved unique claim value",
    //                REMAPPED_USERNAME,
    //                user.getName());
    //    }
    //
    //    /** Uppercase group handling and assignment; uses a real JWT payload for groups. */
    //    @Test
    //    public void testGroupNamesUppercaseAndUserGroupAssignment() throws Exception {
    //        final String GROUP_FROM_TOKEN = "groupA";
    //        final String EXPECTED_GROUP = "GROUPA";
    //
    //        TestOAuth2Configuration config = new TestOAuth2Configuration();
    //        config.setGroupsClaim("groups");
    //        config.setBeanName("testBean");
    //        config.setAutoCreateUser(true);
    //        config.setGroupNamesUppercase(true);
    //
    //        DummyUserGroupService dummyGroupService = new DummyUserGroupService();
    //
    //        GeoStoreOAuthRestTemplate rt = Mockito.mock(GeoStoreOAuthRestTemplate.class);
    //        OAuth2ClientContext ctx = Mockito.mock(OAuth2ClientContext.class);
    //        Mockito.when(ctx.getAccessToken()).thenReturn(new DefaultOAuth2AccessToken("t"));
    //        Mockito.when(rt.getOAuth2ClientContext()).thenReturn(ctx);
    //
    //        OAuth2GeoStoreAuthenticationFilter oauth2Filter =
    //                new OAuth2GeoStoreAuthenticationFilter(null, rt, config, null) {
    //
    //                    @Override
    //                    protected User retrieveUserWithAuthorities(
    //                            String username,
    //                            HttpServletRequest request,
    //                            HttpServletResponse response) {
    //                        User user = new User();
    //                        user.setId(1L);
    //                        user.setName(username);
    //                        user.setRole(Role.USER);
    //                        user.setEnabled(true);
    //                        user.setAttribute(Collections.emptyList());
    //                        user.setGroups(new HashSet<>());
    //                        return user;
    //                    }
    //
    //                    @Override
    //                    protected void configureRestTemplate() {
    //                        /* no-op */
    //                    }
    //                };
    //        oauth2Filter.setUserGroupService(dummyGroupService);
    //
    //        // put an id_token with groups claim into the request context
    //        String jwt = unsignedJwtJson("{\"groups\":[\"" + GROUP_FROM_TOKEN + "\"]}");
    //        MockHttpServletRequest req = new MockHttpServletRequest();
    //        ServletRequestAttributes attrs = new ServletRequestAttributes(req);
    //        attrs.setAttribute(GeoStoreOAuthRestTemplate.ID_TOKEN_VALUE, jwt, 0);
    //        RequestContextHolder.setRequestAttributes(attrs);
    //
    //        PreAuthenticatedAuthenticationToken authToken =
    //                oauth2Filter.createPreAuthentication("anyuser", req, new
    // MockHttpServletResponse());
    //        assertNotNull(authToken);
    //
    //        User user = (User) authToken.getPrincipal();
    //        assertNotNull(user);
    //
    //        boolean found =
    //                user.getGroups().stream().anyMatch(g ->
    // EXPECTED_GROUP.equals(g.getGroupName()));
    //        assertTrue("User should be assigned to group " + EXPECTED_GROUP, found);
    //
    //        UserGroup groupFromService = dummyGroupService.get(EXPECTED_GROUP);
    //        assertNotNull(
    //                "Dummy group service should contain group " + EXPECTED_GROUP,
    // groupFromService);
    //        assertEquals(
    //                "testBean",
    //                dummyGroupService.getWithAttributes(groupFromService.getId()).getAttributes()
    //                        .stream()
    //                        .filter(a -> "sourceService".equals(a.getName()))
    //                        .findFirst()
    //                        .orElseThrow()
    //                        .getValue());
    //    }
    //
    //    /**
    //     * Provider-scoped remote groups reconcile: keep local & other providers, add new from
    // token.
    //     */
    //    @Test
    //    public void testRemoteGroupsUpdateProviderScoped() throws Exception {
    //        GeoStoreOAuthRestTemplate rt = Mockito.mock(GeoStoreOAuthRestTemplate.class);
    //        OAuth2ClientContext ctx = Mockito.mock(OAuth2ClientContext.class);
    //        Mockito.when(ctx.getAccessToken())
    //                .thenReturn(new DefaultOAuth2AccessToken("oauth2-test-token"));
    //        Mockito.when(rt.getOAuth2ClientContext()).thenReturn(ctx);
    //
    //        TestOAuth2Configuration config = new TestOAuth2Configuration();
    //        config.setGroupsClaim("groups");
    //        config.setBeanName("testBean"); // provider == beanName by override
    //        config.setAutoCreateUser(true);
    //        config.setGroupNamesUppercase(true);
    //
    //        DummyUserGroupService userGroupService = new DummyUserGroupService();
    //
    //        User user = new User();
    //        user.setId(1000L);
    //        user.setRole(Role.USER);
    //        user.setEnabled(true);
    //        user.setAttribute(Collections.emptyList());
    //
    //        // local group (no sourceService)
    //        UserGroup local = new UserGroup();
    //        local.setGroupName("local");
    //        local.setUsers(new ArrayList<>(Collections.singletonList(user)));
    //        userGroupService.insert(local);
    //
    //        // remote group from another provider -> should be KEPT
    //        UserGroup otherRemote = new UserGroup();
    //        otherRemote.setGroupName("remote");
    //        otherRemote.setUsers(new ArrayList<>(Collections.singletonList(user)));
    //        userGroupService.insert(otherRemote);
    //        userGroupService.upsertAttribute(otherRemote.getId(), "sourceService", "other");
    //
    //        user.setGroups(new HashSet<>(Arrays.asList(local, otherRemote)));
    //
    //        OAuth2GeoStoreAuthenticationFilter filter =
    //                new OAuth2GeoStoreAuthenticationFilter(null, rt, config, null) {
    //                    @Override
    //                    protected User retrieveUserWithAuthorities(
    //                            String username,
    //                            HttpServletRequest request,
    //                            HttpServletResponse response) {
    //                        user.setName(username);
    //                        return user;
    //                    }
    //
    //                    @Override
    //                    protected void configureRestTemplate() {
    //                        /* no-op */
    //                    }
    //                };
    //        filter.setUserGroupService(userGroupService);
    //
    //        // token contains groups: ["admin","developer"]
    //        String jwt = unsignedJwtJson("{\"groups\":[\"admin\",\"developer\"]}");
    //        MockHttpServletRequest req = new MockHttpServletRequest();
    //        ServletRequestAttributes attrs = new ServletRequestAttributes(req);
    //        attrs.setAttribute(GeoStoreOAuthRestTemplate.ID_TOKEN_VALUE, jwt, 0);
    //        RequestContextHolder.setRequestAttributes(attrs);
    //
    //        PreAuthenticatedAuthenticationToken authToken =
    //                filter.createPreAuthentication("test-user", req, new
    // MockHttpServletResponse());
    //        assertNotNull(authToken);
    //
    //        User authenticatedUser = (User) authToken.getPrincipal();
    //        assertNotNull(authenticatedUser);
    //
    //        Set<UserGroup> groups = authenticatedUser.getGroups();
    //        // local + otherRemote + ADMIN + DEVELOPER = 4 groups (provider-scoped behavior)
    //        assertEquals(4, groups.size());
    //
    //        Map<String, UserGroup> byName =
    //                groups.stream()
    //                        .collect(Collectors.toMap(UserGroup::getGroupName,
    // Function.identity()));
    //        assertTrue(byName.containsKey("local"));
    //        assertTrue(byName.containsKey("remote")); // kept (other provider)
    //        assertTrue(byName.containsKey("ADMIN"));
    //        assertTrue(byName.containsKey("DEVELOPER"));
    //
    //        // new groups tagged with sourceService = provider ("testBean")
    //        assertEquals(
    //                "testBean",
    //
    // userGroupService.getWithAttributes(byName.get("ADMIN").getId()).getAttributes()
    //                        .stream()
    //                        .filter(a -> "sourceService".equals(a.getName()))
    //                        .findFirst()
    //                        .orElseThrow()
    //                        .getValue());
    //        assertEquals(
    //                "testBean",
    //
    // userGroupService.getWithAttributes(byName.get("DEVELOPER").getId()).getAttributes()
    //                        .stream()
    //                        .filter(a -> "sourceService".equals(a.getName()))
    //                        .findFirst()
    //                        .orElseThrow()
    //                        .getValue());
    //    }
    //
    //    /** When token has empty groups [], remove provider's remote groups (keep others). */
    //    @Test
    //    public void testRemoteGroupsRemovalWhenGroupsEmpty_noLazyAccess() throws Exception {
    //        GeoStoreOAuthRestTemplate rt = Mockito.mock(GeoStoreOAuthRestTemplate.class);
    //        OAuth2ClientContext ctx = Mockito.mock(OAuth2ClientContext.class);
    //        Mockito.when(ctx.getAccessToken())
    //                .thenReturn(new DefaultOAuth2AccessToken("oauth2-test-token"));
    //        Mockito.when(rt.getOAuth2ClientContext()).thenReturn(ctx);
    //
    //        TestOAuth2Configuration config = new TestOAuth2Configuration();
    //        config.setGroupsClaim("groups");
    //        config.setBeanName("testBean");
    //        config.setAutoCreateUser(true);
    //        config.setGroupNamesUppercase(true);
    //
    //        DummyUserGroupService userGroupService = new DummyUserGroupService();
    //
    //        User user = new User();
    //        user.setId(2000L);
    //        user.setRole(Role.USER);
    //        user.setEnabled(true);
    //        user.setAttribute(Collections.emptyList());
    //
    //        // provider remote group (to be removed)
    //        UserGroup msAdmin = new UserGroup();
    //        msAdmin.setGroupName("MS_ADMIN_GROUP");
    //        msAdmin.setUsers(new ArrayList<>(Collections.singletonList(user)));
    //        userGroupService.insert(msAdmin);
    //        userGroupService.upsertAttribute(msAdmin.getId(), "sourceService", "testBean");
    //
    //        // other provider remote group (kept)
    //        UserGroup other = new UserGroup();
    //        other.setGroupName("OTHER_GROUP");
    //        other.setUsers(new ArrayList<>(Collections.singletonList(user)));
    //        userGroupService.insert(other);
    //        userGroupService.upsertAttribute(other.getId(), "sourceService", "other");
    //
    //        // local (kept)
    //        UserGroup local = new UserGroup();
    //        local.setGroupName("LOCAL_GROUP");
    //        local.setUsers(new ArrayList<>(Collections.singletonList(user)));
    //        userGroupService.insert(local);
    //
    //        user.setGroups(new HashSet<>(Arrays.asList(msAdmin, other, local)));
    //
    //        OAuth2GeoStoreAuthenticationFilter filter =
    //                new OAuth2GeoStoreAuthenticationFilter(null, rt, config, null) {
    //                    @Override
    //                    protected User retrieveUserWithAuthorities(
    //                            String username,
    //                            HttpServletRequest request,
    //                            HttpServletResponse response) {
    //                        user.setName(username);
    //                        return user;
    //                    }
    //
    //                    @Override
    //                    protected void configureRestTemplate() {
    //                        /* no-op */
    //                    }
    //                };
    //        filter.setUserGroupService(userGroupService);
    //
    //        // groups claim present but empty []
    //        String jwt = unsignedJwtJson("{\"groups\":[]}");
    //        MockHttpServletRequest req = new MockHttpServletRequest();
    //        ServletRequestAttributes attrs = new ServletRequestAttributes(req);
    //        attrs.setAttribute(GeoStoreOAuthRestTemplate.ID_TOKEN_VALUE, jwt, 0);
    //        RequestContextHolder.setRequestAttributes(attrs);
    //
    //        // Reconciliation should remove the provider's remote group but keep others.
    //        PreAuthenticatedAuthenticationToken token =
    //                filter.createPreAuthentication("test", req, new MockHttpServletResponse());
    //        assertNotNull(token);
    //        User u = (User) token.getPrincipal();
    //        Set<String> groups =
    //
    // u.getGroups().stream().map(UserGroup::getGroupName).collect(Collectors.toSet());
    //        // provider remote removed, others kept
    //        assertFalse(groups.contains("MS_ADMIN_GROUP"));
    //        assertTrue(groups.contains("OTHER_GROUP"));
    //        assertTrue(groups.contains("LOCAL_GROUP"));
    //    }
    //
    //    /** Roles: present claim -> recompute; empty -> demote; missing -> preserve. */
    //    @Test
    //    public void testRoleResolutionPresentEmptyMissing() throws Exception {
    //        GeoStoreOAuthRestTemplate rt = Mockito.mock(GeoStoreOAuthRestTemplate.class);
    //        OAuth2ClientContext ctx = Mockito.mock(OAuth2ClientContext.class);
    //        Mockito.when(ctx.getAccessToken()).thenReturn(new DefaultOAuth2AccessToken("t"));
    //        Mockito.when(rt.getOAuth2ClientContext()).thenReturn(ctx);
    //
    //        TestOAuth2Configuration config = new TestOAuth2Configuration();
    //        config.setRolesClaim("roles");
    //        config.setBeanName("testBean");
    //        config.setAutoCreateUser(true);
    //
    //        DummyUserGroupService ugs = new DummyUserGroupService();
    //
    //        User user = new User();
    //        user.setId(3000L);
    //        user.setRole(Role.USER);
    //        user.setEnabled(true);
    //        user.setAttribute(Collections.emptyList());
    //        user.setGroups(new HashSet<>());
    //
    //        OAuth2GeoStoreAuthenticationFilter filter =
    //                new OAuth2GeoStoreAuthenticationFilter(null, rt, config, null) {
    //                    @Override
    //                    protected User retrieveUserWithAuthorities(
    //                            String username,
    //                            HttpServletRequest request,
    //                            HttpServletResponse response) {
    //                        user.setName(username);
    //                        return user;
    //                    }
    //
    //                    @Override
    //                    protected void configureRestTemplate() {
    //                        /* no-op */
    //                    }
    //                };
    //        filter.setUserGroupService(ugs);
    //
    //        // 1) roles present with ADMIN -> set to ADMIN
    //        setIdToken("{\"roles\":[\"ADMIN\"]}");
    //        PreAuthenticatedAuthenticationToken t1 =
    //                filter.createPreAuthentication(
    //                        "u", new MockHttpServletRequest(), new MockHttpServletResponse());
    //        assertEquals(Role.ADMIN, ((User) t1.getPrincipal()).getRole());
    //
    //        // 2) roles present but empty -> demote to default (USER)
    //        user.setRole(Role.ADMIN);
    //        setIdToken("{\"roles\":[]}");
    //        PreAuthenticatedAuthenticationToken t2 =
    //                filter.createPreAuthentication(
    //                        "u", new MockHttpServletRequest(), new MockHttpServletResponse());
    //        assertEquals(Role.USER, ((User) t2.getPrincipal()).getRole());
    //
    //        // 3) roles MISSING entirely -> fall back to authenticatedDefaultRole (USER)
    //        //    When rolesClaim is configured but absent from the token, the IdP is the
    //        //    source of truth and we fall back to the default role instead of preserving
    //        //    the stale DB role (prevents stale ADMIN escalation).
    //        user.setRole(Role.GUEST);
    //        setIdToken("{\"some\":\"thing\"}");
    //        PreAuthenticatedAuthenticationToken t3 =
    //                filter.createPreAuthentication(
    //                        "u", new MockHttpServletRequest(), new MockHttpServletResponse());
    //        assertEquals(Role.USER, ((User) t3.getPrincipal()).getRole());
    //    }
    //
    //    // ---------------------------------------------------------------------
    //    // NEW TESTS for getWithAttributes / upsertAttribute
    //    // ---------------------------------------------------------------------
    //
    //    @Test
    //    public void testGetWithAttributes_returnsEagerCopy_noMutationLeak()
    //            throws BadRequestServiceEx, NotFoundServiceEx {
    //        DummyUserGroupService svc = new DummyUserGroupService();
    //
    //        UserGroup g = new UserGroup();
    //        g.setGroupName("TEAM");
    //        List<UserGroupAttribute> attrs = new ArrayList<>();
    //        attrs.add(attr("k1", "v1"));
    //        attrs.add(attr("k2", "v2"));
    //        g.setAttributes(attrs);
    //
    //        long id = svc.insert(g);
    //
    //        // Plain get should not expose attributes (simulates non-eager load)
    //        assertTrue(
    //                "Plain get should not expose attributes (simulates non-eager load)",
    //                svc.get(id).getAttributes() == null || svc.get(id).getAttributes().isEmpty());
    //
    //        // getWithAttributes must return a copy with attributes populated
    //        UserGroup loaded = svc.getWithAttributes(id);
    //        assertNotNull(loaded);
    //        assertEquals(2, loaded.getAttributes().size());
    //
    //        // Mutate returned list - should NOT affect service store (deep-copy behavior)
    //        loaded.getAttributes().clear();
    //        assertEquals(
    //                "Clearing returned attributes must not affect stored attributes",
    //                2,
    //                svc.getWithAttributes(id).getAttributes().size());
    //    }
    //
    //    @Test
    //    public void testUpsertAttribute_insertThenUpdate_caseInsensitive()
    //            throws BadRequestServiceEx, NotFoundServiceEx {
    //        DummyUserGroupService svc = new DummyUserGroupService();
    //
    //        UserGroup g = new UserGroup();
    //        g.setGroupName("ORG");
    //        long id = svc.insert(g);
    //
    //        // insert
    //        svc.upsertAttribute(id, "SourceService", "A");
    //        UserGroup with1 = svc.getWithAttributes(id);
    //        assertEquals(1, with1.getAttributes().size());
    //        assertEquals("A", with1.getAttributes().get(0).getValue());
    //
    //        // update (case-insensitive name match)
    //        svc.upsertAttribute(id, "sourceservice", "B");
    //        UserGroup with2 = svc.getWithAttributes(id);
    //        assertEquals(1, with2.getAttributes().size());
    //        assertEquals("B", with2.getAttributes().get(0).getValue());
    //        assertEquals("sourceservice", with2.getAttributes().get(0).getName());
    //    }
    //
    //    /**
    //     * Cached bearer token authentication must reflect DB role changes immediately. When an
    // admin
    //     * demotes a user (or promotes), the next request with the same (non-expired) token must
    // see the
    //     * new role — not the stale cached one.
    //     */
    //    @Test
    //    public void testCachedBearerTokenReflectsDbRoleChange() throws Exception {
    //        MockedUserService mockedUserService = new MockedUserService();
    //        TokenAuthenticationCache tokenCache = new TokenAuthenticationCache(100, 60);
    //
    //        TestOAuth2Configuration config = new TestOAuth2Configuration();
    //        config.setRolesClaim(null); // no roles claim -> role comes from DB
    //        config.setBeanName("testBean");
    //        config.setAutoCreateUser(true);
    //
    //        GeoStoreOAuthRestTemplate rt = Mockito.mock(GeoStoreOAuthRestTemplate.class);
    //        OAuth2ClientContext ctx = Mockito.mock(OAuth2ClientContext.class);
    //        Mockito.when(ctx.getAccessToken()).thenReturn(new
    // DefaultOAuth2AccessToken("bearer-token"));
    //        Mockito.when(rt.getOAuth2ClientContext()).thenReturn(ctx);
    //
    //        // Pre-create user as ADMIN in the mock service
    //        User dbUser = new User();
    //        dbUser.setName("testuser");
    //        dbUser.setRole(Role.ADMIN);
    //        dbUser.setEnabled(true);
    //        dbUser.setAttribute(Collections.emptyList());
    //        dbUser.setGroups(new HashSet<>());
    //        mockedUserService.insert(dbUser);
    //
    //        OAuth2GeoStoreAuthenticationFilter oauth2Filter =
    //                new OAuth2GeoStoreAuthenticationFilter(null, rt, config, tokenCache) {
    //
    //                    @Override
    //                    protected User retrieveUserWithAuthorities(
    //                            String username,
    //                            HttpServletRequest request,
    //                            HttpServletResponse response) {
    //                        try {
    //                            return mockedUserService.get(username);
    //                        } catch (Exception e) {
    //                            return null;
    //                        }
    //                    }
    //
    //                    @Override
    //                    protected void configureRestTemplate() {
    //                        /* no-op */
    //                    }
    //                };
    //        oauth2Filter.setUserService(mockedUserService);
    //
    //        // Simulate first authentication: user is ADMIN, put into cache
    //        User cachedUser = new User();
    //        cachedUser.setId(dbUser.getId());
    //        cachedUser.setName("testuser");
    //        cachedUser.setRole(Role.ADMIN);
    //        cachedUser.setEnabled(true);
    //        cachedUser.setTrusted(true);
    //
    //        SimpleGrantedAuthority adminAuthority = new SimpleGrantedAuthority("ROLE_ADMIN");
    //        PreAuthenticatedAuthenticationToken cachedAuth =
    //                new PreAuthenticatedAuthenticationToken(
    //                        cachedUser, null, Collections.singletonList(adminAuthority));
    //        // Need TokenDetails with a non-expired token for the cache hit path
    //        DefaultOAuth2AccessToken accessToken = new DefaultOAuth2AccessToken("bearer-token");
    //        accessToken.setExpiration(new Date(System.currentTimeMillis() + 3600_000));
    //        cachedAuth.setDetails(
    //                new it.geosolutions.geostore.services.rest.security.oauth2.TokenDetails(
    //                        accessToken, null, "testBean"));
    //        tokenCache.putCacheEntry("bearer-token", cachedAuth);
    //
    //        // Verify cache has ADMIN
    //        Authentication fromCache = tokenCache.get("bearer-token");
    //        assertNotNull(fromCache);
    //        assertEquals(Role.ADMIN, ((User) fromCache.getPrincipal()).getRole());
    //
    //        // Now demote user to USER in DB
    //        dbUser.setRole(Role.USER);
    //        mockedUserService.update(dbUser);
    //
    //        // Next request with same bearer token should see USER role
    //        MockHttpServletRequest req2 = new MockHttpServletRequest();
    //        req2.addHeader("Authorization", "Bearer bearer-token");
    //        ServletRequestAttributes attrs = new ServletRequestAttributes(req2);
    //        RequestContextHolder.setRequestAttributes(attrs);
    //
    //        Authentication result =
    //                oauth2Filter.attemptAuthentication(req2, new MockHttpServletResponse());
    //        assertNotNull("Authentication should succeed from cache", result);
    //        User resultUser = (User) result.getPrincipal();
    //        assertEquals(
    //                "Role should be demoted to USER after DB change", Role.USER,
    // resultUser.getRole());
    //        assertTrue(
    //                "Granted authority should be ROLE_USER",
    //                result.getAuthorities().stream()
    //                        .anyMatch(a -> "ROLE_USER".equals(a.getAuthority())));
    //
    //        // Cache should also be updated
    //        Authentication updatedCache = tokenCache.get("bearer-token");
    //        assertNotNull(updatedCache);
    //        assertEquals(
    //                "Cache should reflect the demoted role",
    //                Role.USER,
    //                ((User) updatedCache.getPrincipal()).getRole());
    //    }
    //
    //    /** Cached bearer token with no role change should return the same authentication. */
    //    @Test
    //    public void testCachedBearerTokenNoRoleChange() throws Exception {
    //        MockedUserService mockedUserService = new MockedUserService();
    //        TokenAuthenticationCache tokenCache = new TokenAuthenticationCache(100, 60);
    //
    //        TestOAuth2Configuration config = new TestOAuth2Configuration();
    //        config.setBeanName("testBean");
    //        config.setAutoCreateUser(true);
    //
    //        GeoStoreOAuthRestTemplate rt = Mockito.mock(GeoStoreOAuthRestTemplate.class);
    //        OAuth2ClientContext ctx = Mockito.mock(OAuth2ClientContext.class);
    //        Mockito.when(ctx.getAccessToken()).thenReturn(new
    // DefaultOAuth2AccessToken("bearer-token"));
    //        Mockito.when(rt.getOAuth2ClientContext()).thenReturn(ctx);
    //
    //        // Pre-create user as USER
    //        User dbUser = new User();
    //        dbUser.setName("stableuser");
    //        dbUser.setRole(Role.USER);
    //        dbUser.setEnabled(true);
    //        dbUser.setAttribute(Collections.emptyList());
    //        dbUser.setGroups(new HashSet<>());
    //        mockedUserService.insert(dbUser);
    //
    //        OAuth2GeoStoreAuthenticationFilter oauth2Filter =
    //                new OAuth2GeoStoreAuthenticationFilter(null, rt, config, tokenCache) {
    //
    //                    @Override
    //                    protected User retrieveUserWithAuthorities(
    //                            String username,
    //                            HttpServletRequest request,
    //                            HttpServletResponse response) {
    //                        try {
    //                            return mockedUserService.get(username);
    //                        } catch (Exception e) {
    //                            return null;
    //                        }
    //                    }
    //
    //                    @Override
    //                    protected void configureRestTemplate() {
    //                        /* no-op */
    //                    }
    //                };
    //        oauth2Filter.setUserService(mockedUserService);
    //
    //        // Put USER into cache
    //        User cachedUser = new User();
    //        cachedUser.setId(dbUser.getId());
    //        cachedUser.setName("stableuser");
    //        cachedUser.setRole(Role.USER);
    //        cachedUser.setEnabled(true);
    //        cachedUser.setTrusted(true);
    //
    //        SimpleGrantedAuthority userAuthority = new SimpleGrantedAuthority("ROLE_USER");
    //        PreAuthenticatedAuthenticationToken cachedAuth =
    //                new PreAuthenticatedAuthenticationToken(
    //                        cachedUser, null, Collections.singletonList(userAuthority));
    //        DefaultOAuth2AccessToken accessToken = new DefaultOAuth2AccessToken("bearer-token");
    //        accessToken.setExpiration(new Date(System.currentTimeMillis() + 3600_000));
    //        cachedAuth.setDetails(
    //                new it.geosolutions.geostore.services.rest.security.oauth2.TokenDetails(
    //                        accessToken, null, "testBean"));
    //        tokenCache.putCacheEntry("bearer-token", cachedAuth);
    //
    //        // Request with same token, no DB change
    //        MockHttpServletRequest req = new MockHttpServletRequest();
    //        req.addHeader("Authorization", "Bearer bearer-token");
    //        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(req));
    //
    //        Authentication result =
    //                oauth2Filter.attemptAuthentication(req, new MockHttpServletResponse());
    //        assertNotNull(result);
    //        assertEquals(Role.USER, ((User) result.getPrincipal()).getRole());
    //        // Should be the same object (no rebuild needed)
    //        assertSame("Should return same auth when role unchanged", cachedAuth, result);
    //    }
    //
    //    // ---------------------------------------------------------------------
    //    // Helpers
    //    // ---------------------------------------------------------------------
    //
    private static void checkUser(User user) {
        assertNotNull("User should not be null", user);
        assertEquals("User role should be USER", Role.USER, user.getRole());
        assertTrue("User groups should be empty", user.getGroups().isEmpty());
    }

    //
    //    private static UserGroupAttribute attr(String n, String v) {
    //        UserGroupAttribute a = new UserGroupAttribute();
    //        a.setName(n);
    //        a.setValue(v);
    //        return a;
    //    }
    //
    //    /**
    //     * Minimal config that treats beanName as provider (so tests don't need to call
    // setProvider).
    //     */
    //    private static class TestOAuth2Configuration extends OAuth2Configuration {
    //        @Override
    //        public String getProvider() {
    //            return getBeanName();
    //        }
    //    }
    //
    //    private static String unsignedJwtJson(String payloadJson) {
    //        String header = "{\"alg\":\"none\"}";
    //        String encHeader = base64Url(header);
    //        String encPayload = base64Url(payloadJson);
    //        return encHeader + "." + encPayload + ".";
    //    }
    //
    //    private static String base64Url(String s) {
    //        byte[] enc = Base64.encodeBase64URLSafe(s.getBytes(StandardCharsets.UTF_8));
    //        return new String(enc, StandardCharsets.UTF_8);
    //    }
    //
    //    private static void setIdToken(String payloadJson) {
    //        String jwt = unsignedJwtJson(payloadJson);
    //        MockHttpServletRequest req = new MockHttpServletRequest();
    //        ServletRequestAttributes attrs = new ServletRequestAttributes(req);
    //        attrs.setAttribute(GeoStoreOAuthRestTemplate.ID_TOKEN_VALUE, jwt, 0);
    //        RequestContextHolder.setRequestAttributes(attrs);
    //    }
    //
    //    /** A group whose getAttributes() throws, to detect accidental lazy access. */
    //    private static class ThrowOnAttributesGroup extends UserGroup {
    //        @Override
    //        public List<UserGroupAttribute> getAttributes() {
    //            throw new AssertionError("Unexpected lazy attribute access");
    //        }
    //    }

    /**
     * Dummy implementation of UserGroupService for testing purposes. Stores attributes in a
     * separate index so we can simulate "plain get() returns no attributes" while getWithAttributes
     * returns an eager copy.
     */
    private static class DummyUserGroupService implements UserGroupService {
        private final Map<String, UserGroup> groupsByName = new HashMap<>();
        private final Map<Long, UserGroup> groupsById = new HashMap<>();
        private final Map<Long, List<UserGroupAttribute>> attrsByGroupId = new HashMap<>();
        private long nextId = 1;

        @Override
        public UserGroup get(String groupName) {
            return groupsByName.get(groupName);
        }

        @Override
        public long getCount(String nameLike, boolean all) {
            return groupsByName.size();
        }

        @Override
        public long getCount(User authUser, String nameLike, boolean all) {
            return groupsByName.size();
        }

        @Override
        public void updateAttributes(long id, List<UserGroupAttribute> attributes)
                throws NotFoundServiceEx {
            UserGroup g = groupsById.get(id);
            if (g == null) throw new NotFoundServiceEx("group not found");
            attrsByGroupId.put(id, deepCopy(attributes));
            groupsByName.put(g.getGroupName(), g);
        }

        @Override
        public long update(UserGroup group) {
            if (group.getId() == null) {
                group.setId(nextId++);
            }
            // if attributes present, index them and clear on the stored entity to simulate "lazy"
            if (group.getAttributes() != null) {
                attrsByGroupId.put(group.getId(), deepCopy(group.getAttributes()));
                group.setAttributes(null);
            }
            groupsById.put(group.getId(), group);
            groupsByName.put(group.getGroupName(), group);
            return group.getId();
        }

        @Override
        public Collection<UserGroup> findByAttribute(
                String name, List<String> values, boolean ignoreCase) {
            List<UserGroup> out = new ArrayList<>();
            for (Map.Entry<Long, List<UserGroupAttribute>> e : attrsByGroupId.entrySet()) {
                Long gid = e.getKey();
                List<UserGroupAttribute> list = e.getValue();
                if (list == null) continue;
                for (UserGroupAttribute a : list) {
                    boolean nameMatch =
                            ignoreCase
                                    ? a.getName() != null && a.getName().equalsIgnoreCase(name)
                                    : Objects.equals(a.getName(), name);
                    if (!nameMatch) continue;

                    boolean valMatch =
                            values == null
                                    || values.isEmpty()
                                    || values.stream()
                                            .anyMatch(
                                                    v ->
                                                            ignoreCase
                                                                    ? a.getValue() != null
                                                                            && a.getValue()
                                                                                    .equalsIgnoreCase(
                                                                                            v)
                                                                    : Objects.equals(
                                                                            a.getValue(), v));
                    if (valMatch) {
                        out.add(groupsById.get(gid));
                        break;
                    }
                }
            }
            return out;
        }

        @Override
        public UserGroup getWithAttributes(long id) throws NotFoundServiceEx, BadRequestServiceEx {
            UserGroup g = groupsById.get(id);
            if (g == null) throw new NotFoundServiceEx("UserGroup not found " + id);
            UserGroup copy = new UserGroup();
            copy.setId(g.getId());
            copy.setGroupName(g.getGroupName());
            copy.setDescription(g.getDescription());
            copy.setEnabled(g.isEnabled());
            copy.setUsers(g.getUsers()); // not used in these tests
            List<UserGroupAttribute> attrs = attrsByGroupId.get(id);
            copy.setAttributes(deepCopy(attrs));
            return copy;
        }

        @Override
        public void upsertAttribute(long groupId, String name, String value)
                throws NotFoundServiceEx, BadRequestServiceEx {
            UserGroup g = groupsById.get(groupId);
            if (g == null) throw new NotFoundServiceEx("UserGroup not found " + groupId);
            List<UserGroupAttribute> list =
                    attrsByGroupId.computeIfAbsent(groupId, k -> new ArrayList<>());
            // case-insensitive match (typical DB behavior with ILIKE)
            UserGroupAttribute existing =
                    list.stream()
                            .filter(a -> a.getName() != null && a.getName().equalsIgnoreCase(name))
                            .findFirst()
                            .orElse(null);
            if (existing != null) {
                existing.setName(
                        name); // match implementation in prod that might persist last-cased name
                existing.setValue(value);
            } else {
                UserGroupAttribute a = new UserGroupAttribute();
                a.setName(name);
                a.setValue(value);
                list.add(a);
            }
        }

        @Override
        public UserGroup get(long id) {
            // Simulate "plain get" that doesn't initialize attributes
            UserGroup g = groupsById.get(id);
            if (g == null) return null;
            UserGroup copy = new UserGroup();
            copy.setId(g.getId());
            copy.setGroupName(g.getGroupName());
            copy.setDescription(g.getDescription());
            copy.setEnabled(g.isEnabled());
            // do NOT set attributes -> simulates lazy/non-fetched
            return copy;
        }

        @Override
        public List<ShortResource> updateSecurityRules(
                Long groupId, List<Long> resourcesToSet, boolean canRead, boolean canWrite) {
            return List.of();
        }

        @Override
        public boolean insertSpecialUsersGroups() {
            return false;
        }

        @Override
        public boolean removeSpecialUsersGroups() {
            return false;
        }

        @Override
        public long insert(UserGroup group) {
            if (group.getId() == null) group.setId(nextId++);
            // index attributes separately and clear from entity (simulate lazy)
            if (group.getAttributes() != null) {
                attrsByGroupId.put(group.getId(), deepCopy(group.getAttributes()));
                group.setAttributes(null);
            }
            groupsById.put(group.getId(), group);
            groupsByName.put(group.getGroupName(), group);
            return group.getId();
        }

        @Override
        public boolean delete(long id) {
            attrsByGroupId.remove(id);
            UserGroup g = groupsById.remove(id);
            if (g != null) groupsByName.remove(g.getGroupName());
            return g != null;
        }

        @Override
        public void assignUserGroup(long userId, long groupId) throws NotFoundServiceEx {
            UserGroup g = groupsById.get(groupId);
            if (g == null) throw new NotFoundServiceEx("group not found");
            if (g.getUsers() == null) g.setUsers(new ArrayList<>());
            User u =
                    g.getUsers().stream().filter(x -> x.getId() == userId).findFirst().orElse(null);
            if (u == null) {
                u = new User();
                u.setId(userId);
                u.setGroups(new HashSet<>());
                u.setEnabled(true);
                u.setName("u" + userId);
                g.getUsers().add(u);
            }
            if (u.getGroups() == null) u.setGroups(new HashSet<>());
            u.getGroups().add(g);
        }

        @Override
        public void deassignUserGroup(long userId, long groupId) throws NotFoundServiceEx {
            UserGroup g = groupsById.get(groupId);
            if (g == null) throw new NotFoundServiceEx("group not found");
            if (g.getUsers() != null) {
                g.getUsers()
                        .removeIf(
                                u -> {
                                    if (u.getId() == userId) {
                                        if (u.getGroups() != null) u.getGroups().remove(g);
                                        return true;
                                    }
                                    return false;
                                });
            }
        }

        @Override
        public List<UserGroup> getAllAllowed(
                User user, Integer page, Integer entries, String nameLike, boolean all) {
            return new ArrayList<>(groupsByName.values());
        }

        @Override
        public List<UserGroup> getAll(Integer page, Integer entries) {
            return new ArrayList<>(groupsByName.values());
        }

        @Override
        public List<UserGroup> getAll(Integer page, Integer entries, String nameLike, boolean all) {
            return new ArrayList<>(groupsByName.values());
        }

        private static List<UserGroupAttribute> deepCopy(List<UserGroupAttribute> src) {
            if (src == null) return null;
            List<UserGroupAttribute> out = new ArrayList<>(src.size());
            for (UserGroupAttribute a : src) {
                UserGroupAttribute c = new UserGroupAttribute();
                c.setName(a.getName());
                c.setValue(a.getValue());
                out.add(c);
            }
            return out;
        }
    }
}
