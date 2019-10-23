/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Rx = require('rxjs');
const {castArray} = require('lodash');
const start = (stream$, actions = []) => stream$
    .startWith(...actions);
/**
 * wraps an epic with start/stop action. Useful shortcut for loading actions.
 * Accepts also an exception stream, that gets error before to emit loading stop.
 * @memberof observables.epics
 * @param {object|object[]} startAction start action(s)
 * @param {object|object[]} endAction end action(s)
 * @param {function} exception an optional function that returns the stream for exceptions
 */
const wrapStartStop = (startAction, endAction, createExceptionStream) => stream$ =>
    (createExceptionStream ?
        start(stream$, castArray(startAction))
            .catch(createExceptionStream)
        : start(stream$, castArray(startAction))
    ).concat(
        Rx.Observable.from(castArray(endAction))
    );


/**
 * Utility stream manipulation for epics
 * @module observables.epics
 */

module.exports = {
    wrapStartStop
};
