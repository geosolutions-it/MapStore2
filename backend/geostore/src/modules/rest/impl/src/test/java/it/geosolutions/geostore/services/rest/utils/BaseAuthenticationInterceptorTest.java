/*
 *  Copyright (C) 2007 - 2011 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.services.rest.utils;

import it.geosolutions.geostore.services.UserService;

import org.apache.cxf.configuration.security.AuthorizationPolicy;
import org.apache.cxf.message.Message;
import org.apache.cxf.message.MessageImpl;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.Before;
import org.junit.Ignore;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

/**
 * Test for AuthenticationInterceptors. It use a mocked user service and a mocked message
 *
 * @author adiaz (alejandro.diaz at geo-solutions.it)
 */
public abstract class BaseAuthenticationInterceptorTest {

    protected final Logger LOGGER = LogManager.getLogger(getClass());

    protected UserService userService;

    @Ignore
    @Before
    public void init() {
        userService = new MockedUserService();
    }

    /**
     * Mock a message to be handled by the interceptor
     *
     * @param username for the authorization policy
     * @param password for the authorization policy
     * @param headers for the request
     * @return Message to be handled
     */
    protected Message getMockedMessage(
            String username, String password, Map<String, String> headers) {
        MessageImpl messageImpl = new MessageImpl();
        AuthorizationPolicy policy = new AuthorizationPolicy();
        policy.setUserName(username);
        policy.setPassword(password);
        if (headers != null) {
            Map<String, List<String>> mockedHeaders = new HashMap<String, List<String>>();
            for (String key : headers.keySet()) {
                List<String> value = new LinkedList<String>();
                value.add(headers.get(key));
                mockedHeaders.put(key, value);
            }
            messageImpl.put(Message.PROTOCOL_HEADERS, mockedHeaders);
        }
        messageImpl.put(AuthorizationPolicy.class, policy);
        return messageImpl;
    }
}
