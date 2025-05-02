/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { connect } from 'react-redux';

import { selectTheme } from '../actions/theme';
import ThemeSwitcher from '../components/theme/ThemeSwitcher';
import theme from '../reducers/theme';
import themes from '../themes';

const ThemeSwitcherPlugin = connect((s) => ({
    selectedTheme: s && s.theme && s.theme.selectedTheme || themes[0],
    themes
}), {
    onThemeSelected: selectTheme
})(ThemeSwitcher);

export default {
    ThemeSwitcherPlugin: Object.assign(ThemeSwitcherPlugin, {
        GridContainer: {
            id: 'themeSwitcher',
            name: 'themeSwitcher',
            tool: true,
            position: 1,
            priority: 1
        }
    }),
    reducers: {
        theme
    }
};
