/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import RowViewer from './row/RowViewer';

export default ({response, layer, rowViewer}) => {
    return (
        <div className="mapstore-json-viewer">
            {(response?.features || []).map((feature, i) => {
                return <RowViewer key={i} feature={feature} layer={layer} component={rowViewer}/>;
            })}
        </div>
    );
};
