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

import com.googlecode.genericdao.search.Filter;
import com.googlecode.genericdao.search.ISearch;
import com.googlecode.genericdao.search.Search;

import it.geosolutions.geostore.core.dao.UserFavoriteDAO;
import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserFavorite;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Transactional(value = "geostoreTransactionManager")
public class UserFavoriteDAOImpl extends BaseDAO<UserFavorite, Long> implements UserFavoriteDAO {

    private static final Logger LOGGER = LogManager.getLogger(UserFavoriteDAOImpl.class);

    @Override
    public void persist(UserFavorite... entities) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.info("Inserting new entities for UserFavorite ... ");
        }

        super.persist(entities);
    }

    @SuppressWarnings("unchecked")
    @Override
    public List<UserFavorite> search(ISearch search) {
        return super.search(search);
    }

    @Override
    public boolean remove(UserFavorite entity) {
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

    @Override
    public List<UserFavorite> findByResourceId(Long resourceId) {

        Search searchCriteria =
                new Search(UserFavorite.class)
                        .addFilter(Filter.some("resource", Filter.equal("id", resourceId)));

        return super.search(searchCriteria);
    }

    @Override
    public List<UserFavorite> findByUser(User user) {

        Search searchCriteria =
                new Search(UserFavorite.class)
                        .addFilter(
                                Filter.or(
                                        Filter.equal("user.id", user.getId()),
                                        Filter.equal("username", user.getName())));

        return super.search(searchCriteria);
    }
}
