const { compose, withStateHandlers, defaultProps, withProps} = require('recompose');
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
        clearable: true,
        stopPropagation: true,
        emitOnReset: false,
        paginated: false,
        parentsFilter: {},
        filter: "startsWith",
        textField: "label",
        valueField: "value",
        dataStreamFactory,
        onValueSelected: () => {},
        onError: () => {},
        loadingErrorMsg: "",
        data: []
    }),
    withStateHandlers(({paginated, selected}) => ({
        val: selected,
        typing: false,
        stopChange: false,
        pagination: {
            paginated: paginated,
            firstPage: false,
            lastPage: false,
            loadPrevPage: () => {},
            loadNextPage: () => {}
        }}), {
        resetCombo: () => () => {
            return {
                val: undefined
            };
        },
        onReset: ({typing}, {onValueSelected, selected}) => () => {
            if (selected) {
                onValueSelected();
            }
            if (typing) {
                return {typing: false};
            }
            return {};
        },
        onChange: ({stopChange}, {valueField}) => (val = "") => {

            if (stopChange) {
                return {stopChange: false};
            }
            const currentVal = isObject(val) && val[valueField] || val;
            return {val: currentVal, typing: true};
        },
        onToggle: ({ val = ""}, {clearable, selected, onValueSelected}) => (open) => {
            if (!clearable && !open && val === "" && selected) {
                onValueSelected();
                return {typing: false};
            } else if (!open && val !== selected) {
                return {val: selected, typing: false};
            }
            return {};
        },
        onSelect: (state, {onValueSelected, selected, valueField}) => (select) => {
            const selectedVal = isObject(select) && select[valueField] || select;
            if (selectedVal !== selected) {
                onValueSelected(selectedVal);
            }
            return {stopChange: true};
        }
    }
    ),
    propsStreamFactory,
    withProps(({val = "", selected = "", typing}) => {
        return {selectedValue: typing ? val : selected};
    })
);
