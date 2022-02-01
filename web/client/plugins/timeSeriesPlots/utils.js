import { DEFAULT_SELECTIONS_STYLE } from './constants';
import uuid from 'uuid';

export const getTSSelectionsStyle = (color, type) => color ? {
    ...DEFAULT_SELECTIONS_STYLE,
    ...(type === 'Point' ? {
        weight: 5,
        radius: 8,
    } : {}),
    fillColor: color,
    color
} : DEFAULT_SELECTIONS_STYLE;

export const pointToFeature = (pointObj) => {
    const { lng, lat } = pointObj.latlng;
    return ({
        id: uuid.v1(),
        type: "Point",
        coordinates: [lng, lat],
        center:  [lng, lat],
        style: {},
        projection: "EPSG:4326"
    });
};

export const makeFeatureFromGeometry = (selectionGeometry, selectionColor) => {
    const { type, coordinates, id, projection } = selectionGeometry;
     return {
        type: "Feature",
        geometry: {
            type,
            coordinates
        },
        properties: {
            id,
            projection,
        },
        style: getTSSelectionsStyle(selectionColor, type)
    };
};