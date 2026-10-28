/*
 *  Copyright (C) 2025 GeoSolutions S.A.S.
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

import static org.junit.Assert.assertThrows;

import it.geosolutions.geostore.core.model.IPRange;
import it.geosolutions.geostore.core.model.SecurityRule;
import it.geosolutions.geostore.services.exception.BadRequestServiceEx;
import it.geosolutions.geostore.services.exception.NotFoundServiceEx;

import java.math.BigInteger;
import java.util.List;
import java.util.Set;

public class IPRangeServiceImplTest extends ServiceTestBase {

    public void testInsert() throws Exception {

        BigInteger expectedIPRangeAIPLow = BigInteger.valueOf(2130706432);
        BigInteger expectedIPRangeAIPHigh = BigInteger.valueOf(2130706687);
        BigInteger expectedIPRangeBIPLow = BigInteger.valueOf(16777216);
        BigInteger expectedIPRangeBIPHigh = BigInteger.valueOf(33554431);

        IPRange ipRangeA = new IPRange();
        ipRangeA.setCidr("127.0.0.0/24");
        ipRangeA.setDescription("ip-range-A");

        IPRange ipRangeB = new IPRange();
        ipRangeB.setCidr("1.0.0.1/8");
        ipRangeB.setDescription("ip-range-B");

        ipRangeService.insert(ipRangeA);
        ipRangeService.insert(ipRangeB);

        List<IPRange> foundIPRanges = ipRangeDAO.findAll();
        assertEquals(2, foundIPRanges.size());

        IPRange insertedIPRangeA =
                foundIPRanges.stream()
                        .filter(f -> f.getId().equals(ipRangeA.getId()))
                        .findFirst()
                        .orElseThrow();
        assertEquals(ipRangeA.getCidr(), insertedIPRangeA.getCidr());
        assertEquals(ipRangeA.getDescription(), insertedIPRangeA.getDescription());
        assertEquals(expectedIPRangeAIPLow, insertedIPRangeA.getIpLow());
        assertEquals(expectedIPRangeAIPHigh, insertedIPRangeA.getIpHigh());

        IPRange insertedIPRangeB =
                foundIPRanges.stream()
                        .filter(f -> f.getId().equals(ipRangeB.getId()))
                        .findFirst()
                        .orElseThrow();
        assertEquals(ipRangeB.getCidr(), insertedIPRangeB.getCidr());
        assertEquals(ipRangeB.getDescription(), insertedIPRangeB.getDescription());
        assertEquals(expectedIPRangeBIPLow, insertedIPRangeB.getIpLow());
        assertEquals(expectedIPRangeBIPHigh, insertedIPRangeB.getIpHigh());
    }

    public void testInsertWithoutCidr() {

        IPRange ipRange = new IPRange();

        IPRange duplicateIPRange = new IPRange();
        duplicateIPRange.setCidr(ipRange.getCidr());

        BadRequestServiceEx ex =
                assertThrows(
                        BadRequestServiceEx.class, () -> ipRangeService.insert(duplicateIPRange));
        assertTrue(ex.getMessage().contains("CIDR must be specified"));
    }

    public void testInsertWithMalformedCidrFormat() throws Exception {

        IPRange ipRange = new IPRange();
        ipRange.setCidr("1.1.1.1");

        BadRequestServiceEx ex =
                assertThrows(BadRequestServiceEx.class, () -> ipRangeService.insert(ipRange));
        assertTrue(ex.getMessage().startsWith("Invalid"));
    }

    public void testInsertWithInvalidCidr() throws Exception {

        IPRange ipRange = new IPRange();
        ipRange.setCidr("666.555.444.333/222");

        BadRequestServiceEx ex =
                assertThrows(BadRequestServiceEx.class, () -> ipRangeService.insert(ipRange));
        assertTrue(ex.getMessage().startsWith("Invalid"));
    }

    public void testInsertWithCidrMissingPrefix() throws Exception {

        IPRange ipRange = new IPRange();
        ipRange.setCidr("192.165.1.5/");

        BadRequestServiceEx ex =
                assertThrows(BadRequestServiceEx.class, () -> ipRangeService.insert(ipRange));
        assertTrue(ex.getMessage().startsWith("Invalid"));
    }

    public void testInsertWithInvalidCidrPrefix() throws Exception {

        IPRange ipRange = new IPRange();
        ipRange.setCidr("1.1.1.1/555");

        BadRequestServiceEx ex =
                assertThrows(BadRequestServiceEx.class, () -> ipRangeService.insert(ipRange));
        assertTrue(ex.getMessage().startsWith("Invalid"));
    }

    public void testInsertSanitizingCidr() throws Exception {

        IPRange ipRange = new IPRange();
        ipRange.setCidr("008.08.8.080/024");
        ipRange.setDescription("sanitize");

        ipRangeService.insert(ipRange);

        IPRange foundIPRange = ipRangeDAO.find(ipRange.getId());
        assertNotNull(foundIPRange);
        assertEquals("8.8.8.80/24", foundIPRange.getCidr());
    }

    public void testInsertNull() {
        assertThrows(BadRequestServiceEx.class, () -> ipRangeService.insert(null));
    }

    public void testGetAll() throws Exception {

        IPRange ipRangeA = new IPRange();
        ipRangeA.setCidr("127.0.0.0/24");

        IPRange ipRangeB = new IPRange();
        ipRangeB.setCidr("1.0.0.1/8");

        ipRangeDAO.persist(ipRangeA, ipRangeB);

        List<IPRange> foundIPRanges = ipRangeService.getAll();
        assertEquals(List.of(ipRangeA, ipRangeB), foundIPRanges);
    }

    public void testGet() {

        IPRange ipRangeA = new IPRange();
        ipRangeA.setCidr("127.0.0.0/24");

        IPRange ipRangeB = new IPRange();
        ipRangeB.setCidr("1.0.0.1/8");

        ipRangeDAO.persist(ipRangeA, ipRangeB);

        IPRange foundIPRange = ipRangeService.get(ipRangeA.getId());
        assertEquals(ipRangeA, foundIPRange);
    }

    public void testUpdate() throws Exception {

        String expectedCidr = "127.1.2.3/8";
        String expectedDescription = "onetwothree";
        BigInteger expectedIPLow = BigInteger.valueOf(2130706432);
        BigInteger expectedIPHigh = BigInteger.valueOf(2147483647);

        IPRange actualIPRange = new IPRange();
        actualIPRange.setCidr("5.5.5.0/32");
        actualIPRange.setDescription("fivefivefive");
        actualIPRange.setIpLow(BigInteger.ZERO);
        actualIPRange.setIpHigh(BigInteger.TEN);

        ipRangeDAO.persist(actualIPRange);

        IPRange ipRangeUpdate = new IPRange();
        ipRangeUpdate.setCidr(expectedCidr);
        ipRangeUpdate.setDescription(expectedDescription);

        ipRangeService.update(actualIPRange.getId(), ipRangeUpdate);

        IPRange updatedIPRange = ipRangeDAO.find(ipRangeUpdate.getId());
        assertEquals(expectedCidr, updatedIPRange.getCidr());
        assertEquals(expectedDescription, updatedIPRange.getDescription());
        assertEquals(expectedIPLow, updatedIPRange.getIpLow());
        assertEquals(expectedIPHigh, updatedIPRange.getIpHigh());
    }

    public void testPartialUpdate() throws Exception {

        String expectedCidr = "127.0.0.0/24";
        String expectedDescription = "clear";
        BigInteger expectedIPLow = BigInteger.valueOf(2130706432);
        BigInteger expectedIPHigh = BigInteger.valueOf(2130706687);

        IPRange actualIPRange = new IPRange();
        actualIPRange.setCidr(expectedCidr);
        actualIPRange.setIpLow(expectedIPLow);
        actualIPRange.setIpHigh(expectedIPHigh);

        ipRangeDAO.persist(actualIPRange);

        IPRange ipRangeUpdate = new IPRange();
        ipRangeUpdate.setCidr(expectedCidr);
        ipRangeUpdate.setDescription(expectedDescription);

        ipRangeService.update(actualIPRange.getId(), ipRangeUpdate);

        IPRange updatedIPRange = ipRangeDAO.find(actualIPRange.getId());
        assertEquals(expectedCidr, updatedIPRange.getCidr());
        assertEquals(expectedDescription, updatedIPRange.getDescription());
        assertEquals(expectedIPLow, updatedIPRange.getIpLow());
        assertEquals(expectedIPHigh, updatedIPRange.getIpHigh());
    }

    public void testUpdateWithMalformedCidr() throws Exception {

        IPRange ipRange = new IPRange();
        ipRange.setCidr("a.0.b.1.xx/s");

        ipRangeDAO.persist(ipRange);

        ipRange.setCidr(ipRange.getCidr());

        BadRequestServiceEx ex =
                assertThrows(
                        BadRequestServiceEx.class,
                        () -> ipRangeService.update(ipRange.getId(), ipRange));
        assertTrue(ex.getMessage().startsWith("Invalid"));
    }

    public void testUpdateWithNullCidr() {

        IPRange ipRange = new IPRange();
        ipRange.setCidr("127.0.0.0/24");

        ipRangeDAO.persist(ipRange);

        ipRange.setCidr(null);

        BadRequestServiceEx ex =
                assertThrows(
                        BadRequestServiceEx.class,
                        () -> ipRangeService.update(ipRange.getId(), ipRange));
        assertEquals("CIDR must be specified", ex.getMessage());
    }

    public void testUpdateNotFoundIPRange() {
        assertThrows(NotFoundServiceEx.class, () -> ipRangeService.update(0L, new IPRange()));
    }

    public void testDelete() throws Exception {

        IPRange ipRange = new IPRange();
        ipRange.setCidr("127.0.0.0/24");

        ipRangeDAO.persist(ipRange);

        ipRangeService.delete(ipRange.getId());

        IPRange foundIPRange = ipRangeDAO.find(ipRange.getId());
        assertNull(foundIPRange);
    }

    public void testDeleteNotFoundIPRange() {
        assertThrows(NotFoundServiceEx.class, () -> ipRangeService.delete(0L));
    }

    public void testDeleteIPRangeInUse() throws Exception {

        IPRange ipRange = new IPRange();
        ipRange.setCidr("127.0.0.0/24");

        ipRangeDAO.persist(ipRange);

        SecurityRule rule =
                new SecurityRuleBuilder().canRead(true).ipRanges(Set.of(ipRange)).build();
        securityDAO.persist(rule);

        try {
            BadRequestServiceEx ex =
                    assertThrows(
                            BadRequestServiceEx.class,
                            () -> ipRangeService.delete(ipRange.getId()));
            assertTrue(ex.getMessage().contains("referenced by one or more security rules"));

            assertNotNull(ipRangeDAO.find(ipRange.getId()));
        } finally {
            // cleanup
            securityDAO.remove(rule);
        }
    }

    public void testIPRangeBoundsCalculationOnInsertion() throws Exception {

        IPRange ipRange = new IPRange();
        ipRange.setCidr("127.0.0.0/24");

        long ipRangeId = ipRangeService.insert(ipRange);

        IPRange foundIPRange = ipRangeDAO.find(ipRangeId);

        assertNotNull(foundIPRange);

        /* 127.0.0.0 */
        assertEquals(new BigInteger("2130706432"), ipRange.getIpLow());
        /* 127.0.0.255 */
        assertEquals(new BigInteger("2130706687"), ipRange.getIpHigh());
    }

    public void testIPRangeBoundsCalculationOnUpdate() throws Exception {

        IPRange ipRange = new IPRange();
        ipRange.setCidr("4.5.0.22/32");
        ipRange.setIpLow(BigInteger.ONE);
        ipRange.setIpHigh(BigInteger.TEN);

        ipRangeDAO.persist(ipRange);

        ipRange.setCidr("127.0.0.0/24");

        ipRangeService.update(ipRange.getId(), ipRange);

        IPRange updatedIPRange = ipRangeDAO.find(ipRange.getId());

        /* 127.0.0.0 */
        assertEquals(new BigInteger("2130706432"), updatedIPRange.getIpLow());
        /* 127.0.0.255 */
        assertEquals(new BigInteger("2130706687"), updatedIPRange.getIpHigh());
    }

    public void testIPBlockCalculationFromCidr() throws Exception {

        IPRange ipRange = new IPRange();
        ipRange.setCidr("127.168.1.1/1");

        long ipRangeId = ipRangeService.insert(ipRange);

        IPRange foundIPRange = ipRangeDAO.find(ipRangeId);

        assertNotNull(foundIPRange);

        /* 0.0.0.0 */
        assertEquals(new BigInteger("0"), ipRange.getIpLow());
        /* 192.255.255.255 */
        assertEquals(new BigInteger("2147483647"), ipRange.getIpHigh());
    }
}
