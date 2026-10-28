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

import com.googlecode.genericdao.dao.jpa.GenericDAOImpl;
import com.googlecode.genericdao.search.Filter;
import com.googlecode.genericdao.search.ISearch;
import com.googlecode.genericdao.search.Search;
import com.googlecode.genericdao.search.jpa.JPASearchProcessor;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import org.springframework.stereotype.Repository;

import java.io.Serializable;
import java.util.List;

/**
 * Class BaseDAO.
 *
 * <p>The base DAO furnish a set of methods usually used
 *
 * @author Tobia Di Pisa (tobia.dipisa@geo-solutions.it)
 * @author ETj (etj at geo-solutions.it)
 */
@Repository(value = "geostore")
public class BaseDAO<T, ID extends Serializable> extends GenericDAOImpl<T, ID> {

    @PersistenceContext(unitName = "geostoreEntityManagerFactory")
    private EntityManager entityManager;

    private JPASearchProcessor searchProcessor;

    /**
     * EntityManager setting
     *
     * @param entityManager the entity manager to set
     */
    @Override
    public void setEntityManager(EntityManager entityManager) {
        this.entityManager = entityManager;
        super.setEntityManager(this.entityManager);
    }

    /**
     * JPASearchProcessor setting
     *
     * @param searchProcessor the search processor to set
     */
    @Override
    public void setSearchProcessor(JPASearchProcessor searchProcessor) {
        this.searchProcessor = searchProcessor;
        super.setSearchProcessor(this.searchProcessor);
    }

    /*
     * (non-Javadoc)
     *
     * @see com.trg.dao.jpa.JPABaseDAO#em()
     */
    @Override
    public EntityManager em() {
        return this.entityManager;
    }

    protected ISearch normalizeSearchForSql(ISearch search) {
        if (search == null) {
            return new Search();
        }

        if (shouldNormalize(search)) {
            return createNormalizedSearchForSql(search);
        }

        return search;
    }

    private boolean shouldNormalize(ISearch search) {
        return search.getFilters().stream().anyMatch(this::hasLikeToStringOperator);
    }

    private Search createNormalizedSearchForSql(ISearch search) {
        Search sqlSearch = new Search(search.getSearchClass());

        sqlSearch.setFilters(calculateFilters(search));
        sqlSearch.setSorts(search.getSorts());

        int maxResults = search.getMaxResults();
        if (maxResults > 0) {
            sqlSearch.setPage(search.getPage());
            sqlSearch.setMaxResults(maxResults);
        }

        return sqlSearch;
    }

    private List<Filter> calculateFilters(ISearch search) {
        return search.getFilters().stream()
                .map(
                        f -> {
                            if (hasLikeToStringOperator(f)) {
                                return new Filter(
                                        f.getProperty(),
                                        f.getValue().toString().replaceAll("[*]", "%"),
                                        f.getOperator());
                            }
                            return f;
                        })
                .toList();
    }

    private boolean hasLikeToStringOperator(Filter f) {
        return f.getValue() instanceof String
                && (f.getOperator() == Filter.OP_LIKE || f.getOperator() == Filter.OP_ILIKE);
    }
}
