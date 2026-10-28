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
package it.geosolutions.geostore.services.dto.search;

import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.services.dto.UserSession;
import it.geosolutions.geostore.services.dto.UserSessionImpl;

import jakarta.xml.bind.JAXBException;

import junit.framework.TestCase;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.Test;

import java.util.GregorianCalendar;

/**
 * Class SearchFilterTest.
 *
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 * @author ETj (etj at geo-solutions.it)
 */
public class UserSessionTest extends TestCase {

    protected final Logger LOGGER = LogManager.getLogger(this.getClass());

    public UserSessionTest() {}

    @Test
    public void testUserSession() throws JAXBException {
        User u = new User();
        u.setId((long) 1);
        u.setName("test");
        UserSession session = new UserSessionImpl(u, new GregorianCalendar(3000, 1, 1));
        assertEquals(u, session.getUser());
        assertFalse(session.isExpired());
        User u2 = new User();
        u.setId((long) 2);
        u.setName("test2");
        session.setUser(u2);
        assertEquals(u2, session.getUser());
        session.refresh();
        session = new UserSessionImpl(u, new GregorianCalendar(1900, 1, 1));
        assertTrue(session.isExpired());
        session.setExpirationInterval(100);
        assertEquals(session.getExpirationInterval(), 100);
        session.refresh();
        assertFalse(session.isExpired());
    }
}
