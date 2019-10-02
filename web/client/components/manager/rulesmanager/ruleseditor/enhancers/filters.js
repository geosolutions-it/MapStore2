/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const {compose, withStateHandlers, withPropsOnChange} = require("recompose");
const {connect} = require("react-redux");
const {changeDrawingStatus} = require("../../../../../actions/draw");
const {geometryStateSel} = require("../../../../../selectors/rulesmanager");
const {error} = require("../../../../../actions/notifications");
module.exports = compose(
    connect(state => ({geometryState: geometryStateSel(state)}), {onChangeDrawingStatus: changeDrawingStatus, onError: error}),
    withStateHandlers(({constraints = {}}) => {
        const {restrictedAreaWkt: wkt} = constraints;
        return {
            mapActive: wkt && wkt.length > 0,
            spatialField: {}
        };
    },
    {
        toggleMap: (state, {onChangeDrawingStatus}) => (isActive) => {
            if (!isActive) {
                onChangeDrawingStatus( "clean",
                    "",
                    "rulesmanager",
                    [],
                    {});
                return {
                    mapActive: isActive,
                    spatialField: {}
                };
            }
            return {
                mapActive: isActive
            };
        },
        onSelectSpatialMethod: ({spatialField}) => (method, name) => (
            {spatialField: {...spatialField, [name]: method}}
        ),
        onMapReady: (state, {geometryState = {}, spatialField = {}, onChangeDrawingStatus}) => () => {
            if (geometryState.geometry && geometryState.geometry.coordinates) {
                onChangeDrawingStatus( "create",
                    "MultiPolygons",
                    "rulesmanager",
                    [geometryState.geometry],
                    {});
                return {spatialField: {...spatialField, method: "Polygon"}};
            }
            return {};
        }
    }),
    withPropsOnChange("toggleMap", ({toggleMap, onSelectSpatialMethod, onError, onChangeDrawingStatus}) => ({
        actions: {
            onChangeDrawingStatus,
            onExpandSpatialFilterPanel: toggleMap,
            onSelectSpatialMethod,
            onError
        }
    })),
    withPropsOnChange(["spatialField", "geometryState", "constraints"], ({spatialField = {}, geometryState = {}, constraints = {}}) => {
        const {restrictedAreaWkt: wkt} = constraints;
        return {spatialField: {...geometryState, ...spatialField, wkt}};
    })
);
