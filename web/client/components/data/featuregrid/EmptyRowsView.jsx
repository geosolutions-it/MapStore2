/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import Message from '../../I18N/Message';
import WidgetEmptyMessage from '../../widgets/widget/WidgetEmptyMessage';

const nodataStyle = {
    width: "100%",
    height: "100%",
    textAlign: "center",
    verticalAlign: "center"
};

class EmptyRowsView extends React.PureComponent {
    static propTypes = {
        loading: PropTypes.bool
    }
    render() {
        return this.props.loading
            ? (<div style={nodataStyle}><Message msgId="loading" /></div>) : (<WidgetEmptyMessage messageId="featuregrid.noFeaturesAvailable" glyph="features-grid"/>);
    }
}

export default EmptyRowsView;
