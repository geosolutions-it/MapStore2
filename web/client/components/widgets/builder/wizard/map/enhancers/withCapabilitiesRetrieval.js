/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createEventHandler, mapPropsStream } from 'recompose';
import Rx from 'rxjs';

import { getLayerCapabilities } from '../../../../../../observables/wms';

export default mapPropsStream(props$ => {
    const { stream: retrieveLayerData$, handler: retrieveLayerData} = createEventHandler();
    return props$
        .pluck('element')
        .distinctUntilChanged((a = {}, b = {}) => a.id === b.id)
        .switchMap(() =>
            retrieveLayerData$.switchMap((element) =>
                getLayerCapabilities(element)
                    .map(layerCapability => ({
                        capabilities: layerCapability,
                        capabilitiesLoading: null,
                        description: layerCapability._abstract,
                        boundingBox: layerCapability.latLonBoundingBox,
                        availableStyles: layerCapability.style && (Array.isArray(layerCapability.style) ? layerCapability.style : [layerCapability.style])
                    })).startWith({
                        capabilitiesLoading: true
                    }))
                .catch((error) => Rx.Observable.of({ capabilitiesLoading: null, capabilities: { error: "error getting capabilities", details: error }, description: null }))
        )
        .startWith({})
        .combineLatest(props$, (elementProps = {}, props = {}) => ({
            ...props,
            retrieveLayerData,
            element: {
                ...props.element,
                ...elementProps
            }
        }));
});
