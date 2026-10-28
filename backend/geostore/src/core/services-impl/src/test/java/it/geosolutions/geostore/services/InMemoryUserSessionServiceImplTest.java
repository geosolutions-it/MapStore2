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
package it.geosolutions.geostore.services;

import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.services.dto.UserSession;
import it.geosolutions.geostore.services.dto.UserSessionImpl;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import java.util.GregorianCalendar;

/**
 * Class InMemoryUserSessionServiceImplTest.
 *
 * @author Lorenzo Natali (lorenzo.natali at geo-solutions.it)
 */
public class InMemoryUserSessionServiceImplTest extends ServiceTestBase {

    @BeforeClass
    public static void setUpClass() throws Exception {}

    @AfterClass
    public static void tearDownClass() throws Exception {}

    public InMemoryUserSessionServiceImplTest() {}

    @Test
    public void testInitialization() {
        InMemoryUserSessionServiceImpl service = new InMemoryUserSessionServiceImpl();
        service.setCleanUpSeconds(500);
        assertTrue(true);
    }

    @Test
    public void testSessionStorage() throws Exception {
        UserSessionService service = new InMemoryUserSessionServiceImpl();
        User u = new User();
        u.setId(1L);
        u.setName("TEST");
        UserSession session = new UserSessionImpl(u, new GregorianCalendar(3000, 1, 1));
        session = service.registerNewSession(session);
        User sessUser = service.getUserData(session.getId());
        assertEquals(sessUser, u);
        assertTrue(service.isOwner(session.getId(), u));
        UserSession session2 = new UserSessionImpl(u, new GregorianCalendar(3000, 1, 1));
        service.registerNewSession("ID_SESSION", session2);
        assertTrue(service.isOwner("ID_SESSION", u));
        service.refreshSession(session.getId(), service.getRefreshToken(session.getId()));
        service.removeSession("ID_SESSION");
        assertFalse(service.isOwner("ID_SESSION", u));
        service.removeAllSessions();
        assertFalse(service.isOwner(session.getId(), u));
    }

    @Test
    public void testSessionMissing() throws Exception {
        UserSessionService service = new InMemoryUserSessionServiceImpl();
        User u = new User();
        u.setId(1L);
        u.setName("TEST");
        UserSession session = new UserSessionImpl(u, new GregorianCalendar(3000, 1, 1));
        session = service.registerNewSession(session);
        User sessUser = service.getUserData(session.getId());
        assertEquals(sessUser, u);
        assertTrue(service.isOwner(session.getId(), u));
        assertNull(service.getRefreshToken("NOT_A SESSION"));
        assertNull(service.getUserData("NOT_A SESSION"));
    }
}
