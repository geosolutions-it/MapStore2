/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import {useEffect, useRef, useState} from "react";

/**
 * Return a map tool given the map type and tool name
 * @param  {string} mapType map type one of openlayers, leaflet or cesium
 * @param  {string} tool map tool name
 */
const useMapTool = (mapType, tool) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(null);
    const impl = useRef();
    useEffect(() => {
        if (mapType && !impl.current) {
            setLoaded(false);
            setError(null);
            import("../" + mapType + "/" + tool)
                .then(toolImpl => {
                    impl.current = toolImpl.default;
                    setLoaded(true);
                })
                .catch((e) => {
                    setError(e);
                });
        }
        return () => {};
    }, [ mapType ]);
    return [loaded, impl.current, error];
};

export default useMapTool;

