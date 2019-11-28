/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { compose, withProps } from 'recompose';

import withControllableState from '../../../misc/enhancers/withControllableState';
import Controls from '../map/Controls';
import TOC from '../../../widgets/builder/wizard/map/TOC';


const withDefaultTabs = withProps((props) => ({
    tabs: props.tabs || [{
        id: 'toc',
        titleId: 'geostory.mapEditor.toc',
        tooltipId: 'geostory.mapEditor.toc',
        glyph: '1-layer',
        visible: true,
        Component: TOC
    },
    {
        id: 'settings',
        titleId: 'geostory.mapEditor.settings',
        tooltipId: 'geostory.mapEditor.settings',
        glyph: 'wrench',
        visible: true,
        Component: Controls
    }]
}));
/**
 * Manages tabs for inline editing of map editor
 * @prop {object} map the map (with layers and groups, mapOptions)
  */
export const withMapConfiguratorTabs = compose(
    withControllableState('activeTab', 'setActiveTab', 'toc'),
    withDefaultTabs
);

export default withMapConfiguratorTabs;

