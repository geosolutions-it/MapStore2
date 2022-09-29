/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { mapLayoutValuesSelector } from '../../../selectors/maplayout';
import Loader from '../../misc/Loader';

const FeatureEditorFallback = ({ size, dockStyle }) => {
    const containerStyle = useMemo(() => {
        return { height: `${size * 100}%`, ...dockStyle };
    }, [size, dockStyle]);
    return (
        <div className="feature-editor-fallback-container" style={containerStyle}>
            <Loader size={100} style={{ margin: '0 auto' }} />
        </div>
    );
};

export default connect(createSelector(
    state => state?.featuregrid?.dockSize,
    state => mapLayoutValuesSelector(state, { transform: true }),
    (size, dockStyle) => ({
        size,
        dockStyle
    })))(FeatureEditorFallback);
