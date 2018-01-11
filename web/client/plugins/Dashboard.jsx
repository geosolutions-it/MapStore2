/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {connect} = require('react-redux');
const {compose, withProps} = require('recompose');
const {createSelector} = require('reselect');
const {mapIdSelector} = require('../selectors/map');
const {getDashboardWidgets, dependenciesSelector, getDashboardWidgetsLayout} = require('../selectors/widgets');
const {editWidget, deleteWidget, changeLayout, exportCSV, exportImage} = require('../actions/widgets');
const ContainerDimensions = require('react-container-dimensions').default;

const PropTypes = require('prop-types');
const WidgetsView = compose(
    connect(
        createSelector(
            mapIdSelector,
            getDashboardWidgets,
            getDashboardWidgetsLayout,
            dependenciesSelector,
            (id, widgets, layouts, dependencies) => ({
                id,
                widgets,
                layouts,
                dependencies
            })
        ), {
            editWidget,
            exportCSV,
            exportImage,
            deleteWidget,
            onLayoutChange: changeLayout
        }
    ),
    withProps(() => ({
        style: {
            height: "100%",
            overflow: "auto"
        }
    }))
)(require('../components/dashboard/Dashboard'));


class Widgets extends React.Component {
     static propTypes = {
         enabled: PropTypes.bool
     };
     static defaultProps = {
         enabled: true
     };
    render() {
        return this.props.enabled ? (<ContainerDimensions>{({width, height}) => <WidgetsView width={width} height={height}/>}</ContainerDimensions> ) : null;

    }
}

const DashboardPlugin = Widgets;

module.exports = {
    DashboardPlugin,
    reducers: {
        widgets: require('../reducers/widgets')
    }
};
