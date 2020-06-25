/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';

const configurePluginsBasePlugins = [{
    name: 'TestPlugin1',
    title: 'contextCreator.configurePlugins.tutorialPlugins.enabledTitle',
    description: 'contextCreator.configurePlugins.tutorialPlugins.enabledDescription',
    isExtension: false,
    enabled: true,
    isUserPlugin: true,
    active: false
}, {
    name: 'TestPlugin2',
    title: 'contextCreator.configurePlugins.tutorialPlugins.availableTitle',
    description: 'contextCreator.configurePlugins.tutorialPlugins.availableDescription',
    isExtension: false,
    enabled: false
}, {
    name: 'TestPlugin3',
    title: 'contextCreator.configurePlugins.tutorialPlugins.availableTitle',
    description: 'contextCreator.configurePlugins.tutorialPlugins.availableDescription',
    isExtension: true,
    enabled: false
}, {
    name: 'MapTemplates',
    title: 'Map Templates',
    description: 'contextCreator.configurePlugins.tutorialPlugins.enabledDescription',
    isExtension: false,
    enabled: true,
    isUserPlugin: false
}];

const stepToTutorialProps = {
    'configureplugins-initial': {
        disablePluginSort: true,
        allPlugins: configurePluginsBasePlugins
    },
    "configureplugins-cfgeditor": {
        disablePluginSort: true,
        allPlugins: [{
            name: 'TestPlugin1',
            title: 'contextCreator.configurePlugins.tutorialPlugins.enabledTitle',
            description: 'contextCreator.configurePlugins.tutorialPlugins.enabledDescription',
            isExtension: false,
            enabled: true,
            isUserPlugin: true,
            active: false
        }, ...configurePluginsBasePlugins.slice(1)],
        editedPlugin: 'TestPlugin1',
        editedCfg: '{\n    "cfg": {\n        "exampleProp": 8\n    },\n    "override": {}\n}'
    }
};

export default (initialTutorialStep) => Component => ({
    tutorialMode = false,
    tutorialStep = initialTutorialStep,
    ...props
}) => <Component {...props} {...(tutorialMode ? stepToTutorialProps[tutorialStep] : {})}/>;
