/*
 *    GeoTools - The Open Source Java GIS Toolkit
 *    http://geotools.org
 *
 *    (C) 2002-2011, Open Source Geospatial Foundation (OSGeo)
 *
 *    This library is free software; you can redistribute it and/or
 *    modify it under the terms of the GNU Lesser General Public
 *    License as published by the Free Software Foundation;
 *    version 2.1 of the License.
 *
 *    This library is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 *    Lesser General Public License for more details.
 */
package it.geosolutions.geostore.services.rest;

import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.services.rest.impl.RESTCategoryServiceImpl;

import org.apache.cxf.jaxrs.client.JAXRSClientFactory;
import org.apache.cxf.jaxrs.client.WebClient;
import org.junit.Test;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.ldap.userdetails.LdapUserDetailsImpl;

import java.io.IOException;
import java.net.DatagramSocket;
import java.net.ServerSocket;

/**
 * @author Alessio
 */
public class SecurityTest extends BaseAuthenticationTest {

    private static final String ENDPOINT_ADDRESS = "http://localhost:9000/rest/categories";

    private static final String WADL_ADDRESS = ENDPOINT_ADDRESS + "?_wadl&_type=xml";

    private boolean serverStarted = false;

    @Override
    protected void setUp() throws Exception {

        if (!portIsBusy("localhost", 33389) && !portIsBusy("localhost", 9000)) {
            try {
                super.setUp();
                serverStarted = true;
            } catch (Exception e) {

            }
        }
    }

    /**
     * Checks if a network host / port is already occupied.
     *
     * @param host
     * @param port
     * @return
     */
    private static boolean portIsBusy(String host, int port) {
        ServerSocket ss = null;
        DatagramSocket ds = null;
        try {
            ss = new ServerSocket(port);
            ss.setReuseAddress(true);
            ds = new DatagramSocket(port);
            ds.setReuseAddress(true);
            return false;
        } catch (IOException e) {
        } finally {
            if (ds != null) {
                ds.close();
            }
            if (ss != null) {
                try {
                    ss.close();
                } catch (IOException e) {
                    /* should not be thrown */
                }
            }
        }
        return true;
    }

    @Override
    protected void tearDown() throws Exception {
        super.tearDown();
    }

    @Test
    public void testSuite() {
        if (serverStarted) {
            springAuthenticationTest();
            webClientAccessTest();
            proxyAccessTest();
        }
    }

    protected void springAuthenticationTest() {
        doAutoLogin("admin", "admin", null);

        assertNotNull(SecurityContextHolder.getContext());
        assertNotNull(SecurityContextHolder.getContext().getAuthentication());

        final Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();
        authentication.getName();

        assertEquals("admin", authentication.getCredentials());

        Object principal = authentication.getPrincipal();
        assertNotNull(principal);

        if (principal instanceof User) {
            User user = (User) principal;

            assertEquals("admin", user.getName());
        } else if (principal instanceof LdapUserDetailsImpl) {
            LdapUserDetailsImpl userDetails = (LdapUserDetailsImpl) principal;

            assertEquals("uid=admin,ou=people,dc=geosolutions,dc=it", userDetails.getDn());
        }

        assertEquals(authentication.getAuthorities().size(), 1);

        for (GrantedAuthority authority : authentication.getAuthorities()) {
            assertEquals("ROLE_ADMIN", authority.getAuthority());
        }
    }

    // protected void testHTTPClientAccess() {
    // final String user = "admin";
    // final String password = "admin";
    // int expectedStatus = 200;
    //
    // GetMethod get = new GetMethod(ENDPOINT_ADDRESS);
    // get.setRequestHeader("Accept", "application/xml");
    // get.setRequestHeader("Authorization", "Basic " + base64Encode(user + ":" + password));
    // HttpClient httpClient = new HttpClient();
    // try {
    // int result = httpClient.executeMethod(get);
    // assertEquals(expectedStatus, result);
    // if (expectedStatus == 200) {
    // String content = getStringFromInputStream(get.getResponseBodyAsStream());
    // String resource = "/org/apache/cxf/systest/jaxrs/resources/expected_get_book123.txt";
    // InputStream expected = getClass().getResourceAsStream(resource);
    // assertEquals("Expected value is wrong", getStringFromInputStream(expected), content);
    // }
    // } catch (HttpException e) {
    // LOGGER.error(e.getMessage(), e);
    // } catch (IOException e) {
    // LOGGER.error(e.getMessage(), e);
    // } catch (Exception e) {
    // LOGGER.error(e.getMessage(), e);
    // } finally {
    // get.releaseConnection();
    // }
    //
    // }

    protected void webClientAccessTest() {
        WebClient client = WebClient.create(ENDPOINT_ADDRESS, "admin", "admin", null);
        client.accept("application/json");
        client.path("category/1");

        assertNotNull(client);

        // RESTCategory category = client.get(RESTCategory.class);
        // System.out.println(category.getName());
    }

    protected void proxyAccessTest() {
        doAutoLogin("admin", "admin", null);
        RESTCategoryServiceImpl client =
                JAXRSClientFactory.create(ENDPOINT_ADDRESS, RESTCategoryServiceImpl.class);

        assertNotNull(client);

        // SecurityContext sc = null;
        // client.get(sc, 1L);
    }
}
