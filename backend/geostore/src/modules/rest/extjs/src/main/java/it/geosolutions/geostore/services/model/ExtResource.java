package it.geosolutions.geostore.services.model;

import it.geosolutions.geostore.core.model.Resource;

import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;

import java.util.Objects;

/**
 * An extended version of the {@link Resource} class that includes additional flags to indicate
 * whether the resource can be edited, deleted, or copied and if the resource is a user favorite.
 */
@XmlRootElement(name = "Resource")
public class ExtResource extends Resource {

    @XmlElement private boolean canEdit;
    @XmlElement private boolean canDelete;
    @XmlElement private boolean canCopy;
    @XmlElement private boolean isFavorite;

    public ExtResource() {}

    private ExtResource(Builder builder) {
        this.setId(builder.resource.getId());
        this.setName(builder.resource.getName());
        this.setDescription(builder.resource.getDescription());
        this.setCreation(builder.resource.getCreation());
        this.setLastUpdate(builder.resource.getLastUpdate());
        this.setCreator(builder.resource.getCreator());
        this.setEditor(builder.resource.getEditor());
        this.setAdvertised(builder.resource.isAdvertised());
        this.setMetadata(builder.resource.getMetadata());
        this.setAttribute(builder.resource.getAttribute());
        this.setData(builder.resource.getData());
        this.setCategory(builder.resource.getCategory());
        this.setSecurity(builder.resource.getSecurity());
        this.setTags(builder.resource.getTags());

        this.canEdit = builder.canEdit;
        this.canDelete = builder.canDelete;
        this.canCopy = builder.canCopy;
        this.isFavorite = builder.isFavorite;
    }

    public boolean isCanEdit() {
        return canEdit;
    }

    public boolean isCanDelete() {
        return canDelete;
    }

    public boolean isCanCopy() {
        return canCopy;
    }

    public boolean isFavorite() {
        return isFavorite;
    }

    public static Builder builder(Resource resource) {
        return new Builder(resource);
    }

    public static class Builder {
        private final Resource resource;
        private boolean canEdit;
        private boolean canDelete;
        private boolean canCopy;
        private boolean isFavorite;

        private Builder(Resource resource) {
            this.resource = resource;
        }

        public Builder withCanEdit(boolean canEdit) {
            this.canEdit = canEdit;
            return this;
        }

        public Builder withCanDelete(boolean canDelete) {
            this.canDelete = canDelete;
            return this;
        }

        public Builder withCanCopy(boolean canCopy) {
            this.canCopy = canCopy;
            return this;
        }

        public Builder withIsFavorite(boolean isFavorite) {
            this.isFavorite = isFavorite;
            return this;
        }

        public ExtResource build() {
            return new ExtResource(this);
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;
        ExtResource that = (ExtResource) o;
        return canEdit == that.canEdit
                && canDelete == that.canDelete
                && canCopy == that.canCopy
                && isFavorite == that.isFavorite;
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), canEdit, canDelete, canCopy, isFavorite);
    }
}
