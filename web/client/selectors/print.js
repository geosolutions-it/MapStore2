/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/


export const currentLayouts = (state) => state.print && state.print.capabilities &&
    state.print.capabilities.layouts.filter((layout) => layout.name.indexOf(state.print.spec.sheet) === 0) || [];
export const twoPageEnabled = (state) => state.print && state.print.spec && state.print.spec.includeLegend;
