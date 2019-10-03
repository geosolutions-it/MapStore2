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
const { compose, branch, renderComponent, withProps} = require('recompose');

const {getEditingWidget} = require('../../selectors/widgets');


const mapStateToProps = createSelector(
    getEditingWidget,
    (settings) => ({
        widgetType: settings && settings.widgetType
    })
);

const WidgetTypeSelector = require('./WidgetTypeSelector');
const Builders = {
    chart: require('./ChartBuilder'),
    text: require('./TextBuilder'),
    table: require('./TableBuilder'),
    map: require('./MapBuilder'),
    counter: require('./CounterBuilder'),
    legend: require('./LegendBuilder')
};

/**
 * Allows the selection of a widget type to start the related wizard
 */
module.exports = compose(
    connect(mapStateToProps),
    withProps(({ typeFilter = () => true, availableDependencies = []}) => ({
        typeFilter: (w = {}) => typeFilter(w) && !(w.type === 'legend' && availableDependencies.length === 0)
    })),
    branch(
        ({widgetType} = {}) => !widgetType,
        renderComponent(WidgetTypeSelector),
        () => ({widgetType, onClose = () => {}, ...props} = {}) => {
            const Builder = Builders[widgetType];
            return <Builder {...props} onClose={onClose} widgetType={widgetType} />;
        }
    )
)();
