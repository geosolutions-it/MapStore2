/*
 *  Copyright (C) 2007 - 2014 GeoSolutions S.A.S.
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

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.fail;

import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.services.exception.NotFoundServiceEx;

import org.apache.cxf.interceptor.security.AccessDeniedException;
import org.junit.Ignore;
import org.junit.Test;

import java.util.HashMap;
import java.util.Map;

/**
 * Test for AutoUserCreateGeostoreAuthenticationInterceptor. Test different configurations for the
 * interceptor
 *
 * @author adiaz (alejandro.diaz at geo-solutions.it)
 */
public class AutoUserCreateGeostoreAuthenticationInterceptorTest
        extends BaseAuthenticationInterceptorTest {

    /** Access denied for a new user if the interceptor doesn't create new users */
    @Ignore
    @Test(expected = AccessDeniedException.class)
    public void testNotCreateUsers() {
        AutoUserCreateGeostoreAuthenticationInterceptor interceptor =
                new AutoUserCreateGeostoreAuthenticationInterceptor();
        interceptor.setAutoCreateUsers(false);
        interceptor.setUserService(userService);
        interceptor.handleMessage(getMockedMessage("test", "", null));
    }

    /** Create a user with a empty password */
    @Ignore
    @Test
    public void testCreateUsers() {
        AutoUserCreateGeostoreAuthenticationInterceptor interceptor =
                new AutoUserCreateGeostoreAuthenticationInterceptor();
        interceptor.setAutoCreateUsers(true);
        interceptor.setNewUsersPassword(NewPasswordStrategy.NONE);
        interceptor.setUserService(userService);
        interceptor.handleMessage(getMockedMessage("test", "", null));
        try {
            User user = userService.get("test");
            assertNotNull(user);
        } catch (NotFoundServiceEx e) {
            fail("Couldn't found user");
        }
    }

    /** Create a user with password as user name */
    @Ignore
    @Test
    public void testCreateUsersStrategyUserName() {
        AutoUserCreateGeostoreAuthenticationInterceptor interceptor =
                new AutoUserCreateGeostoreAuthenticationInterceptor();
        interceptor.setAutoCreateUsers(true);
        interceptor.setNewUsersPassword(NewPasswordStrategy.USERNAME);
        interceptor.setUserService(userService);
        interceptor.handleMessage(getMockedMessage("test2", "test2", null));
        try {
            User user = userService.get("test2");
            assertNotNull(user);
        } catch (NotFoundServiceEx e) {
            fail("Couldn't found user");
        }
    }

    /** Create a user with password from a header */
    @Ignore
    @Test
    public void testCreateUsersStrategyFromHeader() {
        AutoUserCreateGeostoreAuthenticationInterceptor interceptor =
                new AutoUserCreateGeostoreAuthenticationInterceptor();
        interceptor.setAutoCreateUsers(true);
        interceptor.setNewUsersPassword(NewPasswordStrategy.FROMHEADER);
        interceptor.setNewUsersPasswordHeader("newPassword");
        interceptor.setUserService(userService);
        Map<String, String> headers = new HashMap<String, String>();
        headers.put("newPassword", "test3pass");
        interceptor.handleMessage(getMockedMessage("test3", "test3pass", headers));
        try {
            User user = userService.get("test3");
            assertNotNull(user);
        } catch (NotFoundServiceEx e) {
            fail("Couldn't found user");
        }
    }
}
