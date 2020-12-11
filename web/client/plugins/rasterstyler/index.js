/**
* Copyright 2016, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import { connect } from 'react-redux';

import { setRasterStyleParameter } from '../../actions/rasterstyler';
import BandSelectorComp from '../../components/style/BandSelector';
import EqualIntervalComp from '../../components/style/EqualInterval';
import OpacityPickerComp from '../../components/style/OpacityPicker';
import PseudoColorSettingsComp from '../../components/style/PseudoColorSettings';
import RasterStyleTypePickerComp from '../../components/style/RasterStyleTypePicker';

export const RedBandSelector = connect((state) => { return state.rasterstyler.redband || {}; },
    {
        onChange: setRasterStyleParameter.bind(null, 'redband')
    })(BandSelectorComp);

export const BlueBandSelector = connect((state) => { return state.rasterstyler.blueband || {}; },
    {
        onChange: setRasterStyleParameter.bind(null, 'blueband')
    })(BandSelectorComp);

export const GreenBandSelector = connect((state) => { return state.rasterstyler.greenband || {}; },
    {
        onChange: setRasterStyleParameter.bind(null, 'greenband')
    })(BandSelectorComp);

export const GrayBandSelector = connect((state) => { return state.rasterstyler.grayband || {}; },
    {
        onChange: setRasterStyleParameter.bind(null, 'grayband')
    })(BandSelectorComp);
export const PseudoBandSelector = connect((state) => { return state.rasterstyler.pseudoband || {}; },
    {
        onChange: setRasterStyleParameter.bind(null, 'pseudoband')
    })(BandSelectorComp);

export const RasterStyleTypePicker = connect((state) => { return state.rasterstyler.typepicker || {}; },
    {
        onChange: setRasterStyleParameter.bind(null, 'typepicker')
    })(RasterStyleTypePickerComp);

export const OpacityPicker = connect((state) => { return state.rasterstyler.opacitypicker || {}; },
    {
        onChange: setRasterStyleParameter.bind(null, 'opacitypicker')
    })(OpacityPickerComp);

export const EqualInterval = connect((state) => { return state.rasterstyler.equalinterval || {}; },
    {
        onChange: setRasterStyleParameter.bind(null, 'equalinterval')
    })(EqualIntervalComp);

export const PseudoColor = connect((state) => { return state.rasterstyler.pseudocolor || {}; },
    {
        onChange: setRasterStyleParameter.bind(null, 'pseudocolor')
    })(PseudoColorSettingsComp);

export default {
    RedBandSelector,
    BlueBandSelector,
    GreenBandSelector,
    GrayBandSelector,
    PseudoBandSelector,
    RasterStyleTypePicker,
    EqualInterval,
    PseudoColor,
    OpacityPicker
};
