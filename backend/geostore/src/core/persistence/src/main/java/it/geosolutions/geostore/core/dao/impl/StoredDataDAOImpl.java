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
package it.geosolutions.geostore.core.dao.impl;

import com.googlecode.genericdao.search.ISearch;

import it.geosolutions.geostore.core.dao.StoredDataDAO;
import it.geosolutions.geostore.core.model.StoredData;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Class StoredDataDAOImpl.
 *
 * @author Emanuele Tajariol (etj at geo-solutions.it)
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 */
@Transactional(value = "geostoreTransactionManager")
public class StoredDataDAOImpl extends BaseDAO<StoredData, Long> implements StoredDataDAO {

    private static final Logger LOGGER = LogManager.getLogger(StoredDataDAOImpl.class);

    @Override
    public void persist(StoredData... entities) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.info("Inserting new entities for StoredData ... ");
        }

        super.persist(entities);
    }

    @Override
    public List<StoredData> findAll() {
        return super.findAll();
    }

    @SuppressWarnings("unchecked")
    @Override
    public List<StoredData> search(ISearch search) {
        return super.search(search);
    }

    @Override
    public StoredData merge(StoredData entity) {
        return super.merge(entity);
    }

    @Override
    public boolean remove(StoredData entity) {
        return super.remove(entity);
    }

    @Override
    public boolean removeById(Long id) {
        return super.removeById(id);
    }
}
