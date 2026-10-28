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

import it.geosolutions.geostore.core.dao.UserDAO;
import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserAttribute;
import it.geosolutions.geostore.core.model.UserGroup;
import it.geosolutions.geostore.core.security.password.PwEncoder;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.hibernate.Hibernate;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

/**
 * Class UserDAOImpl.
 *
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 * @author ETj (etj at geo-solutions.it)
 */
@Transactional(value = "geostoreTransactionManager")
public class UserDAOImpl extends BaseDAO<User, Long> implements UserDAO {

    private static final Logger LOGGER = LogManager.getLogger(UserDAOImpl.class);

    /*
     * (non-Javadoc)
     *
     * @see com.trg.dao.jpa.GenericDAOImpl#persist(T[])
     */
    @Override
    public void persist(User... entities) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.info("Inserting new entities for User ... ");
        }

        for (User user : entities) {
            String newpw = user.getNewPassword();
            if (newpw != null && !newpw.isEmpty()) {
                String enc = PwEncoder.encode(newpw);
                user.setPassword(enc);
            }
        }

        super.persist(entities);
    }

    /*
     * (non-Javadoc)
     *
     * @see com.trg.dao.jpa.GenericDAOImpl#findAll()
     */
    @Override
    public List<User> findAll() {
        return super.findAll();
    }

    @SuppressWarnings("unchecked")
    @Override
    public List<User> search(ISearch search) {
        return super.search(normalizeSearchForSql(search));
    }

    @Override
    public int count(ISearch search) {
        return super.count(normalizeSearchForSql(search));
    }

    /*
     * (non-Javadoc)
     *
     * @see com.trg.dao.jpa.GenericDAOImpl#merge(java.lang.Object)
     */
    @Override
    public User merge(User entity) {
        String newpw = entity.getNewPassword();
        if (newpw != null && !newpw.isEmpty()) {
            String enc = PwEncoder.encode(newpw);
            entity.setPassword(enc);
        }

        return super.merge(entity);
    }

    /*
     * (non-Javadoc)
     *
     * @see com.trg.dao.jpa.GenericDAOImpl#remove(java.lang.Object)
     */
    @Override
    public boolean remove(User entity) {
        return super.remove(entity);
    }

    /*
     * (non-Javadoc)
     *
     * @see com.trg.dao.jpa.GenericDAOImpl#removeById(java.io.Serializable)
     */
    @Override
    public boolean removeById(Long id) {
        return super.removeById(id);
    }

    /*
     * (non-Javadoc)
     *
     * @see com.trg.dao.jpa.GenericDAOImpl#find(java.io.Serializable)
     */
    @Override
    public User find(Long id) {
        User user = super.find(id);

        if (user != null) {
            //
            // To load the LAZY list of the user attributes
            //
            if (Hibernate.isInitialized(user)) {
                List<UserAttribute> attributes = user.getAttribute();
                Hibernate.initialize(attributes);
                Set<UserGroup> groups = user.getGroups();
                Hibernate.initialize(groups);
            }
        }

        return user;
    }

    /*
     * (non-Javadoc)
     *
     * @see com.trg.dao.jpa.GenericDAOImpl#save(T[])
     */
    @Override
    public User[] save(User... entities) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.info("Inserting new entities for User ... ");
        }

        for (User user : entities) {
            String newpw = user.getNewPassword();
            if (newpw != null && !newpw.isEmpty()) {
                String enc = PwEncoder.encode(newpw);
                user.setPassword(enc);
            }
        }

        return super.save(entities);
    }
}
