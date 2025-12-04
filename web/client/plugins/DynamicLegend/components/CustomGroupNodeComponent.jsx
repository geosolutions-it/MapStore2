/*
* Copyright 2025, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import DefaultGroup from '../../TOC/components/DefaultGroup';

/**
 * Custom group node component wrapper.
 * Avoids unnecessary remounting of group nodes.
 *
 * @param {Object} props - Properties passed to the group component.
 * @returns {JSX.Element}
 */
const CustomGroupNodeComponent = props => {
    return (
        <DefaultGroup {...props} />
    );
};

export default CustomGroupNodeComponent;
