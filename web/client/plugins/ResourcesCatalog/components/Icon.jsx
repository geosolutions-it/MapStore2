/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect } from 'react';
import { Glyphicon } from 'react-bootstrap';
import { loadFontAwesome } from '../../../utils/FontUtils';
import useIsMounted from '../hooks/useIsMounted';

function FaIcon({
    name,
    className,
    style
}) {
    const [loading, setLoading] = useState(true);
    const isMounted = useIsMounted();
    useEffect(() => {
        loadFontAwesome()
            .then(() => {
                isMounted(() => {
                    setLoading(false);
                });
            });
    }, []);
    if (loading) {
        return null;
    }
    return <i className={`fa fa-${name}${className ? ` ${className}` : ''}`} style={style}/>;
}

function Icon({
    glyph,
    type = 'font-awesome',
    ...props
}) {
    if (type === 'font-awesome') {
        return <FaIcon {...props} name={glyph} />;
    }
    if (type === 'glyphicon') {
        return <Glyphicon {...props} glyph={glyph} />;
    }
    return null;
}

Icon.defaultProps = {};

export default Icon;
