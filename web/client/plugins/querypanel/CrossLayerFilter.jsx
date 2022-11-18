/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {
    addCrossLayerFilterField as _addCrossLayerFilterField,
    expandCrossLayerFilterPanel as _expandCrossLayerFilterPanel,
    removeCrossLayerFilterField as _removeCrossLayerFilterField,
    resetCrossLayerFilter as _resetCrossLayerFilter,
    setCrossLayerFilterParameter as _setCrossLayerFilterParameter,
    toggleMenu as _toggleMenu,
    updateCrossLayerFilterField as _updateCrossLayerFilterField
} from "../../actions/queryform";
import {compose, withProps} from "recompose";
import crossLayerFilterEnhancer from "../../components/data/query/enhancers/crossLayerFilter";
import {availableCrossLayerFilterLayersSelector, crossLayerFilterSelector} from "../../selectors/queryform";
import CrossLayerFilterComponent from "../../components/data/query/CrossLayerFilter";

const CrossLayerFilter = compose(
    connect((state) => {
        return {
            attributes: state.query && state.query.typeName && state.query.featureTypes && state.query.featureTypes[state.query.typeName] && state.query.featureTypes[state.query.typeName].attributes,
            crossLayerExpanded: state.queryform.crossLayerExpanded,
            crossLayerFilterOptions: {
                layers: availableCrossLayerFilterLayersSelector(state),
                crossLayerFilter: crossLayerFilterSelector(state),
                ...(state.queryform.crossLayerFilterOptions || {})
            },
            searchUrl: state.query && state.query.url,
            featureTypeName: state.query && state.query.typeName
        };
    }, dispatch => {
        return {
            crossLayerFilterActions: bindActionCreators({
                expandCrossLayerFilterPanel: _expandCrossLayerFilterPanel,
                setCrossLayerFilterParameter: _setCrossLayerFilterParameter,
                addCrossLayerFilterField: _addCrossLayerFilterField,
                updateCrossLayerFilterField: _updateCrossLayerFilterField,
                removeCrossLayerFilterField: _removeCrossLayerFilterField,
                resetCrossLayerFilter: _resetCrossLayerFilter,
                toggleMenu: (rowId, status) => _toggleMenu(rowId, status,  "crossLayer")
            }, dispatch)
        };
    }),
    withProps(({ crossLayerFilterOptions, crossLayerFilterActions }) => ({
        ...crossLayerFilterOptions,
        ...crossLayerFilterActions
    })),
    crossLayerFilterEnhancer
)(CrossLayerFilterComponent);

export default CrossLayerFilter;
