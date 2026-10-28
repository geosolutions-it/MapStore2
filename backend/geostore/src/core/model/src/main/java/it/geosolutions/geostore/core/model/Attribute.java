/*
 * ====================================================================
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
package it.geosolutions.geostore.core.model;

import it.geosolutions.geostore.core.model.enums.DataType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import jakarta.persistence.Transient;
import jakarta.persistence.UniqueConstraint;
import jakarta.xml.bind.annotation.XmlAttribute;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;
import jakarta.xml.bind.annotation.XmlTransient;

import java.io.Serializable;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Class Attribute.
 *
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 * @author Emanuele Tajariol (etj at geo-solutions.it)
 */
@Entity(name = "Attribute")
@Table(
        name = "gs_attribute",
        uniqueConstraints = {@UniqueConstraint(columnNames = {"name", "resource_id"})},
        indexes = {
            @Index(name = "idx_attribute_name", columnList = "name"),
            @Index(name = "idx_attribute_text", columnList = "attribute_text"),
            @Index(name = "idx_attribute_number", columnList = "attribute_number"),
            @Index(name = "idx_attribute_date", columnList = "attribute_date"),
            @Index(name = "idx_attribute_type", columnList = "attribute_type"),
            @Index(name = "idx_attribute_resource", columnList = "resource_id"),
        })
// @Cache(usage = CacheConcurrencyStrategy.READ_WRITE, region = "gs_attribute")
@XmlRootElement(name = "Attribute")
public class Attribute implements Serializable {

    /** The Constant serialVersionUID. */
    private static final long serialVersionUID = -1298676702253831972L;

    @Id @GeneratedValue private Long id;

    @Column(name = "name", nullable = false, updatable = true)
    private String name;

    @Column(name = "attribute_text", nullable = true, updatable = true)
    private String textValue;

    @Column(name = "attribute_number", nullable = true, updatable = true)
    private Double numberValue;

    @Column(name = "attribute_date", nullable = true, updatable = true)
    @Temporal(TemporalType.TIMESTAMP)
    private Date dateValue;

    @Column(name = "attribute_type", nullable = false, updatable = false)
    @Enumerated(EnumType.STRING)
    private DataType type;

    @ManyToOne(optional = false)
    @JoinColumn(foreignKey = @ForeignKey(name = "fk_attribute_resource"))
    private Resource resource;

    /** Only used for XML un/marshaling */
    public static final String DATE_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSSZ";

    /**
     * @throws Exception
     */
    @PreUpdate
    @PrePersist
    public void onPreUpdate() throws Exception {
        if (textValue == null && numberValue == null && dateValue == null) {
            throw new NullPointerException(
                    "Null value not allowed in attribute: " + this.toString());

        } else if (this.textValue == null && this.numberValue != null ^ this.dateValue != null
                || this.numberValue == null && this.dateValue == null) {
            this.type =
                    this.textValue != null
                            ? DataType.STRING
                            : (this.numberValue != null ? DataType.NUMBER : DataType.DATE);

        } else {
            throw new Exception(
                    "Only one DataType can be not-null inside the Attribute entity: "
                            + this.toString());
        }
    }

    /**
     * @return the id
     */
    @XmlTransient
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
     * @return the attribute
     */
    public String getName() {
        return name;
    }

    /**
     * @param name the attribute to set
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * @return the textValue
     */
    @XmlTransient
    public String getTextValue() {
        return textValue;
    }

    /**
     * @param textValue the textValue to set
     */
    public void setTextValue(String textValue) {
        this.textValue = textValue;
    }

    /**
     * @return the numberValue
     */
    @XmlTransient
    public Double getNumberValue() {
        return numberValue;
    }

    /**
     * @param numberValue the numberValue to set
     */
    public void setNumberValue(Double numberValue) {
        this.numberValue = numberValue;
    }

    /**
     * @return the dateValue
     */
    @XmlTransient
    public Date getDateValue() {
        return dateValue;
    }

    /**
     * @param dateValue the dateValue to set
     */
    public void setDateValue(Date dateValue) {
        this.dateValue = dateValue;
    }

    /** Only used for XML marshalling */
    @Transient
    @XmlElement
    public String getValue() {

        switch (type) {
            case DATE:
                return new SimpleDateFormat(DATE_FORMAT).format(dateValue);
            case NUMBER:
                return numberValue.toString();
            case STRING:
                return textValue.toString();
            default:
                throw new IllegalStateException("Unknown type " + type);
        }
    }

    /** Only used for XML unmarshalling */
    protected void setValue(String text) {
        if (type != null) {
            setValue(text, type);
        } else {
            throw new IllegalStateException("Setting value with no type selected");
        }
    }

    protected void setValue(String text, DataType type) {
        switch (type) {
            case DATE:
                try {
                    dateValue = new SimpleDateFormat(DATE_FORMAT).parse(text);
                } catch (Exception e) {
                    throw new IllegalArgumentException("Can't parse date [" + text + "]", e);
                }
                break;
            case NUMBER:
                try {
                    numberValue = Double.valueOf(text);
                } catch (NumberFormatException e) {
                    throw new IllegalArgumentException("Can't parse double [" + text + "]", e);
                }
                break;
            case STRING:
                textValue = text;
                break;
            default:
                throw new IllegalStateException("Unknown type " + type);
        }
    }

    /**
     * THe XMLAttribute annotation is to make sure that type will be unmarshalled before value.
     *
     * @return the type
     */
    @XmlAttribute
    public DataType getType() {
        return type;
    }

    /**
     * @param type the type to set
     */
    public void setType(DataType type) {
        this.type = type;
    }

    /**
     * @return the resource
     */
    @XmlTransient
    public Resource getResource() {
        return resource;
    }

    /**
     * @param resource the resource to set
     */
    public void setResource(Resource resource) {
        this.resource = resource;
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

        if (id != null) {
            builder.append("id=").append(id);
        } else builder.append("id is null");

        if (name != null) {
            builder.append(", name=").append(name);
        }

        if (textValue != null) {
            builder.append(", textValue=").append(textValue);
        }

        if (numberValue != null) {
            builder.append(", numberValue=").append(numberValue);
        }

        if (dateValue != null) {
            builder.append(", dateValue=").append(dateValue);
        }

        if (textValue == null && numberValue == null && dateValue == null) {
            builder.append(", value is null");
        }

        if (type != null) {
            builder.append(", type=").append(type);
        }

        builder.append(']');
        return builder.toString();
    }

    /*
     * (non-Javadoc)
     *
     * @see java.lang.Object#hashCode()
     */
    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((dateValue == null) ? 0 : dateValue.hashCode());
        result = prime * result + ((id == null) ? 0 : id.hashCode());
        result = prime * result + ((name == null) ? 0 : name.hashCode());
        result = prime * result + ((numberValue == null) ? 0 : numberValue.hashCode());
        result = prime * result + ((resource == null) ? 0 : resource.hashCode());
        result = prime * result + ((textValue == null) ? 0 : textValue.hashCode());
        result = prime * result + ((type == null) ? 0 : type.hashCode());
        return result;
    }

    /*
     * (non-Javadoc)
     *
     * @see java.lang.Object#equals(java.lang.Object)
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null) return false;
        if (getClass() != obj.getClass()) return false;
        Attribute other = (Attribute) obj;
        if (dateValue == null) {
            if (other.dateValue != null) return false;
        } else if (!dateValue.equals(other.dateValue)) return false;
        if (id == null) {
            if (other.id != null) return false;
        } else if (!id.equals(other.id)) return false;
        if (name == null) {
            if (other.name != null) return false;
        } else if (!name.equals(other.name)) return false;
        if (numberValue == null) {
            if (other.numberValue != null) return false;
        } else if (!numberValue.equals(other.numberValue)) return false;
        if (resource == null) {
            if (other.resource != null) return false;
        } else if (!resource.equals(other.resource)) return false;
        if (textValue == null) {
            if (other.textValue != null) return false;
        } else if (!textValue.equals(other.textValue)) return false;
        if (type != other.type) return false;
        return true;
    }
}
