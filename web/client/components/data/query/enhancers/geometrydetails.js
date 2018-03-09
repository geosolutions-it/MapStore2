/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const {compose, createEventHandler, defaultProps} = require('recompose');

const propsStreamFactory = require('../../../misc/enhancers/propsStreamFactory');


const dataStreamFactory = $props => {
    const {handler: onChangeDrawingStatus, stream: onChangeDrawingStatus$} = createEventHandler();
    return $props.map(o => ({...o, onChangeDrawingStatus$ })).switchMap(({onChangeDrawingStatus$: stream$, onChangeDrawingStatus: action}) => stream$.debounceTime(1000).map(({geometry}) => action("replace", undefined, "queryform", geometry)))
    .startWith({}).map( o => ({...o, onChangeDrawingStatus}));
};


module.exports = compose(
    defaultProps({
        dataStreamFactory
    }),
    propsStreamFactory);
