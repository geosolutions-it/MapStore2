/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import { connect } from 'react-redux';
import { isString, differenceBy, isNil } from 'lodash';
import { currentTimeSelector } from '../../selectors/dimension';
import { selectTime, selectLayer, onRangeChanged } from '../../actions/timeline';

import {
    itemsSelector,
    loadingSelector,
    selectedLayerSelector,
    currentTimeRangeSelector,
    rangeSelector,
    timelineLayersSelector
} from '../../selectors/timeline';

import { moveTime, setCurrentOffset } from '../../actions/dimension';
import { selectPlaybackRange } from '../../actions/playback';
import { playbackRangeSelector, statusSelector } from '../../selectors/playback';
import { createStructuredSelector, createSelector } from 'reselect';
import { createShallowSelectorCreator } from '../../utils/ReselectUtils';
import { compose, withPropsOnChange, defaultProps } from 'recompose';
import withMask from '../../components/misc/enhancers/withMask';
import Message from '../../components/I18N/Message';
import LoadingSpinner from '../../components/misc/LoadingSpinner';
import customTimesHandlers from '../../components/time/enhancers/customTimesHandlers';
import customTimesEnhancer from '../../components/time/enhancers/customTimesEnhancer';
import moment from 'moment';
/**
 * Optimization to skip re-render when the layers update properties that are not needed.
 * Typically `loading` attribute
 */
const timeLayersSelector = createShallowSelectorCreator(
    (a, b) => {
        return a === b
            || !isNil(a) && !isNil(b) && a.id === b.id && a.title === b.title && a.name === b.name;
    }
)(timelineLayersSelector, layers => layers);

/**
 * Provides time dimension data for layers
 */
const layerData = compose(
    connect(
        createSelector(
            rangeSelector,
            itemsSelector,
            timeLayersSelector,
            loadingSelector,
            (viewRange, items, layers, loading) => ({
                viewRange,
                items,
                layers,
                loading
            })
        )
    ),
    withPropsOnChange(
        (props, nextProps) => {
            const { layers = [], loading, selectedLayer} = props;
            const { layers: nextLayers, loading: nextLoading, selectedLayer: nextSelectedLayer } = nextProps;
            const hideNamesChange = props.hideLayersName !== nextProps.hideLayersName;
            return loading !== nextLoading
                || selectedLayer !== nextSelectedLayer
                || hideNamesChange
                || (layers && nextLayers && layers.length !== nextLayers.length)
                || differenceBy(layers, nextLayers || [], ({id, title, name} = {}) => id + title + name).length > 0;
        },
        // (props = {}, nextProps = {}) => Object.keys(props.data).length !== Object.keys(nextProps.data).length,
        ({ layers = [], loading = {}, selectedLayer }) => ({
            groups: layers.map((l) => ({
                id: l.id,
                className: (loading[l.id] ? "loading" : "") + ((l.id && l.id === selectedLayer) ? " selected" : ""),
                content:
                    `<div class="timeline-layer-label-container">`
                        + (loading[l.id]
                            ? `<div class="timeline-layer-icon"><div class="timeline-spinner"></div></div>`
                            : `<div class="timeline-layer-icon">${(l.id && l.id === selectedLayer)
                                ? '<i class="glyphicon glyphicon-time"></i>'
                                : ''
                            }</div>`)
                        + `<div class="timeline-layer-title">${(isString(l.title) ? l.title : l.name)}</div>`
                    + "</div>" // TODO: i18n for layer titles*/
            }))
        })
    )
);
/**
 * Bind current time properties and handlers
 */
const currentTimeEnhancer = compose(
    connect(
        createSelector(
            currentTimeSelector,
            currentTimeRangeSelector,
            (current, range) => ({
                currentTime: current,
                currentTimeRange: range
            })
        ),
        {
            setCurrentTime: selectTime,
            moveCurrentRange: moveTime,
            setOffset: setCurrentOffset
        }
    )
);

/**
 * Add playback state and handlers
 */
const playbackRangeEnhancer = compose(
    connect(
        createStructuredSelector({
            playbackRange: playbackRangeSelector,
            status: statusSelector
        }),
        {
            setPlaybackRange: selectPlaybackRange
        }
    )
);

/**
 * Add selected layer state and handler for layer selection
 */
const layerSelectionEnhancer = compose(
    connect(
        createSelector(
            selectedLayerSelector,
            selectedLayer => ({selectedLayer})
        )
        , {
            selectGroup: selectLayer
        }
    )
);


const rangeEnhancer = compose(
    connect(() => ({}), {
        rangechangedHandler: onRangeChanged
    })
);

const enhance = compose(
    currentTimeEnhancer,
    playbackRangeEnhancer,
    layerSelectionEnhancer,
    customTimesHandlers,
    rangeEnhancer,
    layerData,
    defaultProps({
        key: 'timeline',
        options: {
            maxHeight: '90%',
            verticalScroll: true,
            stack: false,
            showMajorLabels: true,
            showCurrentTime: false,
            zoomMin: 10,
            zoomable: true,
            type: 'background',
            margin: {
                item: 0,
                axis: 0
            },
            format: {
                minorLabels: {
                    minute: 'h:mma',
                    hour: 'ha'
                }
            },
            itemsAlwaysDraggable: true,
            moment: date => moment(date).utc()
        }
    }),
    // add view range to the options, to sync current range with state one and allow to control it
    withPropsOnChange(['viewRange', 'options'], ({ viewRange = {}, options}) => ({
        options: {
            ...options,
            ...(viewRange) // TODO: if the new view range is very far from the current one, the animation takes a lot. We should allow also to disable animation (animation: false in the options)
        }
    })),
    // disable some functionalities when playing
    withPropsOnChange(['status'], ({ status }) => ({
        readOnly: status === "PLAY"
    })),
    customTimesEnhancer,
    withMask(
        ({loading}) => loading && loading.timeline,
        () => <div style={{ margin: "auto", fontWeight: 'bold' }} ><LoadingSpinner style={{ display: "inline-block", verticalAlign: "middle" }}/><Message msgId="loading" /></div>,
        {white: true}
    )
);
import Timeline from '../../components/time/TimelineComponent';

export default enhance(Timeline);
