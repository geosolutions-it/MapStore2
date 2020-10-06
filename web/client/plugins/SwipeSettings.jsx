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
import { layerSwipeSettingsSelector, swipeModeSettingsSelector, spyModeSettingsSelector } from '../selectors/swipe';
const { setActive, setSwipeToolDirection, setSpyToolRadius } = require('../actions/swipe');

const swipeTypeOptions = [{
    label: 'Horizontal',
    value: 'cut-horizontal'
}, {
    label: 'Vertical',
    value: 'cut-vertical'
}];

const SpyRadiusConfiguration = ({spyModeSettings, onSetSpyToolRadius}) => {
    return (<div className="mapstore-swipe-settings-spy">
        <h4><Message msgId="toc.radius" /></h4>
        <div className="mapstore-slider with-tooltip">
            <Slider
                tooltips
                step={10}
                start={[spyModeSettings.radius]}
                range={{
                    'min': [20],
                    'max': [100]
                }}
                onChange={(value) => onSetSpyToolRadius(value[0])}
            />
        </div>
    </div>);
};

const SwipeTypeConfiguration = ({swipeModeSettings, onSetSwipeToolDirection}) => {
    return (<div className="mapstore-swipe-settings-slider">
        <h4><Message msgId="toc.direction" /></h4>
        <Select
            styles={{ menuPortal: base => ({ ...base, zIndex: 3100 }) }}
            onChange={({value}) => onSetSwipeToolDirection(value)}
            clearable={false}
            value={find(swipeTypeOptions, ['value', swipeModeSettings.direction])}
            options={swipeTypeOptions}/>
    </div>);
};

export const SwipeSettings = (
    {
        configuring,
        toolMode,
        swipeModeSettings,
        spyModeSettings,
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
                    spyModeSettings={spyModeSettings}
                    onSetSpyToolRadius={onSetSpyToolRadius} />
                : <SwipeTypeConfiguration
                    swipeModeSettings={swipeModeSettings}
                    onSetSwipeToolDirection={onSetSwipeToolDirection} />}
        </DockabePanel>
    </div>);
};

const selector = createSelector([
    layerSwipeSettingsSelector,
    swipeModeSettingsSelector,
    spyModeSettingsSelector
], (swipeSettings, swipeModeSettings, spyModeSettings) => ({
    configuring: swipeSettings?.configuring || false,
    toolMode: swipeSettings?.mode || "swipe",
    swipeModeSettings,
    spyModeSettings
}));

export default connect(selector, {
    onSetConfigurationActive: setActive,
    onSetSwipeToolDirection: setSwipeToolDirection,
    onSetSpyToolRadius: setSpyToolRadius
})(SwipeSettings);
