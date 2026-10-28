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

package it.geosolutions.geostore.core.dao.impl;

import com.googlecode.genericdao.search.ISearch;

import it.geosolutions.geostore.core.dao.TagDAO;
import it.geosolutions.geostore.core.model.Tag;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Transactional(value = "geostoreTransactionManager")
public class TagDAOImpl extends BaseDAO<Tag, Long> implements TagDAO {

    private static final Logger LOGGER = LogManager.getLogger(TagDAOImpl.class);

    @Override
    public void persist(Tag... entities) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.info("Inserting new entities for Tag ... ");
        }

        super.persist(entities);
    }

    @Override
    public List<Tag> findAll() {
        return super.findAll();
    }

    @SuppressWarnings("unchecked")
    @Override
    public List<Tag> search(ISearch search) {
        return super.search(search);
    }

    @Override
    public Tag merge(Tag entity) {
        return super.merge(entity);
    }

    @Override
    public boolean remove(Tag entity) {
        return super.remove(entity);
    }

    @Override
    public boolean removeById(Long id) {
        return super.removeById(id);
    }

    @Override
    public int count(ISearch search) {
        return super.count(search);
    }
}
