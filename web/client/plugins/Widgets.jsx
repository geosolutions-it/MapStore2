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
const { compose, withProps} = require('recompose');
const {mapIdSelector} = require('../selectors/map');
const {isCesium} = require('../selectors/maptype');
const {getFloatingWidgets, dependenciesSelector, getFloatingWidgetsLayout} = require('../selectors/widgets');
const { editWidget, updateWidgetProperty, deleteWidget, changeLayout, exportCSV, exportImage} = require('../actions/widgets');
const {rightPanelOpenSelector, bottomPanelOpenSelector} = require('../selectors/maplayout');
const {heightProvider} = require('../components/layout/enhancers/gridLayout');
const ContainerDimensions = require('react-container-dimensions').default;

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
    heightProvider({ debounceTime: 20, closest: true, querySelector: '.fill' }),
    C => props => <ContainerDimensions>{({ width } = {}) => <C width={width} {...props} />}</ContainerDimensions>,
    withProps(({width, height} = {}) => {
        const divHeight = height - 120;
        const nRows = 4;
        const rowHeight = Math.floor(divHeight / nRows - 20);
        return ({
        rowHeight,
        className: "on-map",
            breakpoints: { md: 480, xxs: 0 },
            cols: { md: 6, xxs: 1 },
        style: {
            left: (width && width > 800) ? "500px" : "0",
            marginTop: 52,
            bottom: 67,
            height: Math.floor((height - 100) / (rowHeight + 10)) * (rowHeight + 10),
            width: `${width && width > 800 ? 'calc(100% - 550px)' : 'calc(100% - 50px)'}`,
            position: 'absolute',
            zIndex: 50
        }
        });
    })

)(require('../components/widgets/view/WidgetsView'));


class Widgets extends React.Component {
     static propTypes = {
         enabled: PropTypes.bool
     };
     static defaultProps = {
         enabled: true
     };
    render() {
        return this.props.enabled ? <WidgetsView /> : null;

    }
}

const WidgetsPlugin = connect(
    createSelector(
        rightPanelOpenSelector,
        bottomPanelOpenSelector,
        isCesium,
        (rightPanel, bottomPanel, cesium) => ({
            enabled: !rightPanel && !bottomPanel && !cesium
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
