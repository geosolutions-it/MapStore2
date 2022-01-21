export const CONTROL_NAME = "TimeSeriesPlots";

export const MOUSEMOVE_EVENT = 'mousemove';

export const TIME_SERIES_VECTOR_LAYER_NAMES = ["ale:in_sar_dataset"];

export const SELECTION_TYPES = {
    /** disabling circle selection util I know how to do it*/
    //CIRCLE: "CIRCLE",
    POINT: "POINT",
    POLYGON: "POLYGON",
};

export const AGGREGATE_OPERATIONS = [
    { value: "Count", label: "widgets.operations.COUNT"},
    { value: "Sum", label: "widgets.operations.SUM"},
    { value: "Average", label: "widgets.operations.AVG"},
    { value: "StdDev", label: "widgets.operations.STDDEV"},
    { value: "Min", label: "widgets.operations.MIN"},
    { value: "Max", label: "widgets.operations.MAX"}
];