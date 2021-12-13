/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {useEffect} from 'react';
import {connect} from 'react-redux';
import { createPlugin } from '../../utils/PluginsUtils';

import TimeSeriesPlotsContainer from './containers/TimeSeriesPlotsContainer';
import {toggleStreetView, configure, reset} from './actions/streetView';
import Message from '../../components/I18N/Message';

import streetView from './reducers/streetview';
import * as epics from './epics/streetView';
import './css/style.css';

const TimeSeriesPlotsComponent =({onMount, onUnmount, ...props}) => {
    useEffect(() => {
        onMount(props);
        return () => {
            onUnmount();
        }
    }, []);
    return <TimeSeriesPlotsContainer />;
};

const TimeSeriesPlotsContainer = connect(() => ({}), {
    onMount: configure, onUnmount: reset
})(TimeSeriesPlotsComponent);

/**
 * TimeSeriesPlots Plugin. Plot charts with time related data.
 * @name TimeSeriesPlots
 * @memberof plugins
 * @class
 */
export default createPlugin(
    'TimeSeriesPlots',
    {
        options: {},
        epics: {},
        reducers: {},
        component: TimeSeriesPlotsContainer,
        containers: {
            TOC: {
                doNotHide: true,
                name: "TimeSeriesPlots"
            }
        }
    }
);