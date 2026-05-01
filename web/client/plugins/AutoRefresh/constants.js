export const CONTROL_NAME = "autorefresh";
export const AUTOREFRESH_STEP_INTERVAL_IN_SECONDS = 5;
export const AUTOREFRESH_MINIMUM_REFRESH_INTERVAL = 30000;
export const AUTOREFRESH_DEFAULT_REFRESH_INTERVAL = 60000;

export const generateAutorefreshLayerOptions = (interval) => ({
    autorefreshInterval: interval
});
