/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import Slider from 'react-nouislider';
import { createSelector } from 'reselect';
import {find} from 'lodash';

import Message from '../components/I18N/Message';
import DockabePanel from '../components/misc/panels/DockablePanel';
import { swipeToolStatusSelector } from '../selectors/swipe';
import { swipeSettingsSelector, swipeModeDirectionSelector, spyModeRadiusSelector } from '../selectors/mapInfo';
const { setActive } = require('../actions/swipe');
const { setSwipeToolDirection, setSpyToolRadius } = require('../actions/mapInfo');

const swipeTypeOptions = [{
    label: 'Horizontal',
    value: 'cut-horizontal'
}, {
    label: 'Vertical',
    value: 'cut-vertical'
}];

const SpyRadiusConfiguration = ({onSetSpyToolRadius, radius}) => {
    return (<div className="mapstore-swipe-settings-spy">
        <h4><Message msgId="toc.radius" /></h4>
        <div className="mapstore-slider with-tooltip">
            <Slider
                tooltips
                step={10}
                start={[radius]}
                range={{
                    'min': [20],
                    'max': [100]
                }}
                onChange={(value) => onSetSpyToolRadius(value[0])}
            />
        </div>
    </div>);
};

const SwipeTypeConfiguration = ({onSetSwipeToolDirection, direction}) => {
    return (<div className="mapstore-swipe-settings-slider">
        <h4><Message msgId="toc.direction" /></h4>
        <Select
            styles={{ menuPortal: base => ({ ...base, zIndex: 3100 }) }}
            onChange={({value}) => onSetSwipeToolDirection(value)}
            clearable={false}
            value={find(swipeTypeOptions, ['value', direction])}
            options={swipeTypeOptions}/>
    </div>);
};

export const SwipeSettings = (
    {
        configuring,
        toolMode,
        direction,
        radius,
        onSetConfigurationActive = () => {},
        onSetSpyToolRadius = () => {},
        onSetSwipeToolDirection = () => {}
    }) => {
    return (<div className="mapstore-swipe-settings">
        <DockabePanel
            title={toolMode === "spy"
                ? <Message msgId="toc.spyconfiguration" />
                : <Message msgId="toc.swipeconfiguration" />}
            open={configuring}
            onClose={() => onSetConfigurationActive(false, "configuring")}
            enableFooter={false}
            draggable
            size="xs"
            bodyClassName="mapstore-swipe-setiings-modal-body"
            dialogClassName=" mapstore-swipe-settings-modal"
            glyph="transfer">
            {toolMode === "spy"
                ? <SpyRadiusConfiguration
                    radius={radius}
                    onSetSpyToolRadius={onSetSpyToolRadius} />
                : <SwipeTypeConfiguration
                    direction={direction}
                    onSetSwipeToolDirection={onSetSwipeToolDirection} />}
        </DockabePanel>
    </div>);
};

const selector = createSelector([
    swipeSettingsSelector,
    swipeModeDirectionSelector,
    spyModeRadiusSelector,
    swipeToolStatusSelector
], (swipeSettings, swipeModeDirection, spyModeRadius, swipeToolStatus) => ({
    configuring: swipeToolStatus?.configuring || false,
    toolMode: swipeSettings.mode || "swipe",
    direction: swipeModeDirection.direction,
    radius: spyModeRadius.radius
}));

export default connect(selector, {
    onSetConfigurationActive: setActive,
    onSetSwipeToolDirection: setSwipeToolDirection,
    onSetSpyToolRadius: setSpyToolRadius
})(SwipeSettings);
