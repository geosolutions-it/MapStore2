/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { useCallback, useEffect, useState } from 'react';

import getPluginsConfig from '../../../observables/config/getPluginsConfig';
import useIsMounted from '../../../hooks/useIsMounted';

// The plugins catalog lists every uploaded extension with the plugin entry of its index.json.
const toExtension = ({ name, title, description, version, hidden }) => ({
    name,
    title: title || name,
    description: description || '',
    version: version || '',
    hidden: !!hidden
});

/**
 * Reads the installed extensions from the plugins catalog of the context creator.
 * @returns {object} `{ extensions, loading, error, reload }`
 */
const useInstalledExtensions = () => {
    const isMounted = useIsMounted();
    const [extensions, setExtensions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const reload = useCallback(() => {
        setLoading(true);
        setError(null);
        return getPluginsConfig()
            .then(config => isMounted(() => {
                setExtensions((config?.plugins || []).filter(plugin => plugin.extension).map(toExtension));
                setLoading(false);
            }))
            .catch(e => isMounted(() => {
                setError(e);
                setLoading(false);
            }));
    }, []);

    useEffect(() => {
        reload();
    }, [reload]);

    return { extensions, loading, error, reload };
};

export default useInstalledExtensions;
