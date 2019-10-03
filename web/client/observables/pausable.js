
/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
  * lettable to make a stream pausable.
  *
  */
module.exports = (sem$, start = true, condition = c => c) =>
    stream$ =>
        stream$.withLatestFrom(
            sem$.startWith(start)
        )
            .filter(([, s]) => condition(s))
            .map(([e]) => e);
