/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {compose, withPropsOnChange, withHandlers} = require('recompose');
const { getStartEnd } = require('../../../utils/TimeUtils');

/**
 * Enhances timeline with cursors for playback and time range.
 * Also draws backgrounds for the 2 ranges and add needed options to make time range draggable.
 *
 */
module.exports = compose(
    // Playback range background
    withPropsOnChange(
        ['rangeItems', 'playbackRange', 'playbackEnabled', 'selectedLayer'],
        ({
            rangeItems = [],
            playbackEnabled,
            playbackRange
        }) => ({
            rangeItems: playbackEnabled && playbackRange && playbackRange.startPlaybackTime !== undefined && playbackRange.endPlaybackTime !== undefined
                ? [
                    ...rangeItems,
                    {
                        id: 'playback-range',
                        ...getStartEnd(playbackRange.startPlaybackTime, playbackRange.endPlaybackTime),
                        type: 'background',
                        className: 'ms-playback-range'
                    }
                ].filter(val => val)
                : rangeItems
        })
    ),
    // support for offset and it's range background. TODO: compose also with the proper custom time, to isolate the functionality
    compose(
        withHandlers({
            onUpdate: ({ moveCurrentRange = () => { } }) => ({ id, start }) => {
                if (id === 'current-range') {
                    moveCurrentRange(start.toISOString());
                }

            }
        }),
        withPropsOnChange(['options', 'onUpdate'], ({ options = {}, onUpdate = () => { } }) => ({
            options: {
                ...options,
                snap: null,
                editable: {
                    // ...(options.editable || {}), // we may improve this merge to allow some configuration.
                    add: false,         // add new items by double tapping
                    updateTime: false,  // drag items horizontally
                    updateGroup: false, // drag items from one group to another
                    remove: false,       // delete an item by tapping the delete button top right
                    overrideItems: false  // allow these options to override item.editable
                },
                onMove: (item = {}, callback) => {
                    onUpdate(item);
                    callback(item);

                }
            }
        })),
        withPropsOnChange(
            ['rangeItems', 'currentTime', 'offsetEnabled', 'selectedLayer', 'currentTimeRange', 'readOnly'],
            ({
                currentTimeRange,
                rangeItems = [],
                readOnly,
                offsetEnabled
            }) => ({
                rangeItems: offsetEnabled && currentTimeRange.start !== undefined && currentTimeRange.end !== undefined
                    ? [
                        ...rangeItems,
                        {
                            id: 'current-range',
                            editable: { updateTime: !readOnly, updateGroup: false, remove: false },
                            ...getStartEnd(currentTimeRange.start, currentTimeRange.end),
                            type: 'background',
                            className: 'ms-current-range'
                        }
                    ].filter(val => val)
                    : rangeItems
            })
        )
    ),
    // custom times enhancer. TODO: separate playback and currentTimeRange cursors
    withPropsOnChange(
        ['currentTime', 'playbackRange', 'playbackEnabled', 'offsetEnabled', 'currentTimeRange'],
        ({ currentTime, playbackRange, playbackEnabled, offsetEnabled, currentTimeRange }) => ({
            customTimes: [
                (currentTime ? { currentTime: currentTime } : {}),
                (playbackEnabled && playbackRange && playbackRange.startPlaybackTime && playbackRange.endPlaybackTime ? playbackRange : {}),
                (offsetEnabled && currentTimeRange ? { offsetTime: currentTimeRange.end } : {})
            ].reduce((res, value) => value ? { ...res, ...value } : { ...res }, {}) // becomes an object
        })
    )
);
