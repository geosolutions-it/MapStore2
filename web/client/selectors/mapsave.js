/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {createStructuredSelector} = require('reselect');
const {servicesSelector, selectedServiceSelector} = require('./catalog');

const mapOptionsToSaveSelector = createStructuredSelector({
     catalogServices: createStructuredSelector({
         services: servicesSelector,
         selectedService: selectedServiceSelector
     })
 });
module.exports = {mapOptionsToSaveSelector};
