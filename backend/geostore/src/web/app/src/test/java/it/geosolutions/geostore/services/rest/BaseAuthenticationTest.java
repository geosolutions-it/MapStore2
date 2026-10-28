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
package it.geosolutions.geostore.services.rest;

import it.geosolutions.geostore.services.UserService;

import jakarta.servlet.http.HttpServletRequest;

import junit.framework.TestCase;

import org.apache.commons.io.FileDeleteStrategy;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.cxf.common.util.Base64Utility;
import org.apache.cxf.io.CachedOutputStream;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.File;
import java.io.InputStream;

/**
 * Test for AuthenticationManagers.
 *
 * @author afabiani (alessio.fabiani at geo-solutions.it)
 */
public abstract class BaseAuthenticationTest extends TestCase {

    protected final Logger LOGGER = LogManager.getLogger(getClass());

    protected UserService userService;

    protected static ClassPathXmlApplicationContext context = null;

    @Override
    protected void setUp() throws Exception {
        super.setUp();

        File securityTempFolder =
                new File(System.getProperty("java.io.tmpdir"), "apacheds-spring-security");

        int i = 0;
        for (i = 0; i < 10; i++) {
            try {
                if (securityTempFolder.exists()
                        && securityTempFolder.isDirectory()
                        && securityTempFolder.canWrite()) {
                    FileDeleteStrategy.FORCE.delete(securityTempFolder);
                    FileUtils.forceDelete(securityTempFolder);
                }
            } catch (Exception e) {
                LOGGER.info(i * 10 + "... ");
                Thread.sleep(1000);
                continue;
            }
            break;
        }
        LOGGER.info(100);

        String[] paths = {"classpath*:applicationContext-test.xml"};
        context = new ClassPathXmlApplicationContext(paths);
        LOGGER.info("Built test context: " + context);
    }

    @Override
    protected void tearDown() throws Exception {
        super.tearDown();
    }

    protected void doAutoLogin(String username, String password, HttpServletRequest request) {
        try {
            // Must be called from request filtered by Spring Security, otherwise
            // SecurityContextHolder is not updated
            UsernamePasswordAuthenticationToken token =
                    new UsernamePasswordAuthenticationToken(username, password);
            // token.setDetails(new WebAuthenticationDetails(request));
            Authentication authentication =
                    ((AuthenticationProvider) context.getBean("geostoreLdapProvider"))
                            .authenticate(token);
            LOGGER.info("Logging in with [{" + authentication.getPrincipal() + "}]");
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (Exception e) {
            SecurityContextHolder.getContext().setAuthentication(null);
            LOGGER.error("Failure in autoLogin", e);
        }
    }

    protected String getStringFromInputStream(InputStream in) throws Exception {
        CachedOutputStream bos = new CachedOutputStream();
        IOUtils.copy(in, bos);
        in.close();
        bos.close();
        // System.out.println(bos.getOut().toString());
        return bos.getOut().toString();
    }

    protected String base64Encode(String value) {
        return Base64Utility.encode(value.getBytes());
    }
}
