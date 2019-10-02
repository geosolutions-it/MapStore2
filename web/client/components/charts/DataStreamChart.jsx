/*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

const React = require('react');
const SimpleChart = require('./SimpleChart');

const streamEnhancer = require('../misc/enhancers/propsStreamFactory');
module.exports = streamEnhancer((props) => <SimpleChart {...props} />);
