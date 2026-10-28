/*
 *  Copyright (C) 2007 - 2012 GeoSolutions S.A.S.
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

package it.geosolutions.test;

import junit.framework.TestCase;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.context.support.ClassPathXmlApplicationContext;

/**
 * Base class for tests with a spring context loaded from the classpath.
 *
 * @author Nate Sammons
 */
public abstract class AbstractSpringContextTest extends TestCase {

    protected Logger logger = LogManager.getLogger(getClass());

    protected ClassPathXmlApplicationContext context = null;

    /** Get the filename to use for this context. */
    protected abstract String[] getContextFilenames();

    @Override
    protected void setUp() throws Exception {
        super.setUp();

        context = new ClassPathXmlApplicationContext(getContextFilenames());
        logger.info("Built test context: " + context);
    }

    @Override
    protected void tearDown() throws Exception {
        super.tearDown();

        logger.info("Closing test context");
        context.close();
        context = null;
    }
}
