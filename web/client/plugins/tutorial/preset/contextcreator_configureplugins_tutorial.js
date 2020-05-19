/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {setTutorialStep} from '../../../actions/contextcreator';

export default [{
    translationHTML: 'contextCreator.configurePlugins.intro',
    selector: '#intro-tutorial'
}, {
    translationHTML: 'contextCreator.configurePlugins.availablePlugins',
    selector: '.ms2-transfer-left',
    position: 'right'
}, {
    translationHTML: 'contextCreator.configurePlugins.pluginManipulation',
    selector: '.btn-group-vertical',
    position: 'right'
}, {
    translationHTML: 'contextCreator.configurePlugins.enabledPlugins',
    selector: '.ms2-transfer-right',
    position: 'left'
}, {
    translationHTML: 'contextCreator.configurePlugins.userPlugin',
    selector: '.ms2-transfer-right .mapstore-side-card:nth-child(1) .btn-group > span > button:nth-child(1)',
    position: 'left'
}, {
    translationHTML: 'contextCreator.configurePlugins.userPluginCheckbox',
    selector: '.ms2-transfer-right .mapstore-side-card:nth-child(1) .btn-group > span > button:nth-child(2)',
    position: 'left',
    action: {
        back: setTutorialStep()
    }
}, {
    translationHTML: 'contextCreator.configurePlugins.cfgTool',
    selector: '.ms2-transfer-right .mapstore-side-card:nth-child(1) .btn-group > span > button:nth-child(3)',
    position: 'left',
    action: {
        back: setTutorialStep('configureplugins-cfgeditor'),
        next: setTutorialStep('configureplugins-cfgeditor')
    }
}, {
    translationHTML: 'contextCreator.configurePlugins.cfgEditor',
    selector: '.plugin-configuration-editor',
    position: 'left'
}, {
    translationHTML: 'contextCreator.configurePlugins.documentationTool',
    selector: '.ms2-transfer-right .mapstore-side-card:nth-child(1) .btn-group > span > a > button',
    position: 'left'
}, {
    translationHTML: 'contextCreator.configurePlugins.mapTemplatesTool',
    selector: '.ms2-transfer-right .mapstore-side-card:nth-child(2) .btn-group > span > button:nth-child(1)',
    position: 'top'
}, {
    translationHTML: 'contextCreator.configurePlugins.extensions',
    selector: '.ms2-transfer-left .ms2-transfer-title-area button',
    position: 'right'
}, {
    translationHTML: 'contextCreator.configurePlugins.extensionsDelete',
    selector: '.ms2-transfer-left .mapstore-side-card:nth-child(2) .btn-group > span > button:nth-child(1)',
    position: 'right'
}];
