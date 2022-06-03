/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import BorderLayout from '../../../../layout/BorderLayout';

import Toolbar from '../../../../misc/toolbar/Toolbar';
import BuilderHeader from '../../BuilderHeader';

import mcEnhancer from '../../../../maps/enhancers/mapCatalogWithEmptyMap';
import Message from '../../../../I18N/Message';
import MapCatalogComp from './MapCatalog';
import handleMapSelect from './enhancers/handleMapSelect';

const MapCatalog = mcEnhancer(MapCatalogComp);

/**
 * Builder page that allows layer's selection
 */
export default handleMapSelect(({ onClose = () => { }, setSelected = () => { }, onMapChoice = () => { }, stepButtons = [], selected, disableEmptyMap, mapLoading, setMapLoading = () => {} } = {}) =>
    (<BorderLayout
        className="bg-body layer-selector"
        header={<BuilderHeader onClose={onClose}>
            <Toolbar
                btnDefaultProps={{
                    bsStyle: "primary",
                    bsSize: "sm"
                }}
                buttons={[...stepButtons, {
                    tooltipId: `widgets.builder.wizard.${selected?.length > 1 ? "useTheseMap" : "useThisMap"}`,
                    onClick: () => {
                        onMapChoice(selected);
                        setMapLoading(true);
                    },
                    visible: true,
                    disabled: !selected || mapLoading,
                    glyph: "arrow-right"
                }]} />
        </BuilderHeader>}
    >
        <MapCatalog
            title={<Message msgId="widgets.builder.wizard.selectAMap" />}
            selected={selected}
            onSelected={r => {
                setSelected(r);
                setMapLoading(false);
            }}
            disableEmptyMap={disableEmptyMap}
        />
    </BorderLayout>));
