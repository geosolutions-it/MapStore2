/*
 * Copyright (C) 2025 GeoSolutions S.A.S.
 * http://www.geo-solutions.it
 *
 * GPLv3 + Classpath exception
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.
 *
 * ====================================================================
 *
 * This software consists of voluntary contributions made by developers
 * of GeoSolutions.  For more information on GeoSolutions, please see
 * <http://www.geo-solutions.it/>.
 *
 */
package it.geosolutions.geostore.services.rest.impl;

import it.geosolutions.geostore.core.model.IPRange;
import it.geosolutions.geostore.services.IPRangeService;
import it.geosolutions.geostore.services.exception.BadRequestServiceEx;
import it.geosolutions.geostore.services.exception.NotFoundServiceEx;
import it.geosolutions.geostore.services.rest.RESTIPRangeService;
import it.geosolutions.geostore.services.rest.exception.BadRequestWebEx;
import it.geosolutions.geostore.services.rest.exception.NotFoundWebEx;
import it.geosolutions.geostore.services.rest.model.IPRangeList;
import it.geosolutions.geostore.services.rest.model.RESTIPRange;

import jakarta.ws.rs.core.SecurityContext;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.List;

public class RESTIPRangeServiceImpl implements RESTIPRangeService {

    private static final Logger LOGGER = LogManager.getLogger(RESTIPRangeServiceImpl.class);

    private IPRangeService ipRangeService;

    public void setIpRangeService(IPRangeService ipRangeService) {
        this.ipRangeService = ipRangeService;
    }

    @Override
    public long insert(SecurityContext sc, RESTIPRange ipRange) throws BadRequestServiceEx {
        try {
            if (ipRange == null) throw new BadRequestWebEx("IP range is null");
            if (ipRange.getId() != null) throw new BadRequestWebEx("Id should be null");

            return ipRangeService.insert(ipRange.toIPRange());
        } catch (BadRequestServiceEx e) {
            LOGGER.error(e.getMessage(), e);
            throw new BadRequestWebEx(e.getMessage());
        }
    }

    @Override
    public IPRangeList getAll(SecurityContext sc) throws BadRequestWebEx {
        try {
            List<IPRange> ipRanges = ipRangeService.getAll();

            long count = 0;
            if (!ipRanges.isEmpty()) {
                count = ipRangeService.count();
            }

            return new IPRangeList(ipRanges.stream().map(RESTIPRange::new).toList(), count);

        } catch (BadRequestServiceEx e) {
            LOGGER.error(e.getMessage(), e);
            throw new BadRequestWebEx(e.getMessage());
        }
    }

    @Override
    public RESTIPRange get(SecurityContext sc, long id) throws NotFoundWebEx {
        IPRange ipRange = ipRangeService.get(id);

        if (ipRange == null) {
            throw new NotFoundWebEx("IP range not found");
        }

        return new RESTIPRange(ipRange);
    }

    @Override
    public long update(SecurityContext sc, long id, RESTIPRange ipRange) {
        try {
            return ipRangeService.update(id, ipRange.toIPRange());
        } catch (BadRequestServiceEx e) {
            LOGGER.error(e.getMessage(), e);
            throw new BadRequestWebEx(e.getMessage());
        } catch (NotFoundServiceEx e) {
            throw new NotFoundWebEx(e.getMessage());
        }
    }

    @Override
    public void delete(SecurityContext sc, long id) throws NotFoundWebEx, BadRequestWebEx {
        try {
            ipRangeService.delete(id);
        } catch (BadRequestServiceEx e) {
            LOGGER.error(e.getMessage(), e);
            throw new BadRequestWebEx(e.getMessage());
        } catch (NotFoundServiceEx e) {
            throw new NotFoundWebEx(e.getMessage());
        }
    }
}
