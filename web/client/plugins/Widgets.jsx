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
const {compose, withProps} = require('recompose');
const {mapIdSelector} = require('../selectors/map');
const {getFloatingWidgets, dependenciesSelector, getFloatingWidgetsLayout} = require('../selectors/widgets');
const { editWidget, updateWidgetProperty, deleteWidget, changeLayout, exportCSV, exportImage} = require('../actions/widgets');
const ContainerDimensions = require('react-container-dimensions').default;
const {rightPanelOpenSelector, bottomPanelOpenSelector} = require('../selectors/maplayout');

const PropTypes = require('prop-types');
const WidgetsView =
compose(
    connect(
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
            updateWidgetProperty,
            exportCSV,
            exportImage,
            deleteWidget,
            onLayoutChange: changeLayout
        }
    ),
    withProps(({width, height, rowHeight = 208} = {}) => ({
        rowHeight,
        className: "on-map",
        breakpoints: {lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0},
        cols: {lg: 6, md: 6, sm: 4, xs: 2, xxs: 1},
        style: {
            left: (width && width > 800) ? "500px" : "0",
            bottom: 50,
            height: Math.floor((height - 100) / (rowHeight + 10)) * (rowHeight + 10),
            width: `${width && width > 800 ? 'calc(100% - 550px)' : 'calc(100% - 50px)'}`,
            position: 'absolute',
            zIndex: 50
        }
    }))
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
