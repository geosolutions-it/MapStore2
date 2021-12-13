/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {useState} from 'react';
import {connect} from 'react-redux';
import {Glyphicon} from 'react-bootstrap';
import { createStructuredSelector } from 'reselect';

import Message from '../../../components/I18N/Message';
import Dialog from "../../../components/misc/Dialog";
import {Resizable} from 'react-resizable';

/**
 * Main Panel of TimeSeriesPlotsContainer
 * @param {*} param0
 * @returns
 */

const TimeSeriesPlotsContainer = ({enabled, onClose = () => {}}) => {
    const margin = 10;
    const [size, setSize] = useState({width: 400, height: 300});

    if (!enabled) {
        return null;
    }

    return (
    <Dialog 
        bodyClassName={"time-series-plots-window-body"}
        draggable
    />);
}