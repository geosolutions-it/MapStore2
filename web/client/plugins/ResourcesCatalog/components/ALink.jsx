/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Text from '../../../components/layout/Text';

const EllipsisText = ({ children, maxWidth = 145, ...props }) => (
    <Text
        {...props}
        title={children}
        ellipsis
        style={{ maxWidth }}
    >
        {children}
    </Text>
);
function ALink({ href, readOnly, children, fallbackComponent, ...props }) {
    const FallbackComponent = fallbackComponent || EllipsisText;
    return readOnly || !href ? <FallbackComponent {...props}>{children}</FallbackComponent> : <a href={href} {...props}>{children}</a>;
}

ALink.propTypes = {
    href: PropTypes.string,
    readOnly: PropTypes.bool.isRequired,
    children: PropTypes.any
};

ALink.defaultProps = {
    href: '',
    readOnly: false
};

export default ALink;
