/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Loader from '../../misc/Loader';

const FeatureEditorFallback = () => {
    return (
        <div className="feature-editor-fallback-container">
            <Loader size={100} style={{ margin: '0 auto' }} />
        </div>
    );
};

export default FeatureEditorFallback;
