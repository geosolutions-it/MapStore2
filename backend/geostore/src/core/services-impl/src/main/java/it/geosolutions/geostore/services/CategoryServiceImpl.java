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
package it.geosolutions.geostore.services;

import com.googlecode.genericdao.search.Search;

import it.geosolutions.geostore.core.dao.CategoryDAO;
import it.geosolutions.geostore.core.dao.SecurityDAO;
import it.geosolutions.geostore.core.model.Category;
import it.geosolutions.geostore.core.model.SecurityRule;
import it.geosolutions.geostore.services.exception.BadRequestServiceEx;
import it.geosolutions.geostore.services.exception.NotFoundServiceEx;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Class CategoryServiceImpl.
 *
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 * @author ETj (etj at geo-solutions.it)
 */
@SuppressWarnings("PMD.UnusedPrivateField")
@Transactional(value = "geostoreTransactionManager", readOnly = true)
public class CategoryServiceImpl implements CategoryService {

    private static final Logger LOGGER = LogManager.getLogger(CategoryServiceImpl.class);

    private CategoryDAO categoryDAO;

    private SecurityDAO securityDAO;

    /**
     * @param securityDAO the securityDAO to set
     */
    public void setSecurityDAO(SecurityDAO securityDAO) {
        this.securityDAO = securityDAO;
    }

    /**
     * @param categoryDAO the categoryDAO to set
     */
    public void setCategoryDAO(CategoryDAO categoryDAO) {
        this.categoryDAO = categoryDAO;
    }

    /*
     * (non-Javadoc)
     *
     * @see it.geosolutions.geostore.services.CategoryService#insert(it.geosolutions.geostore.core.model.Category)
     */
    @Override
    @Transactional(value = "geostoreTransactionManager")
    public long insert(Category category) throws BadRequestServiceEx, NotFoundServiceEx {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("Persisting Category ... ");
        }

        if (category == null) {
            throw new BadRequestServiceEx("Category type must be specified !");
        }

        Category cat = new Category();
        cat.setName(category.getName());

        categoryDAO.persist(cat);

        // //
        // // Persisting SecurityRule
        // //
        // List<SecurityRule> rules = category.getSecurity();
        //
        // if (rules != null) {
        // for (SecurityRule rule : rules) {
        // rule.setCategory(cat);
        // securityDAO.persist(rule);
        // }
        // }

        return cat.getId();
    }

    /*
     * (non-Javadoc)
     *
     * @see it.geosolutions.geostore.services.CategoryService#update(it.geosolutions.geostore.core.model.Category)
     */
    @Override
    @Transactional(value = "geostoreTransactionManager")
    public long update(Category category) throws BadRequestServiceEx {
        throw new BadRequestServiceEx("Category can not be updated !");
    }

    /*
     * (non-Javadoc)
     *
     * @see it.geosolutions.geostore.services.CategoryService#get(long)
     */
    @Override
    public Category get(long id) {
        Category category = categoryDAO.find(id);

        return category;
    }

    /*
     * (non-Javadoc)
     *
     * @see it.geosolutions.geostore.services.CategoryService#get(long)
     */
    @Override
    public Category get(String name) throws BadRequestServiceEx {
        if (name == null) {
            throw new BadRequestServiceEx("Category name must be specified !");
        }

        Search searchCriteria = new Search(Category.class);
        searchCriteria.addFilterEqual("name", name);
        List<Category> categories = categoryDAO.search(searchCriteria);
        if (categories.size() > 1) {
            LOGGER.warn("Found " + categories.size() + " categories with name '" + name + "'");
        }

        return categories.isEmpty() ? null : categories.get(0);
    }

    /*
     * (non-Javadoc)
     *
     * @see it.geosolutions.geostore.services.CategoryService#delete(long)
     */
    @Override
    @Transactional(value = "geostoreTransactionManager")
    public boolean delete(long id) {
        return categoryDAO.removeById(id);
    }

    /*
     * (non-Javadoc)
     *
     * @see it.geosolutions.geostore.services.CategoryService#getAll(java.lang.Integer, java.lang.Integer)
     */
    @Override
    public List<Category> getAll(Integer page, Integer entries) throws BadRequestServiceEx {

        if (((page != null) && (entries == null)) || ((page == null) && (entries != null))) {
            throw new BadRequestServiceEx("Page and entries params should be declared together.");
        }

        Search searchCriteria = new Search(Category.class);

        if (page != null) {
            searchCriteria.setMaxResults(entries);
            searchCriteria.setPage(page);
        }

        searchCriteria.addSortAsc("name");

        List<Category> found = categoryDAO.search(searchCriteria);

        return found;
    }

    /*
     * (non-Javadoc)
     *
     * @see it.geosolutions.geostore.services.CategoryService#getCount(java.lang.String)
     */
    @Override
    public long getCount(String nameLike) {
        Search searchCriteria = new Search(Category.class);

        if (nameLike != null) {
            searchCriteria.addFilterILike("name", nameLike);
        }

        return categoryDAO.count(searchCriteria);
    }

    /*
     * (non-Javadoc)
     *
     * @see it.geosolutions.geostore.services.CategoryService#getUserSecurityRule(java.lang.String, long)
     */
    @Override
    public List<SecurityRule> getUserSecurityRule(String userName, long categoryId) {
        return categoryDAO.findUserSecurityRule(userName, categoryId);
    }

    /* (non-Javadoc)
     * @see it.geosolutions.geostore.services.SecurityService#getGroupSecurityRule(java.lang.String, long)
     */
    @Override
    public List<SecurityRule> getGroupSecurityRule(List<String> userName, long categoryId) {
        return categoryDAO.findGroupSecurityRule(userName, categoryId);
    }
}
