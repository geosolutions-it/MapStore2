/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import Loader from '../../../components/misc/Loader';

const CatalogLoadingView = ({ message = "Loading..." }) => {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%'
        }}>
            <Loader size={70} />
        </div>
    );
};

export default CatalogLoadingView;
