/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import React from 'react';
import classnames from 'classnames';

import HTML from '../../components/I18N/HTML';

import {getLayerTitle} from "../../utils/LayersUtils";

const HelpInfo = ({
    currentLocale,
    dataSourceMode,
    isSupportedLayer,
    messages,
    selectedLayer
}) => {
    if (dataSourceMode && dataSourceMode !== 'import') {
        let layerTitle = messages?.longitudinalProfile?.help?.noLayer;
        if (selectedLayer) {
            layerTitle = isSupportedLayer ? getLayerTitle(selectedLayer, currentLocale) : messages?.longitudinalProfile?.help?.notSupportedLayer;
        }

        return dataSourceMode !== "idle" ? (
            <div className={classnames({
                'longitude-help': true
            })}>
                <HTML msgId={`longitudinalProfile.help.${dataSourceMode}`}
                    msgParams={{layerName: layerTitle}}/>
            </div>
        ) : null;
    }
    return null;

};

export default HelpInfo;
