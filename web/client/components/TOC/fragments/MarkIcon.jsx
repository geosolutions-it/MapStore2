/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getWellKnownNameImageFromSymbolizer } from '../../../utils/VectorStyleUtils';

function MarkIcon({ symbolizer }) {
    const [iconData, setIconData] = useState(null);
    useEffect(() => {
        if (!symbolizer) {
            return;
        }
        async function getIconData() {
            const data = await getWellKnownNameImageFromSymbolizer(symbolizer);
            setIconData(data);
        }
        getIconData();
    }, [symbolizer]);

    const { rotate, opacity } = symbolizer;
    const svgStyle = { transform: `rotate(${rotate}deg)`, opacity };
    return (<svg width="21" height="21" viewBox="0 0 50 50" style={svgStyle}>
        {iconData && <image href={iconData.src} height="50" width="50" />}
    </svg>);
}

MarkIcon.PropTypes = {
    symbolizer: PropTypes.object
};

export default MarkIcon;
