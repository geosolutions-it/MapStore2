/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import { compose, branch, renderComponent, withProps} from 'recompose';

import {getEditingWidget} from '../../selectors/widgets';


const mapStateToProps = createSelector(
    getEditingWidget,
    (settings) => ({
        widgetType: settings && settings.widgetType
    })
);

import ChartBuilder from './ChartBuilder';
import TextBuilder from './TextBuilder';
import TableBuilder from './TableBuilder';
import MapBuilder from './MapBuilder';
import CounterBuilder from './CounterBuilder';
import LegendBuilder from './LegendBuilder';
import WidgetTypeSelector from './WidgetTypeSelector';
const Builders = {
    chart: ChartBuilder,
    text: TextBuilder,
    table: TableBuilder,
    map: MapBuilder,
    counter: CounterBuilder,
    legend: LegendBuilder
};

/**
 * Allows the selection of a widget type to start the related wizard
 */
export default compose(
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
