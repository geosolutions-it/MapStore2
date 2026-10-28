/* ====================================================================
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
package it.geosolutions.geostore.services;

import com.googlecode.genericdao.search.Filter;
import com.googlecode.genericdao.search.Search;
import com.googlecode.genericdao.search.Sort;

import it.geosolutions.geostore.core.dao.AttributeDAO;
import it.geosolutions.geostore.core.dao.CategoryDAO;
import it.geosolutions.geostore.core.dao.IpRangeDAO;
import it.geosolutions.geostore.core.dao.ResourceDAO;
import it.geosolutions.geostore.core.dao.SecurityDAO;
import it.geosolutions.geostore.core.dao.StoredDataDAO;
import it.geosolutions.geostore.core.dao.UserFavoriteDAO;
import it.geosolutions.geostore.core.dao.UserGroupDAO;
import it.geosolutions.geostore.core.model.Attribute;
import it.geosolutions.geostore.core.model.Category;
import it.geosolutions.geostore.core.model.IPRange;
import it.geosolutions.geostore.core.model.Resource;
import it.geosolutions.geostore.core.model.SecurityRule;
import it.geosolutions.geostore.core.model.StoredData;
import it.geosolutions.geostore.core.model.User;
import it.geosolutions.geostore.core.model.UserGroup;
import it.geosolutions.geostore.core.model.enums.DataType;
import it.geosolutions.geostore.services.dto.ResourceSearchParameters;
import it.geosolutions.geostore.services.dto.ShortAttribute;
import it.geosolutions.geostore.services.dto.ShortResource;
import it.geosolutions.geostore.services.dto.search.SearchFilter;
import it.geosolutions.geostore.services.exception.BadRequestServiceEx;
import it.geosolutions.geostore.services.exception.DuplicatedResourceNameServiceEx;
import it.geosolutions.geostore.services.exception.InternalErrorServiceEx;
import it.geosolutions.geostore.services.exception.NotFoundServiceEx;
import it.geosolutions.geostore.util.SearchConverter;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.dao.DataIntegrityViolationException;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Class ResourceServiceImpl.
 *
 * @author Tobia di Pisa (tobia.dipisa at geo-solutions.it)
 * @author ETj (etj at geo-solutions.it)
 */
public class ResourceServiceImpl implements ResourceService {

    private static final Logger LOGGER = LogManager.getLogger(ResourceServiceImpl.class);

    private UserGroupDAO userGroupDAO;

    private UserFavoriteDAO userFavoriteDAO;

    private ResourceDAO resourceDAO;

    private AttributeDAO attributeDAO;

    private StoredDataDAO storedDataDAO;

    private CategoryDAO categoryDAO;

    private SecurityDAO securityDAO;

    private IpRangeDAO ipRangeDAO;

    private ResourcePermissionService resourcePermissionService;

    public void setUserFavoriteDAO(UserFavoriteDAO userFavoriteDAO) {
        this.userFavoriteDAO = userFavoriteDAO;
    }

    public void setUserGroupDAO(UserGroupDAO userGroupDAO) {
        this.userGroupDAO = userGroupDAO;
    }

    public void setResourceDAO(ResourceDAO resourceDAO) {
        this.resourceDAO = resourceDAO;
    }

    public void setAttributeDAO(AttributeDAO attributeDAO) {
        this.attributeDAO = attributeDAO;
    }

    public void setStoredDataDAO(StoredDataDAO storedDataDAO) {
        this.storedDataDAO = storedDataDAO;
    }

    public void setCategoryDAO(CategoryDAO categoryDAO) {
        this.categoryDAO = categoryDAO;
    }

    public void setSecurityDAO(SecurityDAO securityDAO) {
        this.securityDAO = securityDAO;
    }

    public void setIpRangeDAO(IpRangeDAO ipRangeDAO) {
        this.ipRangeDAO = ipRangeDAO;
    }

    public void setResourcePermissionService(ResourcePermissionService resourcePermissionService) {
        this.resourcePermissionService = resourcePermissionService;
    }

    /*
     * (non-Javadoc)
     *
     * @see it.geosolutions.geostore.services.ResourceService#insert(it.geosolutions.geostore.core.model.Resource)
     */
    @Override
    public long insert(Resource resource)
            throws BadRequestServiceEx, NotFoundServiceEx, DuplicatedResourceNameServiceEx {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("Persisting Resource ... ");
        }

        validateResourceName(resource, false);

        Category category = resource.getCategory();
        if (category == null) {
            throw new BadRequestServiceEx("Category type must be specified");
        }

        //
        // Searching the corresponding Category
        //
        Category loadedCategory = null;

        if (category.getId() != null) {
            loadedCategory = categoryDAO.find(category.getId());
            if (loadedCategory == null) {
                throw new NotFoundServiceEx(
                        "Resource Category not found [id:" + category.getId() + "]");
            }

        } else if (category.getName() != null) {
            Search searchCriteria = new Search(Category.class);
            searchCriteria.addFilterEqual("name", category.getName());

            List<Category> categories = categoryDAO.search(searchCriteria);
            if (categories.isEmpty()) {
                throw new NotFoundServiceEx(
                        "Resource Category not found [name:" + category.getName() + "]");
            }
            loadedCategory = categories.get(0);
        }

        Resource r = new Resource();
        r.setCreation(new Date());
        r.setDescription(resource.getDescription());
        r.setMetadata(resource.getMetadata());
        r.setName(resource.getName());
        r.setCategory(loadedCategory);
        r.setAdvertised(resource.isAdvertised());

        // Extract "owner"/"creator" and "editor" values
        List<SecurityRule> rules = resource.getSecurity();

        if (rules != null) {
            for (SecurityRule securityRule : rules) {
                if ((securityRule.getUser() != null || securityRule.getUsername() != null)
                        && securityRule.isCanWrite()) {
                    final String owner =
                            securityRule.getUser() != null
                                    ? securityRule.getUser().getName()
                                    : securityRule.getUsername();
                    r.setCreator(owner);
                    if (resource.getEditor() != null) {
                        r.setEditor(owner);
                    } else {
                        r.setEditor(resource.getEditor());
                    }
                }
            }
        } else {
            r.setCreator(resource.getCreator());
            r.setEditor(resource.getEditor());
        }

        try {
            resourceDAO.persist(r);
        } catch (DataIntegrityViolationException exc) {
            throw new BadRequestServiceEx(exc.getLocalizedMessage());
        }
        try {
            //
            // Persisting Attributes
            //
            List<Attribute> attributes = resource.getAttribute();
            if (attributes != null) {
                for (Attribute a : attributes) {
                    a.setResource(r);
                    attributeDAO.persist(a);
                }
            }

            //
            // Persisting StoredData
            //
            StoredData data = resource.getData();
            if (data != null) {
                data.setId(r.getId());
                data.setResource(r);
                storedDataDAO.persist(data);

                r.setData(data);
                resourceDAO.merge(r);
            }

            //
            // Persisting SecurityRule
            //
            if (rules != null) {
                for (SecurityRule rule : rules) {
                    rule.setResource(r);
                    securityDAO.persist(rule);
                }
            }

            return r.getId();
        } catch (Exception e) {
            // remove resource if we cannot persist other objects bound to the resource
            // (attributes, data, etc.)
            delete(r.getId());
            throw e;
        }
    }

    /*
     * (non-Javadoc)
     *
     * @see it.geosolutions.geostore.services.ResourceService#update(it.geosolutions.geostore.core.model.Resource)
     */
    @Override
    public long update(Resource resource)
            throws NotFoundServiceEx, DuplicatedResourceNameServiceEx {
        Resource orig = resourceDAO.find(resource.getId());
        if (orig == null) {
            throw new NotFoundServiceEx("Resource not found " + resource.getId());
        }

        validateResourceName(resource, true);

        // reset some server-handled data.
        resource.setCreation(orig.getCreation());
        resource.setLastUpdate(new Date());

        resourceDAO.merge(resource);

        return orig.getId();
    }

    /*
     * (non-Javadoc)
     *
     * @see it.geosolutions.geostore.services.ResourceService#updateAttributes(long, java.util.List)
     */
    @Override
    public void updateAttributes(long id, List<Attribute> attributes) throws NotFoundServiceEx {
        Resource resource = resourceDAO.find(id);
        if (resource == null) {
            throw new NotFoundServiceEx("Resource not found " + id);
        }

        //
        // Removing old attributes
        //
        List<Attribute> oldList = resource.getAttribute();

        if (oldList != null) {
            for (Attribute a : oldList) {
                attributeDAO.removeById(a.getId());
            }
        }

        //
        // Saving old attributes
        //
        for (Attribute a : attributes) {
            a.setResource(resource);
            attributeDAO.persist(a);
        }
    }

    /*
     * Makes sure that no resource with the same name exists in the database;
     * if a conflict is found, the method throws a DuplicatedResourceNameServiceEx
     * exception, putting an alternative, non-conflicting resource name in the exception's message
     */
    private void validateResourceName(Resource resource, boolean isUpdate)
            throws DuplicatedResourceNameServiceEx {
        Resource existentResource = resourceDAO.findByName(resource.getName());
        if (existentResource != null
                && !(isUpdate && existentResource.getId().equals(resource.getId()))) {
            String validResourceName = suggestValidResourceName(resource.getName());

            throw new DuplicatedResourceNameServiceEx(validResourceName);
        }
    }

    /*
     * Utility method containing the logic to determine a valid (i.e. not duplicated) resource name.
     * To do so, the method queries the database in search of resouce names matching the pattern:
     *  	[baseResourceName] - [counter]
     *  The maximum employed counter is then established and a unique resource name following the
     *  aforementioned pattern is constructed.
     */
    private String suggestValidResourceName(String baseResourceName) {
        final String COUNTER_SEPARATOR = " - ";
        final String BASE_PATTERN = baseResourceName + COUNTER_SEPARATOR;

        final String RESOURCE_NAME_LIKE_PATTERN = BASE_PATTERN + "%";
        final Pattern RESOURCE_NAME_REGEX_PATTERN = Pattern.compile(BASE_PATTERN + "(\\d+)");
        int maxCounter = 0, initialCounter = 2;

        List<String> resourceNames =
                resourceDAO.findResourceNamesMatchingPattern(RESOURCE_NAME_LIKE_PATTERN);
        for (String resourceName : resourceNames) {
            Matcher matcher = RESOURCE_NAME_REGEX_PATTERN.matcher(resourceName);
            if (matcher.matches()) {
                String suffix = matcher.group(1);
                int suffixAsInteger = 0;
                try {
                    suffixAsInteger = Integer.valueOf(suffix);
                    if (suffixAsInteger > maxCounter) {
                        maxCounter = suffixAsInteger;
                    }
                } catch (NumberFormatException ex) {
                    // ignore: suffix is NOT an integer
                }
            }
        }

        Integer validCounter = Math.max(maxCounter + 1, initialCounter);
        String validName = BASE_PATTERN + validCounter;

        return validName;
    }

    @Override
    public Resource get(long id) {
        return resourceDAO.find(id);
    }

    @Override
    public Resource getResource(
            long id, boolean includeAttributes, boolean includePermissions, boolean includeTags) {

        Resource resource = resourceDAO.find(id);

        if (resource != null) {
            resource =
                    configResource(
                            resource, includeAttributes, false, includePermissions, includeTags);
        }

        return resource;
    }

    /*
     * (non-Javadoc)
     *
     * @see it.geosolutions.geostore.services.ResourceService#delete(long)
     */
    @Override
    public boolean delete(long id) {
        //
        // data on ancillary tables should be deleted by cascading
        //
        return resourceDAO.removeById(id);
    }

    /*
     * (non-Javadoc)
     *
     * @see it.geosolutions.geostore.services.ResourceService#delete(long)
     */
    @Override
    public void deleteResources(SearchFilter filter)
            throws BadRequestServiceEx, InternalErrorServiceEx {
        Search searchCriteria = SearchConverter.convert(filter);
        this.resourceDAO.removeResources(searchCriteria);
    }

    @Override
    public List<ShortResource> getList(ResourceSearchParameters resourceSearchParameters)
            throws BadRequestServiceEx, InternalErrorServiceEx {

        List<Resource> found = searchResources(resourceSearchParameters);

        return convertToShortResourceList(found, resourceSearchParameters.getAuthUser());
    }

    @Override
    public List<ShortResource> getAll(ResourceSearchParameters resourceSearchParameters)
            throws BadRequestServiceEx, InternalErrorServiceEx {

        List<Resource> found = searchResources(resourceSearchParameters);

        return convertToShortResourceList(found, resourceSearchParameters.getAuthUser());
    }

    /*
     * (non-Javadoc)
     *
     * @see it.geosolutions.geostore.services.ResourceService#getCount(java.lang.String)
     */
    @Override
    public long getCount(String nameLike) {
        Search searchCriteria = new Search(Resource.class);

        if (nameLike != null) {
            searchCriteria.addFilterILike("name", nameLike);
        }

        return resourceDAO.count(searchCriteria);
    }

    /*
     * (non-Javadoc)
     *
     * @see it.geosolutions.geostore.services.ResourceService#getCount(java.lang.String)
     */
    @Override
    public long getCountByFilter(SearchFilter filter)
            throws InternalErrorServiceEx, BadRequestServiceEx {
        Search searchCriteria = SearchConverter.convert(filter);
        return resourceDAO.count(searchCriteria);
    }

    /*
     * (non-Javadoc)
     *
     * @see it.geosolutions.geostore.services.ResourceService#getListAttributes(long)
     */
    @Override
    public List<ShortAttribute> getAttributes(long id) {
        Search searchCriteria = new Search(Attribute.class);
        searchCriteria.addFilterEqual("resource.id", id);

        List<Attribute> attributes = this.attributeDAO.search(searchCriteria);

        return convertToShortAttributeList(attributes);
    }

    /**
     * @param list
     * @return List<ShortAttribute>
     */
    private List<ShortAttribute> convertToShortAttributeList(List<Attribute> list) {
        return list.stream().map(ShortAttribute::new).toList();
    }

    /*
     * (non-Javadoc)
     *
     * @see it.geosolutions.geostore.services.ResourceService#getAttribute(long, java.lang.String)
     */
    @Override
    public ShortAttribute getAttribute(long id, String name) {
        Search searchCriteria = new Search(Attribute.class);
        searchCriteria.addFilterEqual("resource.id", id);
        searchCriteria.addFilterEqual("name", name);
        List<Attribute> attributes = this.attributeDAO.search(searchCriteria);
        List<ShortAttribute> dtoList = convertToShortAttributeList(attributes);

        if (!dtoList.isEmpty()) {
            return dtoList.get(0);
        } else {
            return null;
        }
    }

    /*
     * (non-Javadoc)
     *
     * @see it.geosolutions.geostore.services.ResourceService#updateAttribute(long, java.lang.String, java.lang.String)
     */
    @Override
    public long updateAttribute(long id, String name, String value) throws InternalErrorServiceEx {
        Search searchCriteria = new Search(Attribute.class);
        searchCriteria.addFilterEqual("resource.id", id);
        searchCriteria.addFilterEqual("name", name);

        List<Attribute> attributes = this.attributeDAO.search(searchCriteria);

        Attribute attribute = attributes.get(0);

        switch (attribute.getType()) {
            case DATE:
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS");
                try {
                    attribute.setDateValue(sdf.parse(value));
                } catch (ParseException e) {
                    throw new InternalErrorServiceEx("Error parsing attribute date value");
                }
                break;
            case NUMBER:
                attribute.setNumberValue(Double.valueOf(value));
                break;
            case STRING:
                attribute.setTextValue(value);
                break;
            default:
                throw new IllegalStateException("Unknown type " + attribute.getType());
        }

        attribute = this.attributeDAO.merge(attribute);

        return attribute.getId();
    }

    @Override
    public long insertAttribute(long id, String name, String value, DataType type)
            throws InternalErrorServiceEx {
        Search searchCriteria = new Search(Attribute.class);
        searchCriteria.addFilterEqual("resource.id", id);
        searchCriteria.addFilterEqual("name", name);

        List<Attribute> attributes = this.attributeDAO.search(searchCriteria);
        // if the attribute exist, update id (note: it must have the same type)
        if (!attributes.isEmpty()) {
            Attribute attribute = attributes.get(0);
            switch (attribute.getType()) {
                case DATE:
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS");
                    try {
                        attribute.setDateValue(sdf.parse(value));
                    } catch (ParseException e) {
                        throw new InternalErrorServiceEx("Error parsing attribute date value");
                    }
                    break;
                case NUMBER:
                    attribute.setNumberValue(Double.valueOf(value));
                    break;
                case STRING:
                    attribute.setTextValue(value);
                    break;
                default:
                    throw new IllegalStateException("Unknown type " + attribute.getType());
            }

            attribute = this.attributeDAO.merge(attribute);

            return attribute.getId();
        } else {
            // create the new attribute
            Attribute attribute = new Attribute();
            attribute.setType(type);
            attribute.setName(name);
            attribute.setResource(resourceDAO.find(id));

            switch (type) {
                case DATE:
                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS");
                    try {
                        attribute.setDateValue(sdf.parse(value));
                    } catch (ParseException e) {
                        throw new InternalErrorServiceEx("Error parsing attribute date value");
                    }
                    break;
                case NUMBER:
                    attribute.setNumberValue(Double.valueOf(value));
                    break;
                case STRING:
                    attribute.setTextValue(value);
                    break;
                default:
                    throw new IllegalStateException("Unknown type " + attribute.getType());
            }

            return this.attributeDAO.merge(attribute).getId();
        }
    }

    public List<Resource> getResources(ResourceSearchParameters resourceSearchParameters)
            throws BadRequestServiceEx, InternalErrorServiceEx {
        return this.configResourceList(
                searchResources(resourceSearchParameters),
                resourceSearchParameters.isIncludeAttributes(),
                resourceSearchParameters.isIncludeData(),
                resourceSearchParameters.isIncludeTags());
    }

    /**
     * @param resources
     * @param includeAttributes
     * @param includeData
     * @return List<Resource>
     */
    private List<Resource> configResourceList(
            List<Resource> resources,
            boolean includeAttributes,
            boolean includeData,
            boolean includeTags) {
        return resources.stream()
                .map(r -> configResource(r, includeAttributes, includeData, false, includeTags))
                .toList();
    }

    private Resource configResource(
            Resource resource,
            boolean includeAttributes,
            boolean includeData,
            boolean includePermissions,
            boolean includeTags) {

        Resource configuredResource = new Resource();

        configuredResource.setCategory(resource.getCategory());
        configuredResource.setCreation(resource.getCreation());
        configuredResource.setDescription(resource.getDescription());
        configuredResource.setAdvertised(resource.isAdvertised());
        configuredResource.setId(resource.getId());
        configuredResource.setLastUpdate(resource.getLastUpdate());
        configuredResource.setName(resource.getName());
        configuredResource.setCreator(resource.getCreator());
        configuredResource.setEditor(resource.getEditor());

        if (includeData) {
            // explicit fetch as Resource.data is a lazy proxy
            configuredResource.setData(storedDataDAO.find(resource.getId()));
        }

        if (includeAttributes) {
            configuredResource.setAttribute(resource.getAttribute());
        }

        if (includePermissions) {
            configuredResource.setSecurity(getSecurityRules(resource.getId()));
        }

        if (includeTags) {
            configuredResource.setTags(resource.getTags());
        }

        return configuredResource;
    }

    @Override
    public List<ShortResource> getShortResources(ResourceSearchParameters resourceSearchParameters)
            throws BadRequestServiceEx, InternalErrorServiceEx {

        List<Resource> resources = searchResources(resourceSearchParameters);

        return convertToShortResourceList(resources, resourceSearchParameters.getAuthUser());
    }

    private List<Resource> searchResources(ResourceSearchParameters parameters)
            throws BadRequestServiceEx, InternalErrorServiceEx {

        if (((parameters.getPage() != null) && (parameters.getEntries() == null))
                || ((parameters.getPage() == null) && (parameters.getEntries() != null))) {
            throw new BadRequestServiceEx("Page and entries params should be declared together");
        }

        Search searchCriteria = SearchConverter.convert(parameters.getFilter());

        if (parameters.getPage() != null) {
            searchCriteria.setMaxResults(parameters.getEntries());
            searchCriteria.setPage(parameters.getPage());
        }

        if (parameters.getSortBy() != null && !parameters.getSortBy().isBlank()) {
            searchCriteria.addSort(
                    parameters.getSortBy(), "DESC".equalsIgnoreCase(parameters.getSortOrder()));
        }

        if (parameters.getNameLike() != null) {
            searchCriteria.addFilterILike("name", parameters.getNameLike());
        }

        if (parameters.isFavoritesOnly()) {
            Long userId = parameters.getAuthUser().getId();
            String userName = parameters.getAuthUser().getName();
            searchCriteria.addFilterSome(
                    "favorites",
                    Filter.or(Filter.equal("user.id", userId), Filter.equal("username", userName)));
        }

        searchCriteria.addFetches("security", "security.ipRanges");
        searchCriteria.setDistinct(true);

        securityDAO.addSecurityConstraintsToSearch(searchCriteria, parameters.getAuthUser());
        return this.search(searchCriteria);
    }

    /**
     * @param resources
     * @param user
     * @return List<ShortResource>
     */
    private List<ShortResource> convertToShortResourceList(List<Resource> resources, User user) {
        return resources.stream().map(r -> createShortResource(user, r)).toList();
    }

    private ShortResource createShortResource(User user, Resource resource) {
        ShortResource shortResource = new ShortResource(resource);

        if (user != null && resourcePermissionService.canResourceBeWrittenByUser(resource, user)) {
            shortResource.setCanEdit(true);
            shortResource.setCanDelete(true);
            shortResource.setCanCopy(true);
        }

        return shortResource;
    }

    @Override
    public List<Resource> getResourcesFull(ResourceSearchParameters resourceSearchParameters)
            throws BadRequestServiceEx, InternalErrorServiceEx {

        Search searchCriteria = SearchConverter.convert(resourceSearchParameters.getFilter());
        searchCriteria.setDistinct(true);
        searchCriteria.addFetch("security");
        searchCriteria.addFetch("data");
        searchCriteria.addFetch("favorites");

        securityDAO.addReadSecurityConstraints(
                searchCriteria, resourceSearchParameters.getAuthUser());
        return this.search(searchCriteria);
    }

    /**
     * Internal method to apply default search options and search
     *
     * @param searchCriteria search criteria
     * @return results of the search
     */
    private List<Resource> search(Search searchCriteria) throws BadRequestServiceEx {
        try {
            // apply defaults for sorting if not already set
            if (searchCriteria != null && searchCriteria.getSorts().isEmpty()) {
                searchCriteria.addSort(new Sort("name"));
            }

            // search
            return resourceDAO.search(searchCriteria);
        } catch (IllegalArgumentException iaex) {
            throw new BadRequestServiceEx("Resource search failed", iaex);
        }
    }

    /*
     * (non-Javadoc)
     * @see it.geosolutions.geostore.services.SecurityService#getUserSecurityRule(java.lang.String, long)
     */
    @Override
    public List<SecurityRule> getUserSecurityRule(String userName, long resourceId) {
        return securityDAO.findUserSecurityRule(userName, resourceId);
    }

    /* (non-Javadoc)
     * @see it.geosolutions.geostore.services.SecurityService#getGroupSecurityRule(java.lang.String, long)
     */
    @Override
    public List<SecurityRule> getGroupSecurityRule(List<String> groupNames, long resourceId) {
        return securityDAO.findGroupSecurityRule(groupNames, resourceId);
    }

    @Override
    public List<SecurityRule> getSecurityRules(long id) {
        return securityDAO.findResourceSecurityRules(id);
    }

    @Override
    public void updateSecurityRules(long id, List<SecurityRule> rules)
            throws InternalErrorServiceEx, NotFoundServiceEx {
        Resource resource = resourceDAO.find(id);

        if (resource != null) {
            Search searchCriteria = new Search();
            searchCriteria.addFilterEqual("resource.id", id);

            List<SecurityRule> resourceActualRules = this.securityDAO.search(searchCriteria);

            // remove previous rules
            resourceActualRules.forEach(rule -> securityDAO.remove(rule));

            // insert new rules
            for (SecurityRule rule : rules) {
                rule.setResource(resource);

                if (rule.getGroup() != null) {
                    UserGroup ug = userGroupDAO.find(rule.getGroup().getId());
                    if (ug != null) {
                        rule.setGroup(ug);
                    }
                }

                if (rule.getIpRanges() != null) {
                    rule.setIpRanges(fetchRuleIPRanges(rule));
                }

                securityDAO.persist(rule);
            }
        } else {
            throw new NotFoundServiceEx("Resource not found " + id);
        }
    }

    private Set<IPRange> fetchRuleIPRanges(SecurityRule rule) {
        return rule.getIpRanges().stream()
                .map(this::fetchIPRange)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toSet());
    }

    private Optional<IPRange> fetchIPRange(IPRange ipRange) {
        return Optional.ofNullable(ipRangeDAO.find(ipRange.getId()));
    }

    @Override
    public long count(SearchFilter filter, User user)
            throws BadRequestServiceEx, InternalErrorServiceEx {
        return count(filter, user, false);
    }

    @Override
    public long count(SearchFilter filter, User user, boolean favoritesOnly)
            throws BadRequestServiceEx, InternalErrorServiceEx {

        Search searchCriteria = SearchConverter.convert(filter);
        searchCriteria.setDistinct(true);

        if (favoritesOnly) {
            searchCriteria.addFilterSome(
                    "favorites",
                    Filter.or(
                            Filter.equal("user.id", user.getId()),
                            Filter.equal("username", user.getName())));
        }

        securityDAO.addSecurityConstraintsToSearch(searchCriteria, user);
        return resourceDAO.count(searchCriteria);
    }

    @Override
    public long count(String nameLike, User user) {

        Search searchCriteria = new Search(Resource.class);

        if (nameLike != null) {
            searchCriteria.addFilterILike("name", nameLike);
        }

        securityDAO.addSecurityConstraintsToSearch(searchCriteria, user);

        return resourceDAO.count(searchCriteria);
    }

    @Override
    public void fetchSecurityRules(Resource resource) {
        if (resource == null || resource.getId() == null) {
            return;
        }

        resource.setSecurity(securityDAO.findResourceSecurityRules(resource.getId()));
    }

    @Override
    public void fetchFavorites(Resource resource) {
        if (resource == null || resource.getId() == null) {
            return;
        }

        resource.setFavorites(new HashSet<>(userFavoriteDAO.findByResourceId(resource.getId())));
    }
}
