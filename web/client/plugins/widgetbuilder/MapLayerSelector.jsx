/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { connect } from 'react-redux';
import { branch, compose } from 'recompose';
import { createSelector } from 'reselect';

import { HTML, Message } from '../../components/I18N/I18N';
import BorderLayout from '../../components/layout/BorderLayout';
import Toolbar from '../../components/misc/toolbar/Toolbar';
import InfoPopover from '../../components/widgets/widget/InfoPopover';
import { selectedCatalogSelector } from '../../selectors/catalog';
import BuilderHeader from './BuilderHeader';
import CatalogComp from './Catalog';

const Catalog = compose(
    branch(
        ({catalog} = {}) => !catalog,
        connect(createSelector(selectedCatalogSelector, catalog => ({catalog})))
    )
)(CatalogComp);

/**
 * Builder page that allows layer's selection
 */
export default ({ onClose = () => { }, setSelected = () => { }, onLayerChoice = () => { }, toggleLayerSelector = () => {}, selected, canProceed, layer, catalog, catalogServices} = {}) =>
    (<BorderLayout
        className="bg-body layer-selector"
        header={<BuilderHeader onClose={onClose}>
            <Toolbar btnDefaultProps={{
                className: "square-button-md",
                bsStyle: "primary",
                bsSize: "sm"
            }}
            buttons={[{
                onClick: () => toggleLayerSelector(false),
                tooltipId: "close",
                glyph: "1-close"
            }, {
                onClick: () => onLayerChoice(layer),
                disabled: !selected || !canProceed,
                tooltipId: "widgets.builder.wizard.useTheSelectedLayer",
                glyph: "plus"
            }]} />
            { selected && !canProceed ? <InfoPopover
                glyph="exclamation-mark"
                bsStyle="warning"
                title={<Message msgId="widgets.builder.errors.noWidgetsAvailableTitle" />}
                text={<HTML msgId="widgets.builder.errors.noWidgetsAvailableDescription"/>} /> : null}
        </BuilderHeader>}
    >
        <Catalog services={catalogServices} selected={selected} catalog={catalog} onRecordSelected={r => setSelected(r)} />
    </BorderLayout>);
