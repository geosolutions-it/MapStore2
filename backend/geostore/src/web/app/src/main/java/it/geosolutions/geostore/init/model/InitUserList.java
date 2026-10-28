/* ====================================================================
 *
 * Copyright (C) 2007 - 2012 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.init.model;

import it.geosolutions.geostore.core.model.User;

import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;

import java.util.Collections;
import java.util.Iterator;
import java.util.List;

/**
 * Class UserList.
 *
 * @author ETj (etj at geo-solutions.it)
 */
@XmlRootElement(name = "InitUserList")
public class InitUserList implements Iterable<User> {

    private List<User> list;

    public InitUserList() {}

    /**
     * @param list
     */
    public InitUserList(List<User> list) {
        this.list = list;
    }

    /**
     * @return List<Category>
     */
    @XmlElement(name = "User")
    public List<User> getList() {
        return list;
    }

    /**
     * @param list
     */
    public void setList(List<User> list) {
        this.list = list;
    }

    @Override
    public Iterator<User> iterator() {
        return list == null ? Collections.EMPTY_LIST.iterator() : list.iterator();
    }
}
