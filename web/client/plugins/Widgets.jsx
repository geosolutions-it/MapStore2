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
const {mapIdSelector} = require('../selectors/map');
const {getFloatingWidgets, dependenciesSelector, getFloatingWidgetsLayout} = require('../selectors/widgets');
const {editWidget, deleteWidget, changeLayout, exportCSV, exportImage} = require('../actions/widgets');
const ContainerDimensions = require('react-container-dimensions').default;
const {rightPanelOpenSelector, bottomPanelOpenSelector} = require('../selectors/maplayout');

const PropTypes = require('prop-types');
const WidgetsView = connect(
    createSelector(
        mapIdSelector,
        getFloatingWidgets,
        getFloatingWidgetsLayout,
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
)(require('../components/widgets/view/WidgetsView'));


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

const WidgetsPlugin = connect(
    createSelector(

        // we need to remove this selector when the widget view is resizable with the map layout
        state => rightPanelOpenSelector(state) || bottomPanelOpenSelector(state),
        //

        (checkPanel) => ({
            enabled: !checkPanel
        })
    )
)(Widgets);

module.exports = {
    WidgetsPlugin,
    reducers: {
        widgets: require('../reducers/widgets')
    },
    epics: require('../epics/widgets')
};
