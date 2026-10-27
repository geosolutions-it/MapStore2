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
import { getExtensionInfo } from '../../../utils/ExtensionsUtils';

// The plugins catalog lists every uploaded extension with the first plugin entry of its index.json.
// Extensions installed by older versions have no `extensionInfo`: their plugin entry describes them.
const toExtension = (plugin) => {
    const info = plugin.extensionInfo || getExtensionInfo({ plugins: [plugin] });
    return {
        name: plugin.name,
        title: info.title || plugin.name,
        description: info.description || '',
        version: info.version || '',
        plugins: info.plugins || [],
        hidden: !!plugin.hidden
    };
};

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
