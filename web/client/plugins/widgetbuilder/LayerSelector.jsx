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
import Toolbar from '../../components/widgets/builder/wizard/common/layerselector/Toolbar';
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
 * @prop {function} [layerValidationStream]
 */
export default ({ onClose = () => { }, setSelected = () => { }, onLayerChoice = () => { }, stepButtons, selected, error, canProceed, layer, catalog, catalogServices} = {}) =>
    (<BorderLayout
        className="bg-body layer-selector"
        header={<BuilderHeader onClose={onClose}>
            <Toolbar stepButtons={stepButtons} canProceed={canProceed} onProceed={() => onLayerChoice(layer)} />
            {selected && !canProceed && error ? <InfoPopover
                trigger={false}
                glyph="warning-sign"
                bsStyle="warning"
                title={<Message msgId="widgets.builder.errors.noWidgetsAvailableTitle" />}
                text={<HTML msgId="widgets.builder.errors.noWidgetsAvailableDescription"/>} /> : null}
        </BuilderHeader>}
    >
        <Catalog services={catalogServices} selected={selected} catalog={catalog} onRecordSelected={r => setSelected(r)} />
    </BorderLayout>);
