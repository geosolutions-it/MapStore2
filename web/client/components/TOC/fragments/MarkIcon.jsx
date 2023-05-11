/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { getWellKnownNameImageFromSymbolizer } from '../../../utils/styleparser/StyleParserUtils';

function MarkIcon({ symbolizer }) {
    const [iconData, setIconData] = useState(null);
    const isMounted = useRef();

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        getWellKnownNameImageFromSymbolizer(symbolizer)
            .then((data) => {
                if (isMounted.current) {
                    setIconData(data);
                }
            });
    }, [symbolizer]);

    const { rotate, opacity } = symbolizer;
    const svgStyle = { transform: `rotate(${rotate}deg)`, opacity };
    return (<svg viewBox="0 0 50 50" style={svgStyle}>
        {iconData && <image href={iconData.src} height="50" width="50" />}
    </svg>);
}

MarkIcon.propTypes = {
    symbolizer: PropTypes.object
};

export default MarkIcon;
