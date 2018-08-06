const SELECT_TIME = "TIMELINE:SELECT_TIME";
const selectTime = (time) => ({type: SELECT_TIME, time});
const RANGE_CHANGED = "TIMELINE:RANGE_CHANGE";
const onRangeChanged = ({start, end}) => ({type: RANGE_CHANGED, start, end});
const RANGE_DATA_LOADED = "TIMELINE:RANGE_DATA_LOADED";
const rangeDataLoaded = (layerId, range, histogram, domain) => ({ type: RANGE_DATA_LOADED, layerId, range, histogram, domain});

const LOADING = "TIMELINE:LOADING";
const timeDataLoading = (layerId, loading) => ({ type: LOADING, layerId, loading});
module.exports = {
    RANGE_CHANGED,
    onRangeChanged,
    SELECT_TIME,
    selectTime,
    RANGE_DATA_LOADED,
    rangeDataLoaded,
    LOADING,
    timeDataLoading
};
