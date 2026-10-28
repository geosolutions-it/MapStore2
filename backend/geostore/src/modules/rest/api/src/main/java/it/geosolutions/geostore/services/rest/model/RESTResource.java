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
package it.geosolutions.geostore.services.rest.model;

import it.geosolutions.geostore.services.dto.ShortAttribute;

import jakarta.xml.bind.annotation.XmlElementWrapper;
import jakarta.xml.bind.annotation.XmlRootElement;
import jakarta.xml.bind.annotation.XmlTransient;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

/**
 * Class RESTResource.
 *
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 * @author ETj (etj at geo-solutions.it)
 */
@XmlRootElement(name = "Resource")
public class RESTResource implements Serializable {

    /** The Constant serialVersionUID. */
    private static final long serialVersionUID = -2854721983878935169L;

    /** The id. */
    private Long id;

    private String name;

    private String description;

    private Date creation;

    private Date lastUpdate;

    private String metadata;

    private String creator;

    private String editor;

    private List<ShortAttribute> attribute;

    private RESTStoredData store;

    private RESTCategory category;

    private boolean advertised = true;

    /**
     * @return the id
     */
    public Long getId() {
        return id;
    }

    /**
     * @param id the id to set
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * @return the name
     */
    public String getName() {
        return name;
    }

    /**
     * @param name the name to set
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * @return the description
     */
    public String getDescription() {
        return description;
    }

    /**
     * @param description the description to set
     */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * @return the creation
     */
    public Date getCreation() {
        return creation;
    }

    /**
     * @param creation the creation to set
     */
    public void setCreation(Date creation) {
        this.creation = creation;
    }

    /**
     * @return the lastUpdate
     */
    public Date getLastUpdate() {
        return lastUpdate;
    }

    /**
     * @param lastUpdate the lastUpdate to set
     */
    public void setLastUpdate(Date lastUpdate) {
        this.lastUpdate = lastUpdate;
    }

    /**
     * @return the metadata
     */
    public String getMetadata() {
        return metadata;
    }

    /**
     * @param metadata the metadata to set
     */
    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }

    /**
     * @return the attribute
     */
    @XmlElementWrapper(name = "Attributes")
    public List<ShortAttribute> getAttribute() {
        return attribute;
    }

    /**
     * @param attribute the attribute to set
     */
    public void setAttribute(List<ShortAttribute> attribute) {
        this.attribute = attribute;
    }

    /**
     * @return the store
     */
    public RESTStoredData getStore() {
        return store;
    }

    /**
     * @param store the store to set
     */
    public void setStore(RESTStoredData store) {
        this.store = store;
    }

    /** Shortcut for reading data */
    @XmlTransient
    public String getData() {
        return store == null ? null : store.getData();
    }

    /** Shortcut for setting data */
    public void setData(String data) {
        this.store = data == null ? null : new RESTStoredData(data);
    }

    /**
     * @return the category
     */
    public RESTCategory getCategory() {
        return category;
    }

    /**
     * @param category the category to set
     */
    public void setCategory(RESTCategory category) {
        this.category = category;
    }

    /**
     * @return the creator username
     */
    public String getCreator() {
        return creator;
    }

    /**
     * @param creator the creator username
     */
    public void setCreator(String creator) {
        this.creator = creator;
    }

    /**
     * @return the editor username
     */
    public String getEditor() {
        return editor;
    }

    /**
     * @param editor the creator username
     */
    public void setEditor(String editor) {
        this.editor = editor;
    }

    /**
     * @param advertised weather the resource is advertised or not
     */
    public void setAdvertised(boolean advertised) {
        this.advertised = advertised;
    }

    /**
     * @return advertised weather the resource is advertised or not
     */
    public boolean isAdvertised() {
        return this.advertised;
    }

    /*
     * (non-Javadoc)
     *
     * @see java.lang.Object#toString()
     */
    @Override
    public String toString() {
        StringBuilder builder = new StringBuilder();
        builder.append(getClass().getSimpleName()).append('[');

        builder.append("id=").append(id);

        if (name != null) builder.append(", name=").append(name);

        if (description != null) builder.append(", descr=").append(description);

        if (creation != null) builder.append(", created=").append(creation);

        if (lastUpdate != null) builder.append(", updated=").append(lastUpdate);

        if (metadata != null) builder.append(", meta=").append(metadata);

        if (attribute != null) builder.append(", attr=").append(attribute);

        if (store != null) builder.append(", store=").append(store);

        if (category != null) builder.append(", cat=").append(category);

        if (creator != null) builder.append(", creator=").append(creator);

        if (editor != null) builder.append(", editor=").append(editor);

        builder.append(", advertised=").append(advertised);
        builder.append(']');
        return builder.toString();
    }
}
