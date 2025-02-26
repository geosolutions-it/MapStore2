/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, useRef, useState } from 'react';
import useIsMounted from '../../../hooks/useIsMounted';

const fieldsContainFacets = (fields) => {
    return fields.some(field => field.items ? fieldsContainFacets(field.items) : !!field.facet);
};

/**
 * menage facet for the filter form fields
 * @param {object} props.query filters query object
 * @param {object[]} props.fields list of filter input fields
 * @param {func} props.request function that return the facets request
 * @param {bool} props.visible if true the request will be triggered
 * @param {array} dependencies list of dependencies to trigger the facet request
 * @return {object} { fields }
 */
const useFilterFacets = ({
    query,
    fields,
    request,
    customFilters = [],
    visible
}, dependencies = []) => {

    const [updated, setUpdated] = useState(fields);
    const requestFacets = useRef();
    const containsFacets = fieldsContainFacets(fields);
    const isMounted = useIsMounted();

    requestFacets.current = () => {
        if (visible && containsFacets) {
            request({
                query,
                fields,
                customFilters
            })
                .then((response) => isMounted(() => {
                    setUpdated(response?.fields || []);
                }));
        }
    };

    useEffect(() => {
        requestFacets.current();
    }, [visible, JSON.stringify(query), containsFacets, ...dependencies]);
    return {
        fields: containsFacets ? updated : fields
    };
};

export default useFilterFacets;
