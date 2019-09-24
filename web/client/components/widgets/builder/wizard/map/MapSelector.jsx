/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const BorderLayout = require('../../../../layout/BorderLayout');

const Toolbar = require('../../../../misc/toolbar/Toolbar');
const BuilderHeader = require('../../BuilderHeader');

const mcEnhancer = require('../../../../maps/enhancers/mapCatalogWithEmptyMap');
const Message = require('../../../../I18N/Message');
const MapCatalog = mcEnhancer(require('../../../../maps/MapCatalog'));
import handleSelectEnhancer from './enhancers/handleSelect';

/**
 * Builder page that allows layer's selection
 */
module.exports = handleSelectEnhancer(({ onClose = () => { }, setSelected = () => { }, onMapChoice = () => { }, stepButtons = [], selected } = {}) =>
    (<BorderLayout
        className="bg-body layer-selector"
        header={<BuilderHeader onClose={onClose}>
            <Toolbar
                btnDefaultProps={{
                    bsStyle: "primary",
                    bsSize: "sm"
                }}
                buttons={[...stepButtons, {
                tooltipId: "widgets.builder.wizard.useThisMap",
                onClick: () => onMapChoice(selected),
                visible: true,
                disabled: !selected,
                glyph: "arrow-right"
            }]} />
        </BuilderHeader>}
    >
        <MapCatalog title={<Message msgId="widgets.builder.wizard.selectAMap" />} selected={selected} onSelected={r => setSelected(r)} />
    </BorderLayout>));
