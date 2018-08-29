/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { connect } = require('react-redux');
const { isString, differenceBy } = require('lodash');
const { currentTimeSelector, layersWithTimeDataSelector } = require('../../selectors/dimension');
const { selectTime, selectLayer, onRangeChanged } = require('../../actions/timeline');
const { itemsSelector, loadingSelector, selectedLayerSelector } = require('../../selectors/timeline');
const { createStructuredSelector, createSelector } = require('reselect');
const { compose, branch, withHandlers, withPropsOnChange, renderNothing, defaultProps } = require('recompose');

/**
 * Provides time dimension data for layers
 */
const layerData = compose(
    connect(
        createSelector(
            itemsSelector,
            layersWithTimeDataSelector,
            loadingSelector,
            (items, layers, loading) => ({ items, layers, loading })
        )
    ),
    branch(({ layers = [] }) => Object.keys(layers).length === 0, renderNothing),
    withPropsOnChange(
        (props, nextProps) => {
            const { layers = [], loading, selectedLayer} = props;
            const { layers: nextLayers, loading: nextLoading, selectedLayer: nextSelectedLayer } = nextProps;
            return loading !== nextLoading
                || selectedLayer !== nextSelectedLayer
                || differenceBy(layers, nextLayers || [], ({id, title, name} = {}) => id + title + name).length > 0;
        },
        // (props = {}, nextProps = {}) => Object.keys(props.data).length !== Object.keys(nextProps.data).length,
        ({ layers = [], loading = {}, selectedLayer }) => ({
            groups: layers.map(l => ({
                id: l.id,
                className: (loading[l.id] ? "loading" : "") + ((l.id && l.id === selectedLayer) ? " selected" : ""),
                content:
                    `<span class="timeline-layer-icon">${(l.id && l.id === selectedLayer) ? '<i class="glyphicon glyphicon-time"></i>' : ''}</span>`
                    + `<span class="timeline-layer-title">${(isString(l.title) ? l.title : l.name)}</span>` // TODO: i18n for layer titles
            }))
        })
    )
);
/**
 * Bind current time properties and handlers
 */
const currentTimeEnhancer = compose(
    connect(
        createStructuredSelector({
            currentTime: currentTimeSelector
        }),
        {
            setCurrentTime: selectTime
        }
    ),
    defaultProps({
        currentTime: new Date()
    })
);

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

const clickHandleEnhancer = withHandlers({
    clickHandler: ({ setCurrentTime = () => { }, selectGroup = () => { } }) => ({ time, group, what } = {}) => {
        if (["axis", "group-label"].indexOf(what) < 0) {
            setCurrentTime(time, group, what);
        } else if (what === "group-label") {
            selectGroup(group);
        }
    }
});
const rangeEnhancer = compose(
    connect(() => ({}), {
        rangechangedHandler: onRangeChanged
    })
);
const enhance = compose(
    currentTimeEnhancer,
    layerSelectionEnhancer,
    clickHandleEnhancer,
    rangeEnhancer,
    layerData,
    withPropsOnChange(
        ['currentTime'],
        ({ currentTime }) => ({
            key: 'timeline',
            customTimes: {currentTime},
            options: {
                stack: false,
                showMajorLabels: true,
                showCurrentTime: false,
                zoomMin: 10,
                zoomable: true,
                type: 'background',
                format: {
                    minorLabels: {
                        minute: 'h:mma',
                        hour: 'ha'
                    }
                }
            }
    }))

);
const Timeline = require('react-visjs-timeline').default;

module.exports = enhance(Timeline);
