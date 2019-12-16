/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const { connect } = require('react-redux');
const { createSelector } = require('reselect');

const { getAttributeFields } = require('../../../utils/FeatureGridUtils');
const { getFilterRenderer } = require('../../../components/data/featuregrid/filterRenderers');
const { getWidgetAttributeFilter } = require('../../../selectors/widgets');

const getWidgetFilterRenderers = createSelector(
    (d, id) => ({describe: d, id}),
    ({describe, id}) =>
        describe ? getAttributeFields(describe).reduce( (prev, cur) => ({
            ...prev,
            [cur.name]: connect(
                createSelector(
                    (state) => getWidgetAttributeFilter(id, cur.name)(state),
                    (filter) => {
                        const value = filter && (filter.rawValue || filter.value);
                        return {value};
                    }
                ))(getFilterRenderer(cur.localType, {name: cur.name}))
        }), {}) : {});


module.exports = {getWidgetFilterRenderers};

