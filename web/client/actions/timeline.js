const SELECT_TIME = "TIMELINE:SELECT_TIME";
const selectTime = (time) => ({type: SELECT_TIME, time});
const RANGE_CHANGED = "TIMELINE:RANGE_CHANGE";
const onRangeChanged = ({start, end}) => ({type: RANGE_CHANGED, start, end});

module.exports = {
    RANGE_CHANGED,
    onRangeChanged,
    SELECT_TIME,
    selectTime
};
