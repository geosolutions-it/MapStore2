/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { connect } from 'react-redux';
import Button from '../misc/Button';
import PropTypes from 'prop-types';
import { Glyphicon, Tooltip } from 'react-bootstrap';
import OverlayTrigger from '../misc/OverlayTrigger';
import Message from '../../components/I18N/Message';
import { pick } from "lodash";
import { goToHomePage } from '../../actions/router';

class Home extends React.Component {
    static propTypes = {
        icon: PropTypes.string,
        onCheckMapChanges: PropTypes.func,
        tooltipPosition: PropTypes.string,
        bsStyle: PropTypes.string,
        hidden: PropTypes.bool
    };

    static contextTypes = {
        router: PropTypes.object,
        messages: PropTypes.object
    };

    static defaultProps = {
        icon: "home",
        tooltipPosition: 'left',
        bsStyle: 'primary',
        hidden: false
    };

    render() {
        const { tooltipPosition, hidden, ...restProps} = this.props;
        let tooltip = <Tooltip id="toolbar-home-button">{<Message msgId="gohome"/>}</Tooltip>;
        return hidden ? false : (
            <OverlayTrigger overlay={tooltip} placement={tooltipPosition}>
                <Button
                    id="home-button"
                    className="square-button"
                    bsStyle={this.props.bsStyle}
                    onClick={this.checkUnsavedChanges}
                    tooltip={tooltip}
                    {...pick(restProps, ['disabled', 'active', 'block', 'componentClass', 'href', 'children', 'icon', 'bsStyle', 'className'])}
                ><Glyphicon glyph={this.props.icon}/></Button>
            </OverlayTrigger>
        );
    }

    checkUnsavedChanges = () => {
        this.goHome();
    }

    goHome = () => {
        this.props.goToHomePage();
    };
}

export default connect(null, {
    goToHomePage
})(Home);
