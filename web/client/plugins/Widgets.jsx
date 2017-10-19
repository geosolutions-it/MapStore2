/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {connect} = require('react-redux');
const {createSelector} = require('reselect');
const {getFloatingWidgets} = require('../selectors/widgets');

const assign = require('object-assign');
const PropTypes = require('prop-types');
const WidgetsView = connect(
    createSelector(
        getFloatingWidgets,
        (widgets) => ({
            widgets
        })
    ), {

    }
)(require('../components/widgets/view/WidgetsView'));


class Widgets extends React.Component {
     static propTypes = {
         id: PropTypes.string,
         enabled: PropTypes.isVisible,
         limitDockHeight: PropTypes.bool,
         fluid: PropTypes.bool,
         zIndex: PropTypes.number,
         dockSize: PropTypes.number,
         position: PropTypes.string,
         dimMode: PropTypes.dimMode,
         src: PropTypes.string,
         style: PropTypes.object
     };
     static defaultProps = {
         id: "widgets-plugin",
         enabled: true,
         dockSize: 600,
         limitDockHeight: true,
         zIndex: 10000,
         fluid: false,
         dimMode: "none",
         position: "right"
     };
    render() {
        return (<WidgetsView />);

    }
}

module.exports = {
    WidgetsPlugin: assign(Widgets, {

    }),
    reducers: {
        widgets: require('../reducers/widgets')
    }
};
