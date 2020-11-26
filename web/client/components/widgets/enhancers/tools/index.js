/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {compose} from 'recompose';

import collapsibleWidgetEnhancer from './collapsibleWidget';
import maximizableWidgetEnhancer from './maximizableWidget';
import editableWidgetEnhancer from './editableWidget';
import exportableWidgetEnhancer from './exportableWidget';
import hidableWidgetEnhancer from './hidableWidget';
import pinnableWidgetEnhancer from './pinnableWidget';
import withIconsEnhancer from './withIcons';
import withInfoEnhancer from './withInfo';
import withMenuEnhancer from './withMenu';
import withToolsEnhancer from './withTools';

export const withTools = withToolsEnhancer;
export const pinnableWidget = pinnableWidgetEnhancer;
export const hidableWidget = hidableWidgetEnhancer;
export const withMenu = withMenuEnhancer;
export const withIcons = withIconsEnhancer;
export const withInfo = withInfoEnhancer;
export const editableWidget = editableWidgetEnhancer;
export const exportableWidget = exportableWidgetEnhancer;
export const collapsibleWidget = collapsibleWidgetEnhancer;
export const maximizableWidget = maximizableWidgetEnhancer;
/**
 * widgets icons of collapse/pin
 */
export const defaultIcons = () => compose(
    pinnableWidget(),
    collapsibleWidget(),
    maximizableWidget(),
    withInfo()
);
/**
 * transform `widgetTools` prop into `topLeftItems` and `icons` props
 * user to in the widget header
 */
export const withHeaderTools = () => compose(
    withTools(),
    withIcons(),
    withMenu()
);


export default {
    withTools,
    pinnableWidget,
    hidableWidget,
    withMenu,
    withIcons,
    editableWidget,
    exportableWidget,
    collapsibleWidget,
    /**
     * widgets icons of collapse/pin
     */
    defaultIcons,
    /**
     * transform `widgetTools` prop into `topLeftItems` and `icons` props
     * user to in the widget header
     */
    withHeaderTools
};
