import { compose, withStateHandlers, defaultProps, withPropsOnChange } from 'recompose';
import propsStreamFactory from '../../components/misc/enhancers/propsStreamFactory';
import Rx from 'rxjs';
import { isEmpty } from 'lodash';
import { connect } from 'react-redux';
import { changeDrawingStatus } from '../../actions/draw';
import { error } from '../../actions/notifications';

const sameLayer = ({activeRule: f1}, {activeRule: f2}) => f1.layer === f2.layer;
const emitStop = stream$ => stream$.filter(() => false).startWith({});
import { getStylesAndAttributes } from '../../observables/rulesmanager';
const dataStreamFactory = prop$ => {
    return prop$.distinctUntilChanged((oP, nP) => sameLayer(oP, nP))
        .filter(({activeRule}) => activeRule.layer && activeRule.workspace)
        .switchMap(({activeRule, optionsLoaded, onError = () => {}, setLoading}) => {
            const {workspace, layer} = activeRule;
            setLoading(true);
            return getStylesAndAttributes(layer, workspace).do(opts => optionsLoaded(opts))
                .catch(() => {
                    setLoading(false);
                    return Rx.Observable.of(onError({
                        title: "rulesmanager.errorTitle",
                        message: "rulesmanager.errorLoading"
                    }));
                }).do(() => setLoading(false));
        }).let(emitStop);
};

export default compose(connect(() => ({}), {
    onChangeDrawingStatus: changeDrawingStatus,
    onError: error
}),
defaultProps({dataStreamFactory}),
withStateHandlers(({activeRule: initRule}) => ({
    activeRule: initRule,
    initRule,
    activeEditor: "1",
    styles: [],
    properties: []
}), {
    setOption: ({activeRule}) => ({key, value}) => {
        // Add some reference logic here
        if (key === "workspace") {
            const {layer, workspace, constraints, ...newActive} = activeRule;
            const l = !value ? {layer} : {};
            return {
                activeRule: { ...newActive, workspace: value, ...l},
                styles: [],
                properties: [],
                type: undefined,
                layer: undefined
            };
        } else if (key === "layer") {
            const {layer, constraints, ...newActive} = activeRule;
            return {activeRule: { ...newActive, layer: value}};
        } else if (key === "service") {
            const {request, service, ...newActive} = activeRule;
            return {activeRule: {...newActive, service: value}};
        } else if (key === "instance") {
            return {activeRule: {...activeRule, [key]: value, workspace: undefined, layer: undefined}};
        } else if (!value) {
            const {[key]: omit, ...newActive} = activeRule;
            return {activeRule: newActive};
        }
        return {
            activeRule: {...activeRule, [key]: value}
        };
    },
    setRule: () => (activeRule) => ({activeRule}),
    setConstraintsOption: ({activeRule, type}) => ({key, value}) => {
        const constraints = {...(activeRule.constraints || {}), type, [key]: value};
        return {activeRule: {...activeRule, constraints}};
    },
    onNavChange: () => activeEditor => ({
        activeEditor
    }),
    cleanConstraints: ({activeRule}, {onChangeDrawingStatus}) => (keepLayer) => {
        const {constraints, ...rule} = activeRule;
        onChangeDrawingStatus( "clean",
            "",
            "rulesmanager",
            [],
            {});
        return keepLayer && {activeRule: rule} || {activeRule: rule, styles: undefined, properties: undefined, type: undefined, layer: undefined};
    },
    optionsLoaded: () => ({styles, properties, type, layer}) => {
        return {styles, properties, type, layer};
    }
}), // Merge geometry state from draw into activeRule
withPropsOnChange(["geometryState"], ({activeRule = {}, geometryState, setRule}) => {
    if (!isEmpty(geometryState)) {
        const {constraints = {}} = activeRule;
        setRule({...activeRule, constraints: {...constraints, restrictedAreaWkt: geometryState.wkt}});
    }
    return {};
}),
propsStreamFactory
);
