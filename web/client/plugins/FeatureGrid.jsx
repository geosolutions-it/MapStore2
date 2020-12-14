/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { connect } from 'react-redux';

import { toggleControl } from '../actions/controls';
import { dockSizeFeatures, selectFeatures } from '../actions/featuregrid';
import { changeMapView } from '../actions/map';
import { query } from '../actions/wfsquery';
import DockedFeatureGrid from '../components/data/featuregrid_ag/DockedFeatureGrid';
import featuregridReducers from '../reducers/featuregrid';
import highlightReducers from '../reducers/highlight';

/**
 * this plugin has been deprecated in favor of FeatureEditor {@link plugins.FeatureEditor}
 * @name FeatureGrid
 * @memberof plugins
 * @class
 * @deprecated
*/
export default {
    FeatureGridPlugin: connect((state) => ({
        open: state.query && state.query.open,
        exportEnabled: state && state.controls && state.controls.layerdownload && state.controls.layerdownload.available,
        features: state.query && state.query.result && state.query.result.features,
        filterObj: state.query && state.query.filterObj,
        searchUrl: state.query && state.query.searchUrl,
        initWidth: "100%",
        map: (state.map && state.map.present) || (state.map) || (state.config && state.config.map) || null,
        columnsDef: state.query && state.query.typeName && state.query.featureTypes
            && state.query.featureTypes[state.query.typeName]
            && state.query.featureTypes[state.query.typeName]
            && state.query.featureTypes[state.query.typeName].attributes
            && state.query.featureTypes[state.query.typeName].attributes.filter(attr => attr.name !== "geometry")
                .map((attr) => ({
                    headerName: attr.label,
                    field: attr.attribute
                })),
        query: state.query && state.query.queryObj,
        isNew: state.query && state.query.isNew,
        totalFeatures: state.query && state.query.result && state.query.result.totalFeatures,
        dockSize: state.featuregrid && state.featuregrid.dockSize
    }),
    {
        selectFeatures,
        exportAction: () => toggleControl("layerdownload"),
        changeMapView,
        onQuery: query,
        setDockSize: dockSizeFeatures
    })(DockedFeatureGrid),
    reducers: {
        featuregrid: featuregridReducers,
        highlight: highlightReducers
    }
};
