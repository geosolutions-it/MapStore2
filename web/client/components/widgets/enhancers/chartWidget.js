 /*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
const {compose, withState, withHandlers} = require('recompose');
module.exports = compose(
    // table / chart visualization
    withState('showTable', 'setShowTable', false),
    withState('confirmDelete', 'toggleDeleteConfirm', false),
    withHandlers({
       toggleTableView: ({ setShowTable, showTable }) => () => setShowTable(!showTable)
   })
);
