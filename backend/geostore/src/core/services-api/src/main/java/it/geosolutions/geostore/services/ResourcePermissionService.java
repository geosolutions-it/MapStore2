package it.geosolutions.geostore.services;

import it.geosolutions.geostore.core.model.Resource;
import it.geosolutions.geostore.core.model.User;

public interface ResourcePermissionService {

    /**
     * Verifies whether the user or any of its groups is the owner of the resource and has read
     * permissions on it.
     *
     * <p>Be aware to fetch the resource security rules prior to call this method.
     *
     * @param resource
     * @param user
     * @return <code>true</code> if the resource can be read by the user, <code>false</code>
     *     otherwise
     * @throws IllegalArgumentException if the resource security rules have not been initialized
     *     properly
     */
    boolean canResourceBeReadByUser(Resource resource, User user);

    /**
     * Verifies whether the user or any of its groups is the owner of the resource and has write
     * permissions on it.
     *
     * <p>GUEST users can not access to the delete and edit (resource, data blob is editable)
     * services, so only admins and authenticated users with write permissions can.
     *
     * <p>Be aware to fetch the resource security rules prior to call this method.
     *
     * @param resource
     * @param user
     * @return <code>true</code> if the resource can be written by the user, <code>false</code>
     *     otherwise
     * @throws IllegalArgumentException if the resource security rules have not been initialized
     *     properly
     */
    boolean canResourceBeWrittenByUser(Resource resource, User user);
}
