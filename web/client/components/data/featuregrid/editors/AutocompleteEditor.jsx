const React = require('react');
const PropTypes = require('prop-types');
const {isArray} = require('lodash');
const AttributeEditor = require('./AttributeEditor');
const PagedCombobox = require('../../../misc/PagedCombobox');
const {setObservableConfig, mapPropsStreamWithConfig, compose, withStateHandlers} = require('recompose');
const rxjsConfig = require('recompose/rxjsObservableConfig').default;
setObservableConfig(rxjsConfig);
const mapPropsStream = mapPropsStreamWithConfig(rxjsConfig);
const {createPagedUniqueAutompleteStream} = require('../../../../observables/autocomplete');

const parsers = {
    "int": v => valueOf(v),
    "number": v => valueOf(v),
    "string": v => v
};

class AutocompleteEditor extends AttributeEditor {
    static propTypes = {
        column: PropTypes.object,
        dataType: PropTypes.string,
        inputProps: PropTypes.object,
        isValid: PropTypes.func,
        onBlur: PropTypes.func,
        url: PropTypes.string,
        typeName: PropTypes.string,
        value: PropTypes.string
    };
    static defaultProps = {
        isValid: () => true,
        dataType: "string"
    };
    constructor(props) {
        super(props);
        this.validate = (value) => {
            try {
                if (parsers[this.props.dataType] || parsers.string) {
                    return this.props.isValid(value[this.props.column && this.props.column.key]);
                }
            } catch (e) {
                return false;
            }
        };
        this.getValue = () => {
            const updated = super.getValue();
            return updated;
        };
    }
    /*
    TODO use stream to populate props and use set state instead of props
    hoc per passare valore da render a get value???????????
    */
    render() {
        // fetch data from wps service
        const autocompleteEnhancer = mapPropsStream(props$ => {
            const fetcherStream = createPagedUniqueAutompleteStream(props$);
            return fetcherStream.combineLatest(props$, (data, {value, open}) => ({
                data: isArray(data && data.fetchedData && data.fetchedData.values) ? data.fetchedData.values.map(v => {return {label: v, value: v}; }) : [],
                valuesCount: data && data.fetchedData && data.fetchedData.size,
                currentPage: data && data.props && data.props.currentPage,
                maxFeatures: data && data.props && data.props.maxFeatures,
                select: data && data.props && data.props.select,
                focus: data && data.props && data.props.focus,
                loadNextPage: data && data.props && data.props.loadNextPage,
                loadPrevPage: data && data.props && data.props.loadPrevPage,
                toggle: data && data.props && data.props.toggle,
                change: data && data.props && data.props.change,
                open,
                selected: data && data.props && data.props.selected,
                value,
                busy: data.busy
            }));
        });

        // component enhanced with props from stream, store, and local state
        const AutocompleteEnhanced = autocompleteEnhancer(
            ({ open, toggle, select, focus, change, value, valuesCount,
            loadNextPage, loadPrevPage, maxFeatures, currentPage,
            busy, data, loading = false }) => {
                const numberOfPages = Math.ceil(valuesCount / maxFeatures);
                return (<PagedCombobox
                    pagination={{firstPage: currentPage === 1, lastPage: currentPage === numberOfPages, paginated: true, loadPrevPage, loadNextPage}}
                    busy={busy} dropUp={false} data={data} open={open}
                    onFocus={focus} onToggle={toggle} onChange={change} onSelect={select}
                    selectedValue={value} loading={loading}/>);
            });

        // state enhancer for local props
        const addStateHandlers = compose(
            withStateHandlers((props) => ({
                delayDebounce: 0,
                performFetch: false,
                open: false,
                currentPage: 1,
                maxFeatures: 5,
                url: this.props.url,
                typeName: this.props.typeName,
                value: this.props.value,
                attribute: this.props.column && this.props.column.key,
                props
            }), {
                select: (state) => () => ({
                    ...state,
                    selected: true
                }),
                change: (state) => (v) => {
                    if (state.selected && state.changingPage) {
                        return ({
                            ...state,
                            delayDebounce: state.selected ? 0 : 1000,
                            selected: false,
                            changingPage: false,
                            performFetch: state.selected && !state.changingPage ? false : true,
                            value: state.value,
                            currentPage: !state.changingPage ? 1 : state.currentPage
                        });
                    }
                    return ({
                        ...state,
                        delayDebounce: state.selected ? 0 : 1000,
                        selected: false,
                        changingPage: false,
                        performFetch: state.selected && !state.changingPage ? false : true,
                        value: state.selected ? v.value : v,
                        currentPage: !state.changingPage ? 1 : state.currentPage
                    });
                },
                focus: (state) => (options) => {
                    if (options && options.length === 0 && state.value === "") {
                        return ({
                            ...state,
                            delayDebounce: 0,
                            currentPage: 1,
                            performFetch: true,
                            isToggled: false,
                            open: true
                        });
                    }
                    return (state);
                },
                toggle: (state) => () => ({
                    ...state,
                    open: state.changingPage ? true : !state.open
                }),
                loadNextPage: (state) => () => ({
                    ...state,
                    currentPage: state.currentPage + 1,
                    performFetch: true,
                    changingPage: true,
                    delayDebounce: 0,
                    value: state.value
                }),
                loadPrevPage: (state) => () => ({
                    ...state,
                    currentPage: state.currentPage - 1,
                    performFetch: true,
                    changingPage: true,
                    delayDebounce: 0,
                    value: state.value
                })
            })
        );
        const EnhancedPagedCombobox = addStateHandlers(AutocompleteEnhanced);
        return <EnhancedPagedCombobox/>;
    }
}

module.exports = AutocompleteEditor;
