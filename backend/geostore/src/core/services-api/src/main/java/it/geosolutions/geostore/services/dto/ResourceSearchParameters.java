package it.geosolutions.geostore.services.dto;

import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.services.dto.search.SearchFilter;

public class ResourceSearchParameters {
    private final SearchFilter filter;
    private final Integer page;
    private final Integer entries;
    private final String sortBy;
    private final String sortOrder;
    private final String nameLike;
    private final boolean includeAttributes;
    private final boolean includeData;
    private final boolean includeTags;
    private final boolean favoritesOnly;
    private final User authUser;

    private ResourceSearchParameters(
            SearchFilter filter,
            Integer page,
            Integer entries,
            String sortBy,
            String sortOrder,
            String nameLike,
            boolean includeAttributes,
            boolean includeData,
            boolean includeTags,
            boolean favoritesOnly,
            User authUser) {
        this.filter = filter;
        this.page = page;
        this.entries = entries;
        this.sortBy = sortBy;
        this.sortOrder = sortOrder;
        this.nameLike = nameLike;
        this.includeAttributes = includeAttributes;
        this.includeData = includeData;
        this.includeTags = includeTags;
        this.favoritesOnly = favoritesOnly;
        this.authUser = authUser;
    }

    public SearchFilter getFilter() {
        return filter;
    }

    public Integer getPage() {
        return page;
    }

    public Integer getEntries() {
        return entries;
    }

    public String getSortBy() {
        return sortBy;
    }

    public String getSortOrder() {
        return sortOrder;
    }

    public String getNameLike() {
        return nameLike;
    }

    public boolean isIncludeAttributes() {
        return includeAttributes;
    }

    public boolean isIncludeData() {
        return includeData;
    }

    public boolean isIncludeTags() {
        return includeTags;
    }

    public boolean isFavoritesOnly() {
        return favoritesOnly;
    }

    public User getAuthUser() {
        return authUser;
    }

    public static ResourceSearchParameters.Builder builder() {
        return new ResourceSearchParameters.Builder();
    }

    public static class Builder {
        private SearchFilter filter;
        private Integer page;
        private Integer entries;
        private String sortBy;
        private String sortOrder;
        private String nameLike;
        private boolean includeAttributes;
        private boolean includeData;
        private boolean includeTags;
        private boolean favoritesOnly;
        private User authUser;

        private Builder() {}

        public Builder filter(SearchFilter filter) {
            this.filter = filter;
            return this;
        }

        public Builder page(Integer page) {
            this.page = page;
            return this;
        }

        public Builder entries(Integer entries) {
            this.entries = entries;
            return this;
        }

        public Builder sortBy(String sortBy) {
            this.sortBy = sortBy;
            return this;
        }

        public Builder sortOrder(String sortOrder) {
            this.sortOrder = sortOrder;
            return this;
        }

        public Builder nameLike(String nameLike) {
            this.nameLike = nameLike;
            return this;
        }

        public Builder includeAttributes(boolean includeAttributes) {
            this.includeAttributes = includeAttributes;
            return this;
        }

        public Builder includeData(boolean includeData) {
            this.includeData = includeData;
            return this;
        }

        public Builder includeTags(boolean includeTags) {
            this.includeTags = includeTags;
            return this;
        }

        public Builder favoritesOnly(boolean favoritesOnly) {
            this.favoritesOnly = favoritesOnly;
            return this;
        }

        public Builder authUser(User authUser) {
            this.authUser = authUser;
            return this;
        }

        public ResourceSearchParameters build() {
            return new ResourceSearchParameters(
                    filter,
                    page,
                    entries,
                    sortBy,
                    sortOrder,
                    nameLike,
                    includeAttributes,
                    includeData,
                    includeTags,
                    favoritesOnly,
                    authUser);
        }
    }
}
