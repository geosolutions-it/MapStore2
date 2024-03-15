
import React, { useEffect, useState } from 'react';
import { getSimpleStatistics, createClassifyGeoJSONSync } from '../../api/GeoJSONClassification';

let classifyGeoJSONSync;
/**
 * withClassifyGeoJSONSync. HOC that load simple statistics library
 * and pass the createClassifyGeoJSONSync function as prop to the WrappedComponent
 */
const withClassifyGeoJSONSync = (WrappedComponent) => {
    function WithClassifyGeoJSONSync(props) {
        const [, setUpdate] = useState(false);
        useEffect(() => {
            let ignore = false;
            if (!classifyGeoJSONSync) {
                getSimpleStatistics().then((mod) => {
                    classifyGeoJSONSync = createClassifyGeoJSONSync(mod);
                    if (!ignore) { setUpdate(true); }
                });
            }
            return () => { ignore = true; };
        }, []);
        return <WrappedComponent {...props} classifyGeoJSONSync={classifyGeoJSONSync}/>;
    }
    return WithClassifyGeoJSONSync;
};

export default withClassifyGeoJSONSync;
