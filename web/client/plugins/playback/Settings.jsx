/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import moment from 'moment';
import { connect } from 'react-redux';
import { compose, withHandlers, withProps } from 'recompose';
import { createSelector } from 'reselect';

import { changeSetting, selectPlaybackRange, toggleAnimationMode } from '../../actions/playback';
import { onRangeChanged, setTimelineSnapType } from '../../actions/timeline';
import Settings from "../../components/playback/Settings";
import { playbackRangeSelector, playbackSettingsSelector } from '../../selectors/playback';
import { rangeSelector, selectedLayerDataRangeSelector, selectedLayerSelector, snapTypeSelector, snapRadioButtonEnabledSelector, endValuesSupportSelector } from '../../selectors/timeline';

/**
 * Playback settings component connected to the state
 */
export default compose(
    connect(createSelector(
        playbackSettingsSelector,
        selectedLayerSelector,
        playbackRangeSelector,
        snapTypeSelector,
        snapRadioButtonEnabledSelector,
        endValuesSupportSelector,
        (settings, selectedLayer, playbackRange, snapType, snapRadioButtonEnabled, endValuesSupport) => ({
            fixedStep: !selectedLayer,
            playbackRange,
            currentSnapType: snapType,
            snapRadioButtonEnabled,
            endValuesSupport,
            ...settings
        })
    ), {
        setPlaybackRange: selectPlaybackRange,
        onSettingChange: changeSetting,
        onChangeSnapType: setTimelineSnapType,
        toggleAnimationMode
    }

    ),
    withProps(()=> {
        return {
            snapTypes: [{
                id: 'start',
                value: 'start',
                label: 'timeline.settings.snapToStart'
            }, {
                id: 'end',
                value: 'end',
                label: 'timeline.settings.snapToEnd'
            }]
        };
    }),
    // playback buttons
    compose(
        connect(createSelector(
            rangeSelector,
            selectedLayerDataRangeSelector,
            (viewRange, layerRange) => ({
                layerRange,
                viewRange
            })
        ), {
            moveTo: onRangeChanged
        }),
        withHandlers({
            toggleAnimationRange: ({ fixedStep, layerRange, viewRange = {}, setPlaybackRange = () => { } }) => (enabled) => {
                let currentPlaybackRange = fixedStep ? viewRange : layerRange;
                // when view range is collapsed, nothing may be initialized yet, so by default 1 day before and after today
                currentPlaybackRange = {
                    startPlaybackTime: moment(currentPlaybackRange && currentPlaybackRange.start || new Date()).subtract(1, 'days').toISOString(),
                    endPlaybackTime: moment(currentPlaybackRange && currentPlaybackRange.end || new Date()).add(1, 'days').toISOString()
                };
                setPlaybackRange(enabled ? currentPlaybackRange : undefined);
            },
            setPlaybackToCurrentViewRange: ({ viewRange = {}, setPlaybackRange = () => { } }) => () => {
                if (viewRange.start && viewRange.end) {
                    setPlaybackRange({
                        startPlaybackTime: moment(viewRange.start).toISOString(),
                        endPlaybackTime: moment(viewRange.end).toISOString()
                    });
                }
            },
            setPlaybackToCurrentLayerDataRange: ({ setPlaybackRange = () => { }, layerRange }) => () => layerRange && setPlaybackRange({
                startPlaybackTime: layerRange.start,
                endPlaybackTime: layerRange.end
            })
        }),
        withProps(({ playbackRange, fixedStep, moveTo = () => { }, setPlaybackToCurrentViewRange = () => { }, setPlaybackToCurrentLayerDataRange = () => { } }) => {
            return {
                playbackButtons: [{
                    glyph: "search",
                    tooltipId: "playback.settings.range.zoomToCurrentPlayackRange",
                    onClick: () => moveTo({ start: playbackRange.startPlaybackTime, end: playbackRange.endPlaybackTime })
                }, {
                    glyph: "resize-horizontal",
                    tooltipId: "playback.settings.range.setToCurrentViewRange",
                    onClick: () => setPlaybackToCurrentViewRange()
                }, {
                    glyph: "1-layer",
                    visible: !fixedStep,
                    tooltipId: "playback.settings.range.fitToSelectedLayerRange",
                    onClick: () => setPlaybackToCurrentLayerDataRange()
                }]
            };
        })
    )

)(Settings);
