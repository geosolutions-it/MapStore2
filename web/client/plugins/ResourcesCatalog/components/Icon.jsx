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
import useIsMounted from '../../../hooks/useIsMounted';
import PropTypes from 'prop-types';

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
/**
 * Icon component that allows to use icon from `font-awesome` and `glyphicon`
 * @prop {string} glyph html identifier
 * @prop {string} type one of `font-awesome` or `glyphicon`
 */
function Icon({
    glyph,
    type,
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

Icon.propTypes = {
    glyph: PropTypes.string,
    type: PropTypes.string
};

Icon.defaultProps = {
    type: 'font-awesome'
};

export default Icon;
