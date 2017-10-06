 /**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

const {compose, mapPropsStreamWithConfig, defaultProps} = require('recompose');

const rxjsConfig = require('recompose/rxjsObservableConfig').default;

const Rx = require('rxjs');
const mapPropsStream = mapPropsStreamWithConfig(rxjsConfig);

module.exports = compose(
  defaultProps({
      dataStreamFactory: () => Rx.Observable.empty()
  }),
  mapPropsStream(props$ => {
      // TODO capture sensible props changes instead of take first
      let fetcherStream = props$.take(1).switchMap(p => {
          return p.dataStreamFactory(props$);
      });
      return fetcherStream.combineLatest(props$, (overrides= {}, props = {}) => ({
          ...props,
          ...overrides
      }));
  })
);
