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
import ToggleButton from '../../../components/buttons/ToggleButton';
import Message from '../../../components/I18N/Message';

class Home extends React.Component {
    static propTypes = {
        isPanel: PropTypes.bool,
        buttonTooltip: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        help: PropTypes.object,
        changeHelpText: PropTypes.func,
        changeHelpwinVisibility: PropTypes.func
    };

    static contextTypes = {
        router: PropTypes.object
    };

    static defaultProps = {
        isPanel: false,
        icon: <Glyphicon glyph="home"/>
    };

    render() {
        return (
            <ToggleButton
                id="home-button"
                key="gohome"
                isButton
                pressed={false}
                glyphicon="home"
                helpText={<Message msgId="helptexts.gohome"/>}
                onClick={this.goHome}
                tooltip={this.props.buttonTooltip}
                tooltipPlace="left"
            />
        );
    }

    goHome = () => {
        this.context.router.history.push("/");
    };
}

export default Home;
