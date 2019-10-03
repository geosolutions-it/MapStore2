/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { connect } = require('react-redux');
const { createSelector } = require('reselect');
const moment = require('moment');
const { compose, withProps, withHandlers } = require('recompose');
const { playbackSettingsSelector, playbackRangeSelector } = require('../../selectors/playback');
const { selectedLayerSelector, rangeSelector, selectedLayerDataRangeSelector } = require('../../selectors/timeline');
const { selectPlaybackRange, changeSetting, toggleAnimationMode } = require('../../actions/playback');
const { onRangeChanged } = require('../../actions/timeline');

/**
 * Playback settings component connected to the state
 */
module.exports = compose(
    connect(createSelector(
        playbackSettingsSelector,
        selectedLayerSelector,
        playbackRangeSelector,
        (settings, selectedLayer, playbackRange) => ({
            fixedStep: !selectedLayer,
            playbackRange,
            ...settings
        })
    ), {
        setPlaybackRange: selectPlaybackRange,
        onSettingChange: changeSetting,
        toggleAnimationMode
    }

    ),
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

)(require("../../components/playback/Settings"));
