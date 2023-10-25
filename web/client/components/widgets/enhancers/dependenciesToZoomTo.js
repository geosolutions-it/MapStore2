/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useEffect, memo } from 'react';

const dependenciesToZoomTo = (WrappedComponent)=>{
    function DependenciesToZoomTo(props) {
        let tblWidgetWithExtentObj = props.widgets.find(i=>i?.dependencies?.extentObj);
        const extentObj = tblWidgetWithExtentObj?.dependencies?.extentObj;
        let mapWidget = props?.widgets?.find(i=>tblWidgetWithExtentObj?.dependenciesMap?.mapSync.includes(i.id));
        useEffect(()=>{
            if ( extentObj && mapWidget ) {
                let connectedMap = mapWidget?.maps.find(i=>i.mapStateSource === mapWidget.id);
                let zoomToExtentHandler = connectedMap?.zoomToExtentHandler;
                if (zoomToExtentHandler) {
                    // trigger "internal" zoom to extent
                    zoomToExtentHandler(extentObj.extent, {
                        crs: extentObj.crs, maxZoom: extentObj.maxZoom
                    });
                    // remove extentObj from state
                    props?.updateProperty(tblWidgetWithExtentObj.id, `dependencies.extentObj`, undefined);
                }
            }

        }, [extentObj?.extent?.join(",")]);
        return <WrappedComponent { ...props } />;
    }
    return memo(DependenciesToZoomTo);
};
export default dependenciesToZoomTo;
