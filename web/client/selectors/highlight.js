const {get} = require('lodash');
const {createSelector} = require('reselect');
const {reprojectGeoJson} = require('../utils/CoordinatesUtils');

const selectedFeatures = (state) => get(state, state && state.highlight && state.highlight.featuresPath || "highlight.emptyFeatures") || [];
const filteredspatialObject = (state) => get(state, state && state.featuregrid && state.featuregrid.open && state.featuregrid.showFilteredObject && "query.filterObj.spatialField" || "emptyObject");
const filteredGeometry = (state) => filteredspatialObject(state) && filteredspatialObject(state).geometry;
const filteredspatialObjectType = (state) => filteredGeometry(state) && filteredGeometry(state).type || "Polygon";
const filteredspatialObjectCoord = (state) => filteredGeometry(state) && filteredGeometry(state).coordinates || [];
const filteredSpatialObjectCrs = (state) => filteredGeometry(state) && filteredGeometry(state).projection || "EPSG:3857";
const filteredSpatialObjectId = (state) => filteredGeometry(state) && filteredGeometry(state).id || "spatial_object";
const filteredFeatures = createSelector(
    [
        filteredspatialObjectCoord,
        filteredspatialObjectType,
        filteredSpatialObjectId,
        filteredSpatialObjectCrs
    ],
    ( geometryCoordinates, geometryType, geometryId, geometryCrs) => {
        let geometry = {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    geometry: {
                        type: geometryType,
                        coordinates: geometryCoordinates
                    },
                    style: {
                        fillColor: '#FFFFFF',
                        fillOpacity: '0.2',
                        color: '#ffcc33'
                    },
                    id: geometryId
                }
            ]
        };
        return geometryCoordinates.length > 0 && geometryType ? reprojectGeoJson(geometry, geometryCrs, 'EPSG:4326').features : [];
    }

);

const highlighedFeatures = createSelector(
    [
        filteredFeatures,
        selectedFeatures
    ],
    (featuresFiltered, featuresSelected) => [ ...featuresSelected, ...featuresFiltered]
);

module.exports = {
    selectedFeatures, filteredFeatures, filteredSpatialObjectId, filteredSpatialObjectCrs, filteredspatialObjectCoord,
    filteredspatialObjectType, filteredGeometry, filteredspatialObject, highlighedFeatures
};
