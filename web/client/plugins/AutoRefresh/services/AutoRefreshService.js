import { AUTOREFRESH_DEFAULT_INTERVAL_IN_SEC } from "../constants";

let isOn = false;
let lastUpdated = null;
let intervalId = null;
let intervalInSecond = AUTOREFRESH_DEFAULT_INTERVAL_IN_SEC;
const activeLayers = {};

const doUpdateLayers = () => {
    Object.values(activeLayers).forEach(layer => {
        console.debug('[arxit] doUpdateLayer', layer.id, layer);
    });

    lastUpdated = new Date();
};

const updateActiveLayer = (layer) => {
    if (layer.autorefresh?.enabed) {
        activeLayers[layer.id] = layer;
    } else {
        delete activeLayers[layer.id];
    }
};

const setActiveLayers = (layers) => {
    layers.forEach(l => {
        updateActiveLayer(l);
    });
};

const start = () => {
    intervalId = setInterval(doUpdateLayers, intervalInSecond * 1000);
};

const stop = () => {
    clearInterval(intervalId);
    intervalId = null;
};

const updateIntervalInSec = (interval) => {
    if (isOn) {
        stop();
        intervalInSecond = interval;
        start();
    } else {
        intervalInSecond = interval;
    }
};

const onLastUpdated = (callback) => {
    callback(lastUpdated);
};

const getIsOn = () => {
    return isOn;
};

const activate = (shouldActivate) => {
    isOn = shouldActivate;
    updateIntervalInSec(intervalInSecond);
};

export default {
    activate,
    getIsOn,
    onLastUpdated,
    updateIntervalInSec,
    setActiveLayers
};

