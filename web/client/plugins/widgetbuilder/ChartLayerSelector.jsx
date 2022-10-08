/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { connect } from 'react-redux';
import { branch, compose } from 'recompose';
import { Glyphicon } from "react-bootstrap";
import { createSelector } from 'reselect';
import castArray from "lodash/castArray";
import isEmpty from "lodash/isEmpty";

import { HTML, Message } from '../../components/I18N/I18N';
import BorderLayout from '../../components/layout/BorderLayout';
import Toolbar from '../../components/widgets/builder/wizard/common/layerselector/Toolbar';
import InfoPopover from '../../components/widgets/widget/InfoPopover';
import ButtonRB from "../../components/misc/Button";
import tooltip from "../../components/misc/enhancers/tooltip";
import { selectedCatalogSelector } from '../../selectors/catalog';
import BuilderHeader from './BuilderHeader';
import CatalogComp from './Catalog';

const Button = tooltip(ButtonRB);

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
export default ({ onClose = () => { }, setSelected = () => { }, onLayerChoice = () => { }, stepButtons, selected, error, canProceed, layer, layers, catalog, defaultServices,
    onChangeSelectedService, defaultSelectedService, onChangeCatalogMode, dashboardServices, dashboardSelectedService, getItems, onItemClick, showLayers, toggleLayerSelector} = {}) => {
    const _canProceed = showLayers ? !isEmpty(layers) : canProceed && selected && layer && castArray(selected).length === castArray(layer).length;
    const onProceed = () => {
        const isUpdate = showLayers && !isEmpty(layers);
        const key = isUpdate ? 'chart-add' : 'chart-layers';
        const _layers = isUpdate ? layers.concat(layer) : layer;
        onLayerChoice(key, _layers);
        toggleLayerSelector(false);
    };
    return (<BorderLayout
        className="bg-body layer-selector"
        header={<BuilderHeader onClose={onClose}>
            <Toolbar stepButtons={stepButtons}
                canProceed={_canProceed}
                onProceed={onProceed}
            />
            {selected && !canProceed && error ? <InfoPopover
                trigger={false}
                glyph="warning-sign"
                bsStyle="warning"
                title={<Message msgId="widgets.builder.errors.noWidgetsAvailableTitle"/>}
                text={<HTML msgId="widgets.builder.errors.noWidgetsAvailableDescription"/>}/> : null}
        </BuilderHeader>}
    >
        <Catalog
            onChangeCatalogMode={onChangeCatalogMode}
            selectedService={dashboardSelectedService === "" ? dashboardSelectedService : dashboardSelectedService === undefined ? defaultSelectedService : dashboardSelectedService}
            onChangeSelectedService={(service) => onChangeSelectedService(service, dashboardServices || defaultServices)}
            services={dashboardServices || defaultServices}
            selected={selected}
            catalog={catalog}
            onRecordSelected={r => setSelected(r)}
            getItems={getItems}
            onItemClick={onItemClick}
            title={<>
                <Message msgId="widgets.builder.wizard.selectLayers" />
                <Button
                    style={{marginLeft: 4}}
                    tooltipPosition={"right"}
                    tooltip={<HTML msgId="widgets.chartSwitcher.subTitle" />}
                    className="maps-subtitle square-button-md no-border"
                    key="info-sign">
                    <Glyphicon glyph="info-sign" />
                </Button>
            </>}
        />
    </BorderLayout>);
};
