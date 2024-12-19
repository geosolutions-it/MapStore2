/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, useRef, useState } from 'react';
import useIsMounted from './useIsMounted';

const fieldsContainFacets = (fields) => {
    return fields.some(field => field.items ? fieldsContainFacets(field.items) : !!field.facet);
};

const useFilterFacets = ({
    query,
    fields,
    request,
    customFilters = []
}) => {

    const [updated, setUpdated] = useState(fields);
    const requestFacets = useRef();
    const containsFacets = fieldsContainFacets(fields);
    const isMounted = useIsMounted();

    requestFacets.current = () => {
        if (containsFacets) {
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
    }, [containsFacets]);

    return {
        fields: containsFacets ? updated : fields
    };
};

export default useFilterFacets;
