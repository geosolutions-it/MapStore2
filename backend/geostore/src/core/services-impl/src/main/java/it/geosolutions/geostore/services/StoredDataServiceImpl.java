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

import it.geosolutions.geostore.core.dao.ResourceDAO;
import it.geosolutions.geostore.core.dao.SecurityDAO;
import it.geosolutions.geostore.core.dao.StoredDataDAO;
import it.geosolutions.geostore.core.model.Resource;
import it.geosolutions.geostore.core.model.SecurityRule;
import it.geosolutions.geostore.core.model.StoredData;
import it.geosolutions.geostore.services.exception.NotFoundServiceEx;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

/**
 * Class StoredDataServiceImpl.
 *
 * @author ETj (etj at geo-solutions.it)
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 */
@Transactional(value = "geostoreTransactionManager", readOnly = true)
public class StoredDataServiceImpl implements StoredDataService {

    private static final Logger LOGGER = LogManager.getLogger(StoredDataServiceImpl.class);

    private StoredDataDAO storedDataDAO;

    private ResourceDAO resourceDAO;

    private SecurityDAO securityDAO;

    /**
     * @param resourceDAO the resourceDAO to set
     */
    public void setResourceDAO(ResourceDAO resourceDAO) {
        this.resourceDAO = resourceDAO;
    }

    public void setStoredDataDAO(StoredDataDAO storedDataDAO) {
        this.storedDataDAO = storedDataDAO;
    }

    public void setSecurityDAO(SecurityDAO securityDAO) {
        this.securityDAO = securityDAO;
    }

    @Override
    @Transactional(value = "geostoreTransactionManager")
    public long update(long id, String data) throws NotFoundServiceEx {
        Resource resource = resourceDAO.find(id);

        if (resource == null) {
            throw new NotFoundServiceEx("Resource not found: " + id);
        }

        StoredData sData = storedDataDAO.find(id);

        if (sData == null) {
            if (LOGGER.isInfoEnabled()) {
                LOGGER.info("Data not found: " + id);
            }

            sData = new StoredData();
            sData.setId(id);
            sData.setData(data);
            sData.setResource(resource);
            storedDataDAO.persist(sData);

            resource.setData(sData);
        } else {
            sData.setData(data);
            storedDataDAO.merge(sData);
        }

        resource.setLastUpdate(new Date());
        resourceDAO.merge(resource);

        return id;
    }

    /**
     * @param id
     * @return the StoredData or null if none was found with given id
     * @throws NotFoundServiceEx
     */
    @Override
    public StoredData get(long id) throws NotFoundServiceEx {
        Resource resource = resourceDAO.find(id);

        if (resource == null) {
            throw new NotFoundServiceEx("Corresponding Resource not found: " + id);
        }

        return storedDataDAO.find(id);
    }

    @Override
    @Transactional(value = "geostoreTransactionManager")
    public boolean delete(long id) {
        //
        // data on ancillary tables should be deleted by cascading
        //
        Resource resource = resourceDAO.find(id);
        if (resource != null) {
            resource.setData(null);
            resourceDAO.merge(resource);
        }
        return storedDataDAO.removeById(id);
    }

    @Override
    public List<StoredData> getAll() {
        return storedDataDAO.findAll();
    }

    @Override
    public List<SecurityRule> getUserSecurityRule(String name, long storedDataId) {
        return securityDAO.findUserSecurityRule(name, storedDataId);
    }

    @Override
    public List<SecurityRule> getGroupSecurityRule(List<String> groupNames, long storedDataId) {
        return securityDAO.findGroupSecurityRule(groupNames, storedDataId);
    }
}
