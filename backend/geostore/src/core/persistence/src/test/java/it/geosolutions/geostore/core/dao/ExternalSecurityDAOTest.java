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
package it.geosolutions.geostore.core.dao;

import it.geosolutions.geostore.core.model.Category;
import it.geosolutions.geostore.core.model.IPRange;
import it.geosolutions.geostore.core.model.Resource;
import it.geosolutions.geostore.core.model.SecurityRule;
import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserGroup;
import it.geosolutions.geostore.core.model.enums.Role;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.Test;

import java.math.BigInteger;
import java.util.Date;
import java.util.List;
import java.util.Set;

/**
 * Class SecurityDAOTest.
 *
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 */
public class ExternalSecurityDAOTest extends BaseDAOTest {

    private static final Logger LOGGER = LogManager.getLogger(ExternalSecurityDAOTest.class);

    /**
     * @throws Exception
     */
    @Test
    public void testPersistSecurity() throws Exception {

        final String NAME = "NAME";

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("Persisting Security");
        }

        long categoryId;
        long resourceId;
        long securityId;

        //
        // PRE-PERSIST
        //
        {
            Category category = new Category();
            category.setName("MAP");

            categoryDAO.persist(category);
            categoryId = category.getId();

            assertEquals(1, categoryDAO.count(null));
            assertEquals(1, categoryDAO.findAll().size());

            Resource resource = new Resource();
            resource.setName(NAME);
            resource.setCreation(new Date());
            resource.setCategory(category);

            resourceDAO.persist(resource);
            resourceId = resource.getId();

            assertEquals(1, resourceDAO.count(null));
            assertEquals(1, resourceDAO.findAll().size());
        }

        //
        // PERSIST
        //
        {
            SecurityRule security = new SecurityRule();
            security.setCanRead(true);
            security.setCanWrite(true);
            security.setResource(resourceDAO.find(resourceId));

            externalSecurityDAO.persist(security);
            securityId = security.getId();

            assertEquals(1, externalSecurityDAO.count(null));
            assertEquals(1, externalSecurityDAO.findAll().size());
        }

        //
        // UPDATE
        //
        {
            SecurityRule loaded = externalSecurityDAO.find(securityId);
            assertNotNull("Can't retrieve Security", loaded);

            assertTrue(loaded.isCanWrite());

            loaded.setCanWrite(false);
            externalSecurityDAO.merge(loaded);

            loaded = externalSecurityDAO.find(securityId);
            assertNotNull("Can't retrieve Security", loaded);
            assertFalse(loaded.isCanWrite());
        }

        //
        // LOAD, REMOVE
        //
        {
            externalSecurityDAO.removeById(securityId);
            assertNull("Security not deleted", securityDAO.find(categoryId));
        }
    }

    @Test
    public void testPersistSecurityUsingNames() throws Exception {

        final String NAME = "NAME";
        final String USERNAME = "USER";
        final String GROUPNAME = "GROUP";

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("Persisting Security");
        }

        long categoryId;
        long resourceId;
        long securityId;
        long userId;
        long groupId;

        //
        // PRE-PERSIST
        //
        {
            Category category = new Category();
            category.setName("MAP");

            categoryDAO.persist(category);
            categoryId = category.getId();

            assertEquals(1, categoryDAO.count(null));
            assertEquals(1, categoryDAO.findAll().size());

            User user = new User();
            user.setName(USERNAME);
            user.setRole(Role.USER);
            userDAO.persist(user);
            userId = user.getId();
            assertEquals(1, userDAO.count(null));
            assertEquals(1, userDAO.findAll().size());

            UserGroup group = new UserGroup();
            group.setGroupName(GROUPNAME);
            userGroupDAO.persist(group);
            groupId = group.getId();
            assertEquals(1, userGroupDAO.count(null));
            assertEquals(1, userGroupDAO.findAll().size());

            Resource resource = new Resource();
            resource.setName(NAME);
            resource.setCreation(new Date());
            resource.setCategory(category);

            resourceDAO.persist(resource);
            resourceId = resource.getId();

            assertEquals(1, resourceDAO.count(null));
            assertEquals(1, resourceDAO.findAll().size());
        }

        //
        // PERSIST WITH USERNAME
        //
        {
            SecurityRule security = new SecurityRule();
            security.setCanRead(true);
            security.setCanWrite(true);
            security.setResource(resourceDAO.find(resourceId));
            security.setUsername("testuser");
            externalSecurityDAO.persist(security);
            securityId = security.getId();

            assertEquals(1, externalSecurityDAO.count(null));
            assertEquals(1, externalSecurityDAO.findAll().size());
            SecurityRule rule = externalSecurityDAO.find(securityId);
            assertNotNull(rule);
            assertNotNull(rule.getUsername());
            externalSecurityDAO.removeById(securityId);
        }

        //
        // PERSIST WITH USER
        //
        {
            SecurityRule security = new SecurityRule();
            security.setCanRead(true);
            security.setCanWrite(true);
            security.setResource(resourceDAO.find(resourceId));
            User testUser = new User();
            testUser.setId(userId);
            testUser.setName(USERNAME);
            security.setUser(testUser);
            externalSecurityDAO.persist(security);
            securityId = security.getId();

            assertEquals(1, externalSecurityDAO.count(null));
            assertEquals(1, externalSecurityDAO.findAll().size());
            SecurityRule rule = externalSecurityDAO.find(securityId);
            assertNotNull(rule);
            assertNotNull(rule.getUsername());
            externalSecurityDAO.removeById(securityId);
        }

        //
        // PERSIST WITH GROUPNAME
        //
        {
            SecurityRule security = new SecurityRule();
            security.setCanRead(true);
            security.setCanWrite(true);
            security.setResource(resourceDAO.find(resourceId));
            security.setGroupname("testgroup");
            externalSecurityDAO.persist(security);
            securityId = security.getId();

            assertEquals(1, externalSecurityDAO.count(null));
            assertEquals(1, externalSecurityDAO.findAll().size());
            SecurityRule rule = externalSecurityDAO.find(securityId);
            assertNotNull(rule);
            assertNotNull(rule.getGroupname());
            externalSecurityDAO.removeById(securityId);
        }

        //
        // PERSIST WITH GROUP
        //
        {
            SecurityRule security = new SecurityRule();
            security.setCanRead(true);
            security.setCanWrite(true);
            security.setResource(resourceDAO.find(resourceId));
            UserGroup testGroup = new UserGroup();
            testGroup.setId(groupId);
            testGroup.setGroupName(GROUPNAME);
            security.setGroup(testGroup);
            externalSecurityDAO.persist(security);
            securityId = security.getId();

            assertEquals(1, externalSecurityDAO.count(null));
            assertEquals(1, externalSecurityDAO.findAll().size());
            SecurityRule rule = externalSecurityDAO.find(securityId);
            assertNotNull(rule);
            assertNotNull(rule.getGroupname());
        }

        //
        // UPDATE
        //
        {
            SecurityRule loaded = externalSecurityDAO.find(securityId);
            assertNotNull("Can't retrieve Security", loaded);

            assertTrue(loaded.isCanWrite());

            loaded.setCanWrite(false);
            externalSecurityDAO.merge(loaded);

            loaded = externalSecurityDAO.find(securityId);
            assertNotNull("Can't retrieve Security", loaded);
            assertFalse(loaded.isCanWrite());
        }

        //
        // LOAD, REMOVE
        //
        {
            externalSecurityDAO.removeById(securityId);
            assertNull("Security not deleted", externalSecurityDAO.find(categoryId));
        }
    }

    @Test
    public void testPersistSecurityWithIpRanges() throws Exception {

        long resourceId;
        long securityId;

        Category category = new Category();
        category.setName("MAP");

        categoryDAO.persist(category);

        assertEquals(1, categoryDAO.count(null));
        assertEquals(1, categoryDAO.findAll().size());

        Resource resource = new Resource();
        resource.setName("NAME");
        resource.setCreation(new Date());
        resource.setCategory(category);

        resourceDAO.persist(resource);
        resourceId = resource.getId();

        assertEquals(1, resourceDAO.count(null));
        assertEquals(1, resourceDAO.findAll().size());

        IPRange cidrIPRange = new IPRange();
        cidrIPRange.setCidr("0.0.0.0/0");
        cidrIPRange.setDescription("cidr");

        IPRange rangedIPRange = new IPRange();
        rangedIPRange.setCidr("0.0.0.1/32");
        rangedIPRange.setIpLow(BigInteger.ONE);
        rangedIPRange.setIpHigh(BigInteger.TEN);
        rangedIPRange.setDescription("ranged");

        ipRangeDAO.persist(cidrIPRange, rangedIPRange);

        //
        // PERSIST
        //
        {
            SecurityRule security = new SecurityRule();
            security.setCanRead(true);
            security.setCanWrite(true);
            security.setIpRanges(Set.of(cidrIPRange));
            security.setResource(resourceDAO.find(resourceId));

            externalSecurityDAO.persist(security);
            securityId = security.getId();

            List<SecurityRule> securityRules =
                    externalSecurityDAO.findResourceSecurityRules(resourceId);

            assertEquals(1, securityRules.size());

            Set<IPRange> ipRanges = securityRules.get(0).getIpRanges();

            IPRange ipRange = ipRanges.stream().findFirst().orElseThrow();
            assertEquals(cidrIPRange, ipRange);
        }

        //
        // UPDATE
        //
        {
            SecurityRule existingRule = externalSecurityDAO.find(securityId);

            existingRule.setIpRanges(Set.of(cidrIPRange, rangedIPRange));
            externalSecurityDAO.merge(existingRule);

            List<SecurityRule> securityRules =
                    externalSecurityDAO.findResourceSecurityRules(resourceId);

            assertEquals(1, securityRules.size());

            Set<IPRange> ipRanges = securityRules.get(0).getIpRanges();

            assertTrue(Set.of(rangedIPRange, cidrIPRange).containsAll(ipRanges));
        }

        //
        // CLEAR
        //
        {
            SecurityRule existingRule = externalSecurityDAO.find(securityId);
            existingRule.setIpRanges(Set.of());

            externalSecurityDAO.merge(existingRule);

            List<SecurityRule> securityRules =
                    externalSecurityDAO.findResourceSecurityRules(resourceId);

            assertEquals(1, securityRules.size());

            Set<IPRange> ipRanges = securityRules.get(0).getIpRanges();

            assertTrue(ipRanges.isEmpty());
        }
    }
}
