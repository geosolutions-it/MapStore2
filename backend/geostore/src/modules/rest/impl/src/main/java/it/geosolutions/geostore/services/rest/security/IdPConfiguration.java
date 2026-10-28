package it.geosolutions.geostore.services.rest.security;

import it.geosolutions.geostore.core.model.enums.Role;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.BeanNameAware;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Base configuration class for authentication mechanisms that rely on external Identity providers.
 */
public abstract class IdPConfiguration implements BeanNameAware {

    protected String beanName;

    protected boolean enabled = false;

    protected boolean autoCreateUser;

    protected String internalRedirectUri;

    protected String redirectUri;

    protected Role authenticatedDefaultRole;

    protected List<String> defaultGroups = Collections.emptyList();

    /**
     * @return true if the filter to which this configuration object refers is enabled. False
     *     otherwise.
     */
    public boolean isEnabled() {
        return enabled;
    }

    /**
     * Set the enabled flag.
     *
     * @param enabled true to enable the filter to which this configuration refers.
     */
    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    /**
     * @return true if the logged-in user should be created on the db if not present. False
     *     otherwise.
     */
    public boolean isAutoCreateUser() {
        return autoCreateUser;
    }

    /**
     * Set the autocreate user flag.
     *
     * @param autoCreateUser the autoCreateUser flag.
     */
    public void setAutoCreateUser(Boolean autoCreateUser) {
        this.autoCreateUser = autoCreateUser;
    }

    public void setAutoCreateUser(boolean autoCreateUser) {
        this.autoCreateUser = autoCreateUser;
    }

    /**
     * Return the bean name of this configuration object.
     *
     * @return the bean name.
     */
    public String getBeanName() {
        return beanName;
    }

    @Override
    public void setBeanName(String s) {
        this.beanName = s;
    }

    /**
     * @return The internal redirect uri: the endpoint to which the client is redirected after the
     *     callback endpoint is invoked.
     */
    public String getInternalRedirectUri() {
        return internalRedirectUri;
    }

    /**
     * Set the internalRedirectUri.
     *
     * @param internalRedirectUri the internal redirect URI.
     */
    public void setInternalRedirectUri(String internalRedirectUri) {
        this.internalRedirectUri = internalRedirectUri;
    }

    /**
     * @return the redirect URI.
     */
    public String getRedirectUri() {
        return redirectUri;
    }

    /**
     * Set the redirect URI.
     *
     * @param redirectUri the redirect URI.
     */
    public void setRedirectUri(String redirectUri) {
        this.redirectUri = redirectUri;
    }

    public Role getAuthenticatedDefaultRole() {
        if (authenticatedDefaultRole == null) return Role.USER;
        return authenticatedDefaultRole;
    }

    public void setAuthenticatedDefaultRole(String authenticatedDefaultRole) {
        if (StringUtils.isNotBlank(authenticatedDefaultRole))
            this.authenticatedDefaultRole = Role.valueOf(authenticatedDefaultRole);
    }

    /**
     * Optional groups always assigned to the authenticated user, in addition to the ones derived
     * from the IdP claims. They are not subject to groupMappings/dropUnmapped and are created on
     * the fly when they do not exist.
     *
     * @return the configured default group names; never null, empty when not configured.
     */
    public List<String> getDefaultGroups() {
        return defaultGroups;
    }

    /**
     * @param defaultGroups comma-separated list of group names; blank entries are discarded.
     */
    public void setDefaultGroups(String defaultGroups) {
        if (StringUtils.isBlank(defaultGroups)) {
            this.defaultGroups = Collections.emptyList();
            return;
        }
        List<String> parsed = new ArrayList<>();
        for (String name : defaultGroups.split(",")) {
            String trimmed = name.trim();
            if (!trimmed.isEmpty()) {
                parsed.add(trimmed);
            }
        }
        this.defaultGroups = parsed;
    }
}
