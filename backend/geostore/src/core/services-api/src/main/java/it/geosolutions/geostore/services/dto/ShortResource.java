/*
 * ====================================================================
 *
 * Copyright (C) 2007 - 2025 GeoSolutions S.A.S.
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
package it.geosolutions.geostore.services.dto;

import it.geosolutions.geostore.core.model.Resource;

import jakarta.xml.bind.annotation.XmlRootElement;

import java.io.Serializable;
import java.util.Date;

/**
 * Class ShortResource.
 *
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 */
@XmlRootElement(name = "ShortResource")
public class ShortResource implements Serializable {

    /** The Constant serialVersionUID. */
    private static final long serialVersionUID = 4194472854104478362L;

    private long id;

    private String name;

    private String description;

    private Date creation;

    private Date lastUpdate;

    private boolean canEdit = false;

    private boolean canDelete = false;

    private boolean canCopy = false;

    private String creator;

    private String editor;

    private boolean advertised = true;

    public ShortResource() {}

    /**
     * @param resource
     */
    public ShortResource(Resource resource) {
        this.id = resource.getId();
        this.name = resource.getName();
        this.creation = resource.getCreation();
        this.description = resource.getDescription();
        this.lastUpdate = resource.getLastUpdate();
        this.creator = resource.getCreator();
        this.editor = resource.getEditor();
        this.advertised = resource.isAdvertised();
    }

    /**
     * @return the id
     */
    public long getId() {
        return id;
    }

    /**
     * @param id the id to set
     */
    public void setId(long id) {
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
     * @return the canEdit
     */
    public boolean isCanEdit() {
        return canEdit;
    }

    /**
     * @param canEdit the canEdit to set
     */
    public void setCanEdit(boolean canEdit) {
        this.canEdit = canEdit;
    }

    /**
     * @return the canDelete
     */
    public boolean isCanDelete() {
        return canDelete;
    }

    /**
     * @param canDelete the canDelete to set
     */
    public void setCanDelete(boolean canDelete) {
        this.canDelete = canDelete;
    }

    public boolean isCanCopy() {
        return canCopy;
    }

    public void setCanCopy(boolean canCopy) {
        this.canCopy = canCopy;
    }

    /**
     * @return
     */
    public String getCreator() {
        return creator;
    }

    /**
     * @param creator
     */
    public void setCreator(String creator) {
        this.creator = creator;
    }

    /**
     * @return
     */
    public String getEditor() {
        return editor;
    }

    /**
     * @param editor
     */
    public void setEditor(String editor) {
        this.editor = editor;
    }

    /**
     * @return the advertised
     */
    public Boolean isAdvertised() {
        return advertised;
    }

    /**
     * @param advertised the advertised to set
     */
    public void setAdvertised(Boolean advertised) {
        this.advertised = advertised;
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

        if (name != null) builder.append("name=").append(name).append(", ");

        if (description != null) builder.append("description=").append(description).append(", ");

        if (creation != null) builder.append("creation=").append(creation).append(", ");

        if (lastUpdate != null) builder.append("lastUpdate=").append(lastUpdate).append(", ");

        if (canEdit) builder.append("canEdit=").append(true).append(", ");

        if (canDelete) builder.append("canDelete=").append(true).append(", ");

        if (canCopy) builder.append("canCopy=").append(true).append(", ");

        if (creator != null) builder.append("creator=").append(creator).append(", ");

        if (editor != null) builder.append("editor=").append(editor).append(", ");

        if (advertised) builder.append("advertised=").append(advertised);

        builder.append(']');
        return builder.toString();
    }
}
