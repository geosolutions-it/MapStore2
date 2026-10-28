package it.geosolutions.geostore.core.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.xml.bind.annotation.XmlRootElement;
import jakarta.xml.bind.annotation.XmlTransient;

import java.io.Serializable;

@Entity(name = "UserGroupAttribute")
@Table(
        name = "gs_user_group_attribute",
        indexes = {
            @Index(name = "idx_user_group_attr_name", columnList = "name"),
            @Index(name = "idx_user_group_attr_text", columnList = "string"),
            @Index(name = "idx_attr_user_group", columnList = "usergroup_id")
        })
@XmlRootElement(name = "UserGroupAttribute")
public class UserGroupAttribute implements Serializable {

    @Id @GeneratedValue private Long id;

    @Column(name = "name", nullable = false, updatable = true)
    private String name;

    @Column(name = "string", nullable = true, updatable = true)
    private String value;

    @ManyToOne(optional = false)
    @JoinColumn(foreignKey = @ForeignKey(name = "fk_ugattrib_user_group"))
    private UserGroup userGroup;

    /**
     * @return the id
     */
    @XmlTransient
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
     * @return the value
     */
    public String getValue() {
        return value;
    }

    /**
     * @param value the value to set
     */
    public void setValue(String value) {
        this.value = value;
    }

    /**
     * @return the user
     */
    @XmlTransient
    public UserGroup getUserGroup() {
        return userGroup;
    }

    /**
     * @param userGroup the userGroup to set
     */
    public void setUserGroup(UserGroup userGroup) {
        this.userGroup = userGroup;
    }

    /*
     * (non-Javadoc) @see java.lang.Object#toString()
     */
    @Override
    public String toString() {
        StringBuilder builder = new StringBuilder();
        builder.append(getClass().getSimpleName()).append('[');

        if (id != null) {
            builder.append("id=").append(id);
        }

        if (name != null) {
            builder.append(", ");
            builder.append("name=").append(name);
        }

        if (value != null) {
            builder.append(", ");
            builder.append("value=").append(value);
        }

        builder.append(']');

        return builder.toString();
    }

    /*
     * (non-Javadoc) @see java.lang.Object#hashCode()
     */
    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = (prime * result) + ((id == null) ? 0 : id.hashCode());
        result = (prime * result) + ((name == null) ? 0 : name.hashCode());
        result = (prime * result) + ((userGroup == null) ? 0 : userGroup.hashCode());
        result = (prime * result) + ((value == null) ? 0 : value.hashCode());

        return result;
    }

    /*
     * (non-Javadoc) @see java.lang.Object#equals(java.lang.Object)
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }

        UserGroupAttribute other = (UserGroupAttribute) obj;
        if (id == null) {
            if (other.id != null) {
                return false;
            }
        } else if (!id.equals(other.id)) {
            return false;
        }
        if (name == null) {
            if (other.name != null) {
                return false;
            }
        } else if (!name.equals(other.name)) {
            return false;
        }
        if (userGroup == null) {
            if (other.userGroup != null) {
                return false;
            }
        } else if (!userGroup.equals(other.userGroup)) {
            return false;
        }
        if (value == null) {
            return other.value == null;
        } else return value.equals(other.value);
    }
}
