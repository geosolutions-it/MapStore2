/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React, { useEffect, useState } from 'react';

/**
 * InlineLoader for the layer or group node component
 * @prop {boolean} loading if true show the loader
 */
const InlineLoader = ({ loading: loadingProp }) => {

    const [loading, setLoading] = useState(loadingProp);
    useEffect(() => {
        let timeout = setTimeout(() => {
            setLoading(loadingProp);
            // add debounce time to avoid flickering
        }, loadingProp ? 0 : 2000);
        return () => {
            clearTimeout(timeout);
        };
    }, [loadingProp]);

    return (
        <div className="inline-loader-container">
            <div className="inline-loader-bar" style={{ display: loading ? 'block' : 'none' }} />
        </div>
    );
};

export default InlineLoader;
