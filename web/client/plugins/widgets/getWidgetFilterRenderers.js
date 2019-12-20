/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const { compose, withPropsOnChange, withProps, mapPropsStream } = require('recompose');
const { find } = require('lodash');


const { getAttributeFields } = require('../../utils/FeatureGridUtils');
const { getFilterRenderer } = require('../../components/data/featuregrid/filterRenderers');

/**
 * Uses the quickFilterStream$ to generate the value prop.
 * Each time the quickFilterStream emits a value
 */
const mergeQuickFiltersStream = compose(
    mapPropsStream(props$ =>
        props$.combineLatest(
            // extract the quickFilterStream$ from props
            props$.pluck('quickFilterStream$').distinctUntilChanged().switchMap( quickFilterStream$ => {
                // extract the value from the stream
                return quickFilterStream$.map( ({quickFilters, attributeName, options}) => {
                    const attributeQuickFilter = quickFilters && options && find(options.propertyName, f => f === attributeName) && quickFilters[attributeName] || {};
                    const value = attributeQuickFilter && (attributeQuickFilter.rawValue || attributeQuickFilter.value);
                    return value;
                });
            }).startWith(undefined),
            (props, value) => {
                return {
                    ...props,
                    value
                };
            })
    ) // emit first to trigger first combine latest

);

const getFilterComponent = ({localType, attributeName, quickFilterStream$}) => compose(
    withProps({quickFilterStream$: quickFilterStream$.map(params => ({...params, attributeName}))}),
    // withProps({quickFilterStream$}),
    mergeQuickFiltersStream
)(getFilterRenderer(localType, {name: attributeName }));

// add to the container a stream as a prop that emits a value each time quick filter stream changes
const withQuickFiltersStream = compose(
    mapPropsStream(props$ => {
        return props$.map((p) => ({...p, quickFilterStream$: props$.map(({quickFilters, options}) => ({quickFilters, options})).distinctUntilChanged()}));
    })
);

const getWidgetFilterRenderers = compose(
    withQuickFiltersStream,
    withPropsOnChange(
        ["describeFeatureType", "options", "quickFilterStream$"],
        ({ describeFeatureType, options, quickFilterStream$} = {}) => {
            return describeFeatureType ?
                {filterRenderers: getAttributeFields(describeFeatureType).reduce( (prev, {localType, name: attributeName}) => {
                    const filterComp = getFilterComponent({options, localType, attributeName, quickFilterStream$});
                    return {...prev, [attributeName]: filterComp};
                }, {})}
                : {};
        }
    )
);

module.exports = {getWidgetFilterRenderers};

