/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const PropTypes = require('prop-types');
const { createSelector } = require('reselect');
const { connect } = require('react-redux');
const { Button } = require('react-bootstrap');
const { isLoggedIn } = require('../../selectors/security');
const {mapTypeSelector} = require('../../selectors/maptype');

const Message = require('../../components/I18N/Message');

class EmptyMaps extends React.Component {
    static propTypes = {
        loggedIn: PropTypes.bool,
        mapType: PropTypes.string
    }
    static contextTypes = {
        router: PropTypes.object
    };

    render() {
        return (<div style={{width: "100%", textAlign: "center", marginBottom: '20px'}}>{this.props.loggedIn
            ? (<Button bsStyle="primary" onClick={() => { this.context.router.history.push("/viewer/" + this.props.mapType + "/new"); }}>
                <Message msgId="resources.maps.createNewOne" />
            </Button>)
            : null}</div>);
    }
}
module.exports = connect(
    createSelector([isLoggedIn, mapTypeSelector], (loggedIn, mapType) => ({
        loggedIn: !!loggedIn,
        mapType
    })),
)(EmptyMaps);
