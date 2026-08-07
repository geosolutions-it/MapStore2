/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import RowViewer from './row/RowViewer';
import { getVisibleFeatureRow } from '../../../../utils/IdentifyUtils';

export default ({response, layer, rowViewer}) => {
    const fields = Array.isArray(layer?.featureInfo?.attributes)
        ? layer.featureInfo.attributes
        : layer?.fields;
    return (
        <div className="mapstore-json-viewer">
            {(response?.features || []).map((feature, i) => {
                const row = getVisibleFeatureRow(feature, fields);
                return (
                    <RowViewer
                        key={i}
                        feature={row.feature}
                        layer={{...(layer || {}), fields: row.fields}}
                        component={rowViewer}/>
                );
            })}
        </div>
    );
};
