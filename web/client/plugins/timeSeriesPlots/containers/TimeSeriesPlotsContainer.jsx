/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Glyphicon } from 'react-bootstrap';
import { createStructuredSelector } from 'reselect';

import Dialog from "../../../components/misc/Dialog";
import Message from '../../../components/I18N/Message';
import { Resizable } from 'react-resizable';
import { toggleControl } from '../../../actions/controls';

import {
    enabledSelector
} from '../selectors/timeSeriesPlots';

/**
 * Main Panel of TimeSeriesPlotsContainer
 * @param {*} param0
 * @returns
 */

const Panel = ({ enabled, onClose = () => {} }) => {
    const margin = 10;
    const initialSize = {width: 400, height: 300};
    const [size, setSize] = useState(initialSize);
    if (!enabled) {
        return null;
    }

    return (
    <Dialog
        bodyClassName={"time-series-plots-window-body"}
        draggable
        style={{
            zIndex: 10000,
            position: "absolute",
            left: "17%",
            top: "50px",
            margin: 0,
            width: size.width}}>
        <span
            role="header"
            style={{ display: "flex", justifyContent: "space-between" }}
        >
            <span>
                <Message msgId={"timeSeriesPlots.title"} />
            </span>
            <button onClick={() => {onClose(); setSize(initialSize)}} className="close">
                <Glyphicon glyph="1-close" />
            </button>
        </span>
        <div
            role="body"
            style={ { height: size.height }}
        >
            <Resizable
                width={size.width}
                height={size.height}
                minConstraints={[190, 50]}
                onResize={(event, {size: newSize}) => {
                    setSize(newSize);
                }}
            >
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    width: size.width,
                    height: size.height
                }}>
                </div>
            </Resizable>
        </div>
    </Dialog>
    );
}

const TSPPanel = connect(createStructuredSelector({
    enabled: enabledSelector
}), {
    onClose: () => toggleControl("timeSeriesPlots")
})(Panel);

export default TSPPanel;