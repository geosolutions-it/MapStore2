import PropTypes from 'prop-types';

/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import { Glyphicon } from 'react-bootstrap';

class SettingsPanel extends React.Component {
    static propTypes = {
        isPanel: PropTypes.bool,
        buttonTooltip: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        style: PropTypes.object
    };

    static defaultProps = {
        isPanel: true,
        icon: <Glyphicon glyph="cog"/>,
        style: {
            width: "300px"
        }
    };

    render() {
        return (<div style={this.props.style}>
            {this.props.children}
        </div>);

    }
}

export default SettingsPanel;
