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
const {compose, branch, renderComponent} = require('recompose');

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
    text: require('./TextBuilder')
};

/**
 * Allows the selection of a widget type to start the related wizard
 */
module.exports = compose(
        connect(mapStateToProps),
        branch(
           ({widgetType} = {}) => !widgetType,
           renderComponent(WidgetTypeSelector),
           () => ({widgetType, onClose=() => {}, ...props} = {}) => {
               const Builder = Builders[widgetType];
               return <Builder {...props} onClose={onClose} widgetType={widgetType} />;
           }
    )
)();
