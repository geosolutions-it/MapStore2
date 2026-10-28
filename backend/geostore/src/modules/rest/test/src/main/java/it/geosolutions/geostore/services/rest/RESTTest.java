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

import it.geosolutions.geostore.core.model.Category;
import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.enums.Role;
import it.geosolutions.geostore.services.CategoryService;
import it.geosolutions.geostore.services.UserService;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.InitializingBean;

/**
 * @author ETj (etj at geo-solutions.it)
 */
public class RESTTest implements InitializingBean {

    private static final Logger LOGGER = LogManager.getLogger(RESTTest.class);

    protected UserService userService;

    protected CategoryService categoryService;

    @Override
    public void afterPropertiesSet() throws Exception {

        LOGGER.info("===== Starting GeoStore REST test services =====");

        long catCnt = categoryService.getCount(null);
        if (catCnt == 0) {
            LOGGER.info("No category found. Creating default.");
            for (String name : new String[] {"TestCategory1", "TestCategory2"}) {
                Category c = new Category();
                c.setName(name);
                categoryService.insert(c);
                LOGGER.info("Created " + c);
            }
        } else {
            LOGGER.info("Categories already in db: " + catCnt);
        }

        long userCnt = userService.getCount(null);
        if (userCnt == 0) {
            LOGGER.info("No user found. Creating default.");

            User admin = new User();
            admin.setName("admin");
            admin.setNewPassword("admin");
            admin.setRole(Role.ADMIN);
            userService.insert(admin);
            LOGGER.info("Created " + admin);

            User pinco = new User();
            pinco.setName("pinco");
            pinco.setNewPassword("pinco");
            pinco.setRole(Role.USER);
            userService.insert(pinco);
            LOGGER.info("Created " + pinco);

        } else {
            LOGGER.info("Users already in db: " + userCnt);
        }
    }

    // ==========================================================================

    public void setCategoryService(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    public void setUserService(UserService userService) {
        this.userService = userService;
    }
}
