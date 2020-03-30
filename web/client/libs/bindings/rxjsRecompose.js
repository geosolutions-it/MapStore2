/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


// import bindings
import rxjsConfig from 'recompose/rxjsObservableConfig';

// loading definition of operators
import 'rxjs';

// binds recompose with rxjs
import { setObservableConfig } from 'recompose';
/**
 * The following operations are required to bind rxjs to recompose and ES6 Observables.
 * It is a requirement to use recompose together with RxJS ()
 * Please import this wherever you use mapPropsStream or componentFromStream (or import once in StandardApp)
 * This file have to be imported once in the application (initial bindings, like initialization of other libs)
 * and/or once in the test environment.
 * TODO: import it in StandardApp or where needed
 *
 */
setObservableConfig(rxjsConfig);
