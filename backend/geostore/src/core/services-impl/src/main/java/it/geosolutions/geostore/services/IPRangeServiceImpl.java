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

import com.googlecode.genericdao.search.Search;

import inet.ipaddr.IPAddress;
import inet.ipaddr.IPAddressString;

import it.geosolutions.geostore.core.dao.IpRangeDAO;
import it.geosolutions.geostore.core.dao.SecurityDAO;
import it.geosolutions.geostore.core.model.IPRange;
import it.geosolutions.geostore.services.exception.BadRequestServiceEx;
import it.geosolutions.geostore.services.exception.NotFoundServiceEx;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Transactional(value = "geostoreTransactionManager", readOnly = true)
public class IPRangeServiceImpl implements IPRangeService {

    private static final Logger LOGGER = LogManager.getLogger(IPRangeServiceImpl.class);

    private IpRangeDAO ipRangeDAO;

    private SecurityDAO securityDAO;

    public void setIpRangeDAO(IpRangeDAO ipRangeDAO) {
        this.ipRangeDAO = ipRangeDAO;
    }

    public void setSecurityDAO(SecurityDAO securityDAO) {
        this.securityDAO = securityDAO;
    }

    @Override
    @Transactional(value = "geostoreTransactionManager")
    public long insert(IPRange ipRange) throws BadRequestServiceEx {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("Persisting IP range...");
        }

        if (ipRange == null) {
            throw new BadRequestServiceEx("IP range must be specified");
        }

        if (ipRange.getCidr() == null) {
            throw new BadRequestServiceEx("CIDR must be specified");
        }

        ipRange.setCidr(sanitizeCidr(ipRange.getCidr()));

        updateIPRangeBounds(ipRange);

        ipRangeDAO.persist(ipRange);

        return ipRange.getId();
    }

    private String sanitizeCidr(String cidr) throws BadRequestServiceEx {
        try {

            String[] parts = cidr.split("/");
            if (parts.length != 2) {
                throw new IllegalArgumentException("invalid format");
            }

            String ip = parts[0].trim();
            String prefix = parts[1].trim();

            String sanitizedIp =
                    Arrays.stream(ip.split("\\."))
                            .map(s -> String.valueOf(Integer.parseInt(s)))
                            .collect(Collectors.joining("."));
            String sanitizedCidr = sanitizedIp + "/" + prefix;

            return new IPAddressString(sanitizedCidr).toAddress().toString();
        } catch (Exception ex) {
            throw new BadRequestServiceEx("Invalid CIDR: " + ex.getMessage(), ex);
        }
    }

    @Override
    public List<IPRange> getAll() throws BadRequestServiceEx {
        Search searchCriteria = new Search(IPRange.class);

        searchCriteria.addSortAsc("description");

        return ipRangeDAO.search(searchCriteria);
    }

    public IPRange get(long id) {
        return ipRangeDAO.find(id);
    }

    @Transactional(value = "geostoreTransactionManager")
    public long update(long id, IPRange ipRange) throws BadRequestServiceEx, NotFoundServiceEx {

        IPRange original = get(id);
        if (original == null) {
            throw new NotFoundServiceEx("IP range not found");
        }

        if (ipRange.getCidr() == null) {
            throw new BadRequestServiceEx("CIDR must be specified");
        }

        ipRange.setCidr(sanitizeCidr(ipRange.getCidr()));

        updateIPRangeBounds(ipRange);

        ipRange.setId(id);

        ipRangeDAO.merge(ipRange);

        return id;
    }

    private void updateIPRangeBounds(IPRange ipRange) {
        IPAddress cidr = new IPAddressString(ipRange.getCidr()).getAddress().toPrefixBlock();
        ipRange.setIpLow(cidr.getLower().getValue());
        ipRange.setIpHigh(cidr.getUpper().getValue());
    }

    @Transactional(value = "geostoreTransactionManager")
    public void delete(long id) throws NotFoundServiceEx, BadRequestServiceEx {
        if (get(id) == null) {
            throw new NotFoundServiceEx("IPRange not found");
        }

        if (securityDAO.isIpRangeInUse(id)) {
            throw new BadRequestServiceEx(
                    "IPRange is still referenced by one or more security rules and cannot be deleted");
        }

        if (!ipRangeDAO.removeById(id)) {
            throw new NotFoundServiceEx("IPRange not found");
        }
    }

    public long count() {
        return ipRangeDAO.count(new Search(IPRange.class));
    }
}
