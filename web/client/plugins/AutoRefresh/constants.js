export const CONTROL_NAME = "autorefresh";
export const AUTOREFRESH_STEP_INTERVAL_IN_SECONDS = 5;
export const AUTOREFRESH_MINIMUM_REFRESH_INTERVAL = 30000;
export const AUTOREFRESH_DEFAULT_REFRESH_INTERVAL = 60000;

export const generateAutorefreshLayerOptions = (interval) => ({
    autorefreshInterval: interval
});

export const formatDate = (timestamp) => {
    if (!timestamp) {
        return null;
    }

    const date = new Date(timestamp);

    const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: new Intl.DateTimeFormat().resolvedOptions().timeZone
    };
    return `(${date.toLocaleString(navigator.language, options)})`;
};
