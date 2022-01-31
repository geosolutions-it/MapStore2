import {Style, Stroke, Fill} from 'ol/style';

export const CONTROL_NAME = "TimeSeriesPlots";

export const MOUSEMOVE_EVENT = 'mousemove';

export const TIME_SERIES_POINT_SELECTIONS_LAYER = "time_series_point_selections";
export const TIME_SERIES_POLYGON_SELECTIONS_LAYER = "time_series_polygon_selections";
export const TIME_SERIES_SELECTIONS_LAYER = "time_series_selections_layer";

export const TIME_SERIES_VECTOR_LAYER_NAMES = ["ale:in_sar_dataset"];

//../product/assets/img/marker-icon-red.png
import iconUrl from '../../product/assets/img/marker-icon-red.png';
import shadowUrl from '../../product/assets/img/marker-shadow.png';

export const DEFAULT_ICON_STYLE = {
    iconUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
};


export const DEFAULT_POLYGON_STYLE = {
    stroke: new Stroke({
        color: 'blue',
        width: 1
    }),
    fill: new Fill({
        color: 'blue'
    })        
};

export const getDefaultPolygonStyle = () => new Style(DEFAULT_POLYGON_STYLE);

export const SELECTION_TYPES = {
    /** disabling circle selection util I know how to do it*/
    //CIRCLE: "CIRCLE",
    POINT: "POINT",
    POLYGON: "POLYGON",
    CLEAR_ALL_SELECTIONS: "CLEAR_ALL_SELECTIONS"
};

export const AGGREGATE_OPERATIONS = [
    { value: "Count", label: "widgets.operations.COUNT"},
    { value: "Sum", label: "widgets.operations.SUM"},
    { value: "Average", label: "widgets.operations.AVG"},
    { value: "StdDev", label: "widgets.operations.STDDEV"},
    { value: "Min", label: "widgets.operations.MIN"},
    { value: "Max", label: "widgets.operations.MAX"}
];