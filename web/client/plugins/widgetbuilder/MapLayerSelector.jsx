/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {connect} = require('react-redux');
const {createSelector} = require('reselect');

const BorderLayout = require('../../components/layout/BorderLayout');
const {selectedCatalogSelector} = require('../../selectors/catalog');
const Toolbar = require('../../components/misc/toolbar/Toolbar');
const BuilderHeader = require('./BuilderHeader');
const InfoPopover = require('../../components/widgets/widget/InfoPopover');
const {Message, HTML} = require('../../components/I18N/I18N');
const {compose, branch} = require('recompose');

const Catalog = compose(
    branch(
        ({catalog} = {}) => !catalog,
        connect(createSelector(selectedCatalogSelector, catalog => ({catalog})))
    ),
)(require('./Catalog'));
/**
 * Builder page that allows layer's selection
 */
module.exports = ({ onClose = () => { }, setSelected = () => { }, onLayerChoice = () => { }, toggleLayerSelector = () => {}, selected, canProceed, layer, catalog, catalogServices} = {}) =>
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
