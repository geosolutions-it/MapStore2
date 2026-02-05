import React from 'react';
import MapViewerLayoutComponent from '../components/layout/MapViewerLayout';
import { updateMapLayout } from '../actions/maplayout';
import { connect } from 'react-redux';

const MapViewerLayout = (props) => {
    const handleContentResize = (changed) => {
        if (changed.bottom !== undefined) {
            const bottomOffset = Math.max(0, changed.bottom - 35);
            const {boundingMapRect, layout, boundingSidebarRect} = props.mapLayout;

            props.onContentResize({
                ...layout,
                ...boundingSidebarRect,
                boundingMapRect: {
                    ...boundingMapRect,
                    bottom: bottomOffset
                }
            });
        }
    };
    return <MapViewerLayoutComponent {...props} onResize={handleContentResize} />;
};

export default connect((state) => ({
    mapLayout: state.maplayout
}), { onContentResize: updateMapLayout })(MapViewerLayout);
