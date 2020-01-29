/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { mapPropsStream} from 'recompose';
import {find} from 'lodash';

/**
 * This streams handle the reload of a selected map from geostore.
 * It has to follow handleMapSelect enhancer
 * If a map that is present in the resources is selected but the map configurations are missing
 * this stream throws the reload the map configurations
 */

export default mapPropsStream(props$ =>
    props$.distinctUntilKeyChanged("resources")
        .filter(({selectedService, selected, selectedItem}) => selectedService === "geostoreMap" && selected && selectedItem && !selectedItem.center)
        .do(({resources, selectedItem, onMapChoice}) => {
            if (find(resources, ({id}) => id === selectedItem.id)) {
                onMapChoice(selectedItem);
            }
        })
        .ignoreElements() // don't want to emit props
        .startWith({})
        .combineLatest(props$, (emptyProps, props) =>  props)
);
