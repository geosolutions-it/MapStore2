/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import ResizableModal from '../../misc/ResizableModal';
import Portal from '../../misc/Portal';
import Message from '../../I18N/Message';
import { Glyphicon } from 'react-bootstrap';

/**
 * Component for rendering lat and lng of the current selected point
 * @memberof components.data.identify
 * @name GeocodeViewer
 * @class
 * @prop {bool} enableRevGeocode enable/disable the component
 * @prop {function} hideRevGeocode called when click on close buttons
 * @prop {bool} showModalReverse show/hide modal
 * @prop {node} revGeocodeDisplayName text/info displayed on modal
 */

export default ({latlng, enableRevGeocode, hideRevGeocode = () => {}, showModalReverse, revGeocodeDisplayName}) => {
    return enableRevGeocode && latlng ? (
        <Portal>
            <ResizableModal
                fade
                title={<span><Glyphicon glyph="map-marker"/>&nbsp;<Message msgId="identifyRevGeocodeModalTitle" /></span>}
                size="xs"
                show={showModalReverse}
                onClose={hideRevGeocode}
                buttons={[{
                    text: <Message msgId="close"/>,
                    onClick: hideRevGeocode,
                    bsStyle: 'primary'
                }]}>
                <div className="ms-alert" style={{padding: 15}}>
                    <div className="ms-alert-center text-center">
                        <div>{revGeocodeDisplayName}</div>
                    </div>
                </div>
            </ResizableModal>
        </Portal>
    ) : null;
};
