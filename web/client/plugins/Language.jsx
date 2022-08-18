/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import assign from 'object-assign';
import { connect } from 'react-redux';

import { loadLocale } from '../actions/locale';
import LangBarComp from '../components/I18N/LangBar';

const LangBar = connect((state) => ({
    currentLocale: state.locale && state.locale.current
}), {
    onLanguageChange: loadLocale.bind(null, null)
})(LangBarComp);

/**
 * Renders a menu to switch language.
 * It can be rendered in {@link #plugins.OmniBar|OmniBar}.
 * @name Language
 * @class
 * @memberof plugins
 */
export default {
    LanguagePlugin: assign(LangBar, {
        OmniBar: {
            name: 'language',
            position: 5,
            tool: true,
            priority: 1
        }
    }),
    reducers: {}
};
