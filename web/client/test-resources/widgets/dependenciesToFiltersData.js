/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * input data for filters
 */

export const inputFilterObjSpatial = {
    spatialField: {
        "operation": "INTERSECTS",
        "attribute": "geometry",
        "geometry": {
            "type": "Polygon",
            "projection": "EPSG:4326",
            "coordinates": [[[1, 1], [1, 2], [2, 2], [2, 1], [1, 1]]]
        }
    }
};
export const inputQuickFiltersStateAbbr = {
    state_abbr: {
        rawValue: "I",
        value: "I",
        operator: "ilike",
        type: "string",
        attribute: "state_abbr"
    }
};
export const inputLayerFilterSTATENAME = {
    featureTypeName: 'topp:states',
    groupFields: [
        {
            id: 1,
            logic: 'OR',
            index: 0
        }
    ],
    filterFields: [
        {
            rowId: 1579190187701,
            groupId: 1,
            attribute: 'STATE_NAME',
            operator: 'ilike',
            value: 'i',
            type: 'string',
            fieldOptions: {
                valuesCount: 49,
                currentPage: 1
            },
            exception: null,
            loading: false,
            openAutocompleteMenu: false,
            options: {
                STATE_NAME: [
                    'Alabama',
                    'Arizona',
                    'Arkansas',
                    'California',
                    'Colorado'
                ]
            }
        }
    ],
    spatialField: {
        method: null,
        operation: 'INTERSECTS',
        geometry: null,
        attribute: 'the_geom'
    },
    pagination: null,
    filterType: 'OGC',
    ogcVersion: '1.1.0',
    sortOptions: null,
    crossLayerFilter: null,
    hits: false
};

/**
 * output data for filters
 */

export const resultFilterObjRes1 =
    "<ogc:Filter><ogc:And><ogc:Intersects>"
        + "<ogc:PropertyName>geometry</ogc:PropertyName>"
        + "<gml:Polygon srsName=\"EPSG:4326\"><gml:exterior><gml:LinearRing><gml:posList>1 1 1 2 2 2 2 1 1 1</gml:posList></gml:LinearRing></gml:exterior></gml:Polygon>"
    + "</ogc:Intersects></ogc:And></ogc:Filter>";
export const resultMergeFilterRes =
    '<ogc:Filter><ogc:And>'
        + '<ogc:Intersects>'
            + '<ogc:PropertyName>geometry</ogc:PropertyName><gml:Polygon srsName="EPSG:4326"><gml:exterior><gml:LinearRing><gml:posList>1 1 1 2 2 2 2 1 1 1</gml:posList></gml:LinearRing></gml:exterior></gml:Polygon>'
        + '</ogc:Intersects>'
        + '<ogc:Intersects>'
    + '<ogc:PropertyName>geometry</ogc:PropertyName><gml:Polygon srsName="EPSG:4326"><gml:exterior><gml:LinearRing><gml:posList>-1 -1 -1 1 1 1 1 -1 -1 -1</gml:posList></gml:LinearRing></gml:exterior></gml:Polygon>'
        + '</ogc:Intersects>'
    + '</ogc:And></ogc:Filter>';
export const resultMergeFilterCQLRes =
    '<ogc:Filter><ogc:And>'
    + '<ogc:PropertyIsEqualTo><ogc:PropertyName>prop</ogc:PropertyName><ogc:Literal>value</ogc:Literal></ogc:PropertyIsEqualTo>'
    + '<ogc:Intersects>'
    + '<ogc:PropertyName>geometry</ogc:PropertyName><gml:Polygon srsName="EPSG:4326"><gml:exterior><gml:LinearRing><gml:posList>1 1 1 2 2 2 2 1 1 1</gml:posList></gml:LinearRing></gml:exterior></gml:Polygon>'
    + '</ogc:Intersects>'
    + '<ogc:Intersects>'
    + '<ogc:PropertyName>geometry</ogc:PropertyName><gml:Polygon srsName="EPSG:4326"><gml:exterior><gml:LinearRing><gml:posList>-1 -1 -1 1 1 1 1 -1 -1 -1</gml:posList></gml:LinearRing></gml:exterior></gml:Polygon>'
    + '</ogc:Intersects>'
    + '</ogc:And></ogc:Filter>';
export const resultFilterOnly = `<ogc:Filter><ogc:And><ogc:And><ogc:Or><ogc:PropertyIsLike matchCase="false" wildCard="*" singleChar="." escapeChar="!"><ogc:PropertyName>STATE_NAME</ogc:PropertyName><ogc:Literal>*i*</ogc:Literal></ogc:PropertyIsLike></ogc:Or><ogc:And><ogc:PropertyIsLike matchCase="false" wildCard="*" singleChar="." escapeChar="!"><ogc:PropertyName>state_abbr</ogc:PropertyName><ogc:Literal>*I*</ogc:Literal></ogc:PropertyIsLike></ogc:And></ogc:And></ogc:And></ogc:Filter>`;
export const resultQuickFilters = `<ogc:Filter><ogc:And><ogc:And><ogc:And><ogc:PropertyIsLike matchCase="false" wildCard="*" singleChar="." escapeChar="!"><ogc:PropertyName>state_abbr</ogc:PropertyName><ogc:Literal>*I*</ogc:Literal></ogc:PropertyIsLike></ogc:And></ogc:And></ogc:And></ogc:Filter>`;
export const resultQuickFiltersAndDependenciesQF = `<ogc:Filter><ogc:And><ogc:And><ogc:And><ogc:PropertyIsLike matchCase="false" wildCard="*" singleChar="." escapeChar="!"><ogc:PropertyName>state_abbr</ogc:PropertyName><ogc:Literal>*I*</ogc:Literal></ogc:PropertyIsLike></ogc:And></ogc:And></ogc:And></ogc:Filter>`;
export const resultQuickFiltersAndDependenciesFilter = `<ogc:Filter><ogc:And><ogc:And><ogc:And><ogc:PropertyIsLike matchCase="false" wildCard="*" singleChar="." escapeChar="!"><ogc:PropertyName>state_abbr</ogc:PropertyName><ogc:Literal>*I*</ogc:Literal></ogc:PropertyIsLike></ogc:And></ogc:And></ogc:And></ogc:Filter>`;

export const resultSpatialAndQuickFilters = `<ogc:Filter><ogc:And><ogc:And><ogc:And><ogc:PropertyIsLike matchCase="false" wildCard="*" singleChar="." escapeChar="!"><ogc:PropertyName>state_abbr</ogc:PropertyName><ogc:Literal>*I*</ogc:Literal></ogc:PropertyIsLike></ogc:And></ogc:And><ogc:Intersects><ogc:PropertyName>geometry</ogc:PropertyName><gml:Polygon srsName="EPSG:4326"><gml:exterior><gml:LinearRing><gml:posList>1 1 1 2 2 2 2 1 1 1</gml:posList></gml:LinearRing></gml:exterior></gml:Polygon></ogc:Intersects></ogc:And></ogc:Filter>`;

