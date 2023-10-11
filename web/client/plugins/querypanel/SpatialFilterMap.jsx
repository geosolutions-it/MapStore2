import React from 'react';
import MapComponent from './MapComp';
export default ({useEmbeddedMap, ...props}) =>
    useEmbeddedMap ?
        (<div className="mapstore-query-map">
            <MapComponent {...props}/>
        </div>)
        : null;

