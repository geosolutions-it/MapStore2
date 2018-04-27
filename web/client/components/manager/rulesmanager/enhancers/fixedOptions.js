const { compose, withStateHandlers, defaultProps, renameProp} = require('recompose');
const propsStreamFactory = require('../../../misc/enhancers/propsStreamFactory');
const {isObject} = require("lodash");
const stop = stream$ => stream$.filter(() => false);

const sameParentFilter = ({parentsFilter: f1}, {parentsFilter: f2}) => f1 === f2;

// ParentsFilter change so resets the data
const resetStream = prop$ => prop$.distinctUntilChanged((oP, nP) => sameParentFilter(oP, nP)).skip(1).do(({resetCombo}) => resetCombo()).let(stop);


const dataStreamFactory = prop$ => {
    return resetStream(prop$).startWith({busy: false});
};

module.exports = compose(
    defaultProps({
        stopPropagation: true,
        emitOnReset: false,
        paginated: false,
        parentsFilter: {},
        filter: "startsWith",
        dataStreamFactory,
        onValueSelected: () => {},
        onError: () => {},
        loadingErroMsg: "",
        data: []
    }),
    withStateHandlers(({paginated, selected}) => ({
        val: selected,
        pagination: {
            paginated: paginated,
            firstPage: false,
            lastPage: false,
            loadPrevPage: () => {},
            loadNextPage: () => {}
        }}), {
        resetCombo: (state, {emitOnReset, onValueSelected}) => () => {
            if (emitOnReset) {
                onValueSelected();
            }
            return {
                val: undefined,
                select: undefined
        }; },
        onChange: () => (val = "") => {
            return {val};
        },
        onToggle: ({ val = ""}, {selected, onValueSelected}) => (open) => {
            if (!open && val === "" && selected) {
                onValueSelected();
            }else if (!open && val !== selected) {
                return {val: selected};
            }
        },
        onSelect: (state, {onValueSelected, selected, valueField}) => (select) => {
            const selectedVal = isObject(select) && select[valueField] || select;
            if (selectedVal !== selected) {
                onValueSelected(selectedVal);
            }
        }
    }),
    propsStreamFactory,
    renameProp("val", "selectedValue")
);
