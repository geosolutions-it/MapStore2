/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { compose, withStateHandlers, withPropsOnChange } from 'recompose';
import propsStreamFactory from '../../../components/misc/enhancers/propsStreamFactory';
import { isEmpty } from 'lodash';
import { connect } from 'react-redux';
import { changeDrawingStatus } from '../../../actions/draw';
import { error } from '../../../actions/notifications';

export default compose(connect(() => ({}), {
    onChangeDrawingStatus: changeDrawingStatus,
    onError: error
}),
withStateHandlers(({activeGSInstance: initGSInstance}) => ({
    activeGSInstance: initGSInstance,
    initGSInstance,
    activeEditor: "1"
}), {
    setOption: ({activeGSInstance}) => ({key, value}) => {
        if (!value) {
            const {[key]: omit, ...newActive} = activeGSInstance;
            return {activeGSInstance: newActive};
        }
        return {
            activeGSInstance: {...activeGSInstance, [key]: value}
        };
    },
    setGSInstance: () => (activeGSInstance) => ({activeGSInstance}),
    onNavChange: () => activeEditor => ({
        activeEditor
    }),
    optionsLoaded: () => ({styles, properties, type, layer}) => {
        return {styles, properties, type, layer};
    }
}), // Merge geometry state from draw into activeGSInstance
withPropsOnChange(["geometryState"], ({activeGSInstance = {}, geometryState, setGSInstance}) => {
    if (!isEmpty(geometryState)) {
        setGSInstance({...activeGSInstance});
    }
    return {};
}),
propsStreamFactory
);
