import { compose, withStateHandlers, defaultProps, withPropsOnChange } from 'recompose';
import propsStreamFactory from '../../components/misc/enhancers/propsStreamFactory';
import Rx from 'rxjs';
import { isEmpty } from 'lodash';
import { connect } from 'react-redux';
import { changeDrawingStatus } from '../../actions/draw';
import { error } from '../../actions/notifications';
import ConfigUtils from '../../utils/ConfigUtils';
import GeoFence from '../../api/geoserver/GeoFence';

const sameLayer = ({activeRule: f1}, {activeRule: f2}) => f1.layer === f2.layer;
const emitStop = stream$ => stream$.filter(() => false).startWith({});
import { getStylesAndAttributes } from '../../observables/rulesmanager';
import { gsInstancesDDListSelector } from '../../selectors/rulesmanager';
import { storeGSInstancesDDList } from '../../actions/rulesmanager';
const dataStreamFactory = prop$ => {
    return prop$.distinctUntilChanged((oP, nP) => sameLayer(oP, nP))
        .filter(({activeRule}) => activeRule.layer && activeRule.workspace)
        .switchMap(props => {
            const {
                activeRule,
                optionsLoaded,
                onError = () => {},
                setLoading,
                onExit,
                instances = [], // from gsInstancesDDListSelector
                handleStoreGSInstancesDDList
            } = props;

            const { workspace, layer, instance } = activeRule;

            setLoading(true);
            const geoFenceType = ConfigUtils.getDefaults().geoFenceServiceType;
            // in case non stand-alone geofence
            if (geoFenceType !== "geofence") {
                const {url} = ConfigUtils.getDefaults().geoFenceGeoServerInstance || {};
                return getStylesAndAttributes(layer, workspace, url).do(opts => optionsLoaded(opts))
                    .catch(() => {
                        setLoading(false);
                        onError({
                            title: "rulesmanager.errorTitle",
                            message: "rulesmanager.errorLoading"
                        });
                        return Rx.Observable.of({});
                    })
                    .do(() => setLoading(false));
            }
            // in case stand-alone geofence
            // if no GS instance is selected — nothing to load
            if (!instance?.id) {
                setLoading(false);
                return Rx.Observable.of({});
            }
            const instancesLoaded = instances.length > 0;
            // if already instances list loaded, proceed directly
            if (instancesLoaded) {
                const ruleInstance = instances.find(inst => inst.id === instance.id);
                const urlService = ruleInstance?.url || "";
                return getStylesAndAttributes(layer, workspace, urlService)
                    .do(opts => optionsLoaded(opts))
                    .catch(() => {
                        setLoading(false);
                        onError({
                            title: "rulesmanager.errorTitle",
                            message: "rulesmanager.errorLoading"
                        });
                        return Rx.Observable.of({});
                    })
                    .do(() => setLoading(false));
            }
            // Otherwise, fetch instances and wait
            setLoading(true);

            return Rx.Observable.fromPromise(
                GeoFence.getGSInstancesForDD()
                    .then(response => {
                        handleStoreGSInstancesDDList(response.data);
                        return response.data;
                    })
                    .catch(() => {
                        throw new Error("Failed to load GS instances");
                    })
            )
                .switchMap(fetchedInstances => {
                    const ruleInstance = fetchedInstances.find(inst => inst.id === instance.id);
                    const urlService = ruleInstance?.url || "";

                    return getStylesAndAttributes(layer, workspace, urlService)
                        .do(opts => optionsLoaded(opts))
                        .catch(() => {
                            setLoading(false);
                            onError({
                                title: "rulesmanager.errorTitle",
                                message: "rulesmanager.errorLoading"
                            });
                            return Rx.Observable.of({});
                        })
                        .do(() => setLoading(false));
                })
                .catch(() => {
                    setLoading(false);
                    onError({
                        title: "rulesmanager.errorTitle",
                        message: "rulesmanager.errorLoadingGSInstances"
                    });
                    onExit();
                    return Rx.Observable.of({});
                });
        })
        .let(emitStop);
};

export default compose(connect((state) => ({gsInstancesList: gsInstancesDDListSelector(state)}), {
    onChangeDrawingStatus: changeDrawingStatus,
    onError: error,
    handleStoreGSInstancesDDList: storeGSInstancesDDList
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
