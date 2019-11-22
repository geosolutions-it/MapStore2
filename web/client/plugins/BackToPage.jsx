/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {createStructuredSelector} from 'reselect';
import {Glyphicon} from 'react-bootstrap';

import CloseButton from '../components/buttons/CloseButton';
import {createPlugin} from '../utils/PluginsUtils';

import {showConfirmation} from '../actions/backtopage';
import {showConfirmationSelector} from '../selectors/backtopage';
import backtopage from '../reducers/backtopage';

class BackToPage extends React.Component {
    static propTypes = {
        destRoute: PropTypes.string,
        confirmMessage: PropTypes.object,
        showConfirmation: PropTypes.bool,
        onShowConfirmation: PropTypes.func
    };

    static contextTypes = {
        router: PropTypes.object
    };

    static defaultProps = {
        destRoute: '/',
        showConfirmation: false
    };

    render() {
        return (
            <CloseButton
                className="backtopage-button"
                title={<Glyphicon glyph="remove"/>}
                showConfirm={this.props.showConfirmation}
                onShowConfirm={this.props.onShowConfirmation}
                onConfirm={() => this.context.router.history.push(this.props.destRoute)}
                onClick={() => this.props.onShowConfirmation(true)}
                confirmMessage={this.props.confirmMessage}/>
        );
    }
}

export default createPlugin('BackToPage', {
    component: connect(createStructuredSelector({
        showConfirmation: showConfirmationSelector
    }), {
        onShowConfirmation: showConfirmation
    })(BackToPage),
    containers: {
        OmniBar: {
            name: "backtopage",
            position: 4,
            tool: true,
            priority: 1
        }
    },
    reducers: {
        backtopage
    }
});
