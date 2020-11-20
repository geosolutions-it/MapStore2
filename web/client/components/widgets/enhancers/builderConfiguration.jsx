import React from 'react';
import loadingState from '../../misc/enhancers/loadingState';
import emptyState from '../../misc/enhancers/emptyState';
import propsStreamFactory from '../../misc/enhancers/propsStreamFactory';
import {compose, defaultProps} from 'recompose';
import {get} from 'lodash';
import {Observable} from 'rxjs';
import {describeFeatureType} from '../../../observables/wfs';
import pingAggregateProcess from '../../../observables/widgets/pingAggregateProcess';

import {Message, HTML} from "../../I18N/I18N";
const TYPES = "ALL";
import {findGeometryProperty} from '../../../utils/ogc/WFS/base';
/**
 * Enhancer that retrieves information about the featureType attributes and the aggregate process
 * to find out proper information
 * @param {boolean} options.needsWPS true if the builder needs also WPS
 */
export default ({needsWPS} = {}) => compose(
    defaultProps({
        dataStreamFactory: ($props, {onEditorChange = () => {}, onConfigurationError = () => {}} = {}) =>
            $props
                .distinctUntilChanged( ({layer = {}} = {}, {layer: newLayer} = {})=> layer.name === newLayer.name)
                .switchMap(({ layer } = {}) => Observable.forkJoin(
                    describeFeatureType({ layer }),
                    // if the builder needWPS service, then if missing it emits an exception
                    // otherwise, it simply sets the flag to false
                    ...(needsWPS ? [pingAggregateProcess(layer)] : [pingAggregateProcess(layer).catch( () => Observable.of(false))]))
                    .do(([result]) => {
                        const geomProp = get(findGeometryProperty(result.data || {}), "name");
                        if (geomProp) {
                        // set the geometry property (needed for synchronization with a map or any other sort of spatial filter)
                            onEditorChange("geomProp", geomProp);
                        }
                    })
                    .map(([result, hasAggregateProcess]) => ({
                        hasAggregateProcess: !!hasAggregateProcess,
                        loading: false,
                        types: TYPES,
                        featureTypeProperties: get(result, "data.featureTypes[0].properties") || []
                    })
                    ))
                .catch( e => {
                    onConfigurationError(e);
                    return Observable.of({
                        errorObj: e,
                        loading: false,
                        featureTypeProperties: []
                    });
                })
                .startWith({loading: true})
    }),
    propsStreamFactory,
    loadingState(),
    emptyState(
        ({featureTypeProperties = [], types = []}) => featureTypeProperties.length === 0 || types.length === 0,
        () => ({
            title: <Message msgId="widgets.builder.errors.noWidgetsAvailableTitle" />,
            description: <HTML msgId="widgets.builder.errors.noWidgetsAvailableDescription" />
        })
    )
);
