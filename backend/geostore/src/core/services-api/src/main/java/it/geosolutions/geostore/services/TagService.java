/*
 * ====================================================================
 *
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
package it.geosolutions.geostore.services;

import it.geosolutions.geostore.core.model.Tag;
import it.geosolutions.geostore.services.exception.BadRequestServiceEx;
import it.geosolutions.geostore.services.exception.DuplicatedTagNameServiceException;
import it.geosolutions.geostore.services.exception.NotFoundServiceEx;

import java.util.List;

public interface TagService {

    /**
     * @param tag
     * @return long
     * @throws BadRequestServiceEx
     * @throws DuplicatedTagNameServiceException
     */
    long insert(Tag tag) throws BadRequestServiceEx, DuplicatedTagNameServiceException;

    /**
     * @param page
     * @param entries
     * @param nameLike
     * @return List<Tag>
     * @throws BadRequestServiceEx
     */
    List<Tag> getAll(Integer page, Integer entries, String nameLike) throws BadRequestServiceEx;

    /**
     * @param id
     * @return Tag
     */
    Tag get(long id);

    /**
     * @param id
     * @param tag
     * @return long
     * @throws NotFoundServiceEx
     * @throws BadRequestServiceEx
     * @throws DuplicatedTagNameServiceException
     */
    long update(long id, Tag tag)
            throws BadRequestServiceEx, NotFoundServiceEx, DuplicatedTagNameServiceException;

    /**
     * @param id
     * @return
     */
    void delete(long id) throws NotFoundServiceEx;

    long count(String nameLike);

    void addToResource(long id, long resourceId) throws NotFoundServiceEx;

    void removeFromResource(long id, long resourceId) throws NotFoundServiceEx;
}
