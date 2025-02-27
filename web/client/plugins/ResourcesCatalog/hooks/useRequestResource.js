/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, useState, useRef } from 'react';
import axios from '../../../libs/ajax';
import useIsMounted from '../../../hooks/useIsMounted';
/**
 * contains all the logic to update the resource in the homepage details panel
 * @param {object} props.user user properties
 * @param {string} props.resourceId identifier of the resource
 * @param {object} props.resource resource properties
 * @param {func} props.setRequest it return a promise to perform the setup request
 * @param {func} props.updateRequest it return a promise to perform the update request
 * @param {func} props.onSetStart callback triggered on setup request initialization
 * @param {func} props.onSetSuccess callback triggered on setup request success
 * @param {func} props.onSetError callback triggered on setup request error
 * @param {func} props.onUpdateStart callback triggered on update request initialization
 * @param {func} props.onUpdateSuccess callback triggered on update request success
 * @param {func} props.onUpdateError callback triggered on update request error
 * @return {object} { resource, loading, update }
 */
const useRequestResource = ({
    user,
    resourceId,
    resource,
    setRequest,
    updateRequest,
    onSetStart = () => {},
    onSetSuccess = () => {},
    onSetError = () => {},
    onUpdateStart = () => {},
    onUpdateSuccess = () => {},
    onUpdateError = () => {}
}) => {

    const [updating, setUpdating] = useState();
    const [loading, setLoading] = useState(false);

    const requestResource = useRef();
    const requestTimeout = useRef();
    const source = useRef();

    const isMounted = useIsMounted();

    const createToken = () => {
        if (source.current) {
            source.current?.cancel();
            source.current = undefined;
        }
        const cancelToken = axios.CancelToken;
        source.current = cancelToken.source();
    };

    requestResource.current = (isUpdate) => {
        if (requestTimeout.current) {
            clearTimeout(requestTimeout.current);
            requestTimeout.current = undefined;
        }
        createToken();
        setLoading(true);
        onSetStart();
        requestTimeout.current = setTimeout(() => {
            setRequest({
                user,
                resource,
                config: {
                    cancelToken: source.current.token
                }
            })
                .then((updatedResource) => isMounted(() => {
                    onSetSuccess(updatedResource, isUpdate);
                }))
                .catch((e) => isMounted(() => {
                    if (!axios.isCancel(e)) {
                        onSetError(e);
                    }
                }))
                .finally(() => isMounted(() => {
                    setLoading(false);
                }));
        }, 300);
    };

    const resourceCanEdit = resource?.canEdit;
    useEffect(() => {
        if (resourceId && resourceCanEdit === undefined) {
            requestResource.current();
        }
    }, [resourceId, resourceCanEdit]);

    return {
        resource,
        loading,
        update: (newResource) => {
            if (!updating) {
                setUpdating(true);
                onUpdateStart();
                const promise = updateRequest(newResource);
                (promise?.toPromise
                    ? promise.toPromise()
                    : promise)
                    .then(() => isMounted(() => {
                        requestResource.current(true);
                        onUpdateSuccess();
                    }))
                    .catch(err => isMounted(() => {
                        onUpdateError(err);
                    }))
                    .finally(() => isMounted(() => setUpdating(false)));
            }
        }
    };
};

export default useRequestResource;

