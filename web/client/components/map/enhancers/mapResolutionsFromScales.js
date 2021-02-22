
/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

const mapResolutionsFromScales = ({ component: Component, ...props }) => {

    console.log('mapResolutionsFromScales');
    console.log(Component);
    console.log('props');
    console.log(props);

    return () => {
        return <Component {...props} />;
    };


};

export default mapResolutionsFromScales;
