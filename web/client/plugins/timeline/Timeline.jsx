/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { connect } = require('react-redux');
const { isString } = require('lodash');
const { currentTimeSelector, layersWithTimeDataSelector } = require('../../selectors/dimension');
const { selectTime, onRangeChanged} = require('../../actions/timeline');
const { itemsSelector, loadingSelector } = require('../../selectors/timeline');
const { createStructuredSelector, createSelector } = require('reselect');
const { compose, withProps, branch, withHandlers, withPropsOnChange, renderNothing, defaultProps} = require('recompose');

/**
 * Provides time dimension data for layers
 */
const layerData = compose(
    connect(
        createSelector(
            itemsSelector,
            layersWithTimeDataSelector,
            loadingSelector,
            (items, layers, loading) => ({ items, layers, loading})
        )
    ),
    branch(({ layers = [] }) => Object.keys(layers).length === 0, renderNothing),
    withPropsOnChange(
        ['layers', 'loading'],
        // (props = {}, nextProps = {}) => Object.keys(props.data).length !== Object.keys(nextProps.data).length,
        ({ layers = [], loading = {}}) => ({
            groups: layers.map(l => ({
                id: l.id,
                className: loading[l.id] ? "loading" : "",
                content: isString(l.title) ? l.title : l.name // TODO: i18n for layer titles
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
    withHandlers({
        selectionChange: ({ setCurrentTime = () => { } }) => e => setCurrentTime(e.items[0]),
        clickHandler: ({ setCurrentTime = () => { } }) => ({ time } = {}) => setCurrentTime(time)
    }),
    defaultProps({
        currentTime: new Date()
    })
);

const rangeEnhancer = compose(
    connect( () => ({}), {
        rangechangedHandler: onRangeChanged
    })
);
const enhance = compose(
    currentTimeEnhancer,
    rangeEnhancer,
    layerData,
    withProps(({ currentTime }) => ({
        customTimes: [currentTime],
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
