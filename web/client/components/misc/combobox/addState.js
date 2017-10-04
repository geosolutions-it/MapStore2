const {compose, withStateHandlers} = require('recompose');

const addState = compose(
    withStateHandlers((props) => ({
        open: false,
        currentPage: 1,
        value: props.value,
        data: props.data,
        textValue: props.textValue,
        textLabel: props.textLabel
    }), {
        select: (state) => () => ({
            ...state,
            selected: true
        }),
        change: (state) => (v) => {
            if (state.selected && state.changingPage) {
                return ({
                    ...state,
                    selected: false,
                    changingPage: false,
                    value: state.value,
                    currentPage: !state.changingPage ? 1 : state.currentPage
                });
            }
            const value = typeof v === "string" ? v : v.value;
            return ({
                ...state,
                selected: false,
                changingPage: false,
                value: value,
                currentPage: !state.changingPage ? 1 : state.currentPage
            });
        },
        focus: (state) => (options) => {
            if (options && options.length === 0 && state.value === "") {
                return ({
                    ...state,
                    currentPage: 1,
                    isToggled: false,
                    open: true
                });
            }
            return (state);
        },
        toggle: (state) => () => ({
            ...state,
            open: state.changingPage ? true : !state.open
        })
    })
);


module.exports = addState;
