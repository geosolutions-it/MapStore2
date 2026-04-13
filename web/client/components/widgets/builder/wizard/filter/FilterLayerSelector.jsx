/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Glyphicon } from 'react-bootstrap';
import castArray from 'lodash/castArray';
import isEmpty from 'lodash/isEmpty';
import { withProps } from 'recompose';

import { HTML, Message } from '../../../../I18N/I18N';
import BorderLayout from '../../../../layout/BorderLayout';
import InfoPopover from '../../../../widgets/widget/InfoPopover';
import ButtonRB from '../../../../misc/Button';
import tooltip from '../../../../misc/enhancers/tooltip';
import Catalog from '../../../../../plugins/widgetbuilder/Catalog';
import { selectedCatalogSelector, servicesSelector as catalogServicesSelector, selectedServiceSelector as catalogSelectedServiceSelector } from '../../../../../selectors/catalog';
import chartLayerSelector from '../../../../../plugins/widgetbuilder/enhancers/chartLayerSelector';
import { catalogEditorEnhancer } from '../../../../../plugins/widgetbuilder/enhancers/catalogEditorEnhancer';
import viewportBuilderConnectMask from '../../../../../plugins/widgetbuilder/enhancers/connection/viewportBuilderConnectMask';

const Button = tooltip(ButtonRB);

const FilterLayerSelectorComponent = ({
    onClose = () => {},
    onSelectionConfirm = () => {},
    setSelected = () => {},
    selected,
    layer,
    layerError,
    canProceed,
    catalog,
    defaultServices,
    onChangeSelectedService = () => {},
    defaultSelectedService,
    onChangeCatalogMode = () => {},
    dashboardServices,
    dashboardSelectedService,
    getItems = (items) => items,
    onItemClick = () => {},
    selectedCatalog,
    canEditService
}) => {
    const canConfirm = canProceed && !isEmpty(layer);
    const handleConfirm = () => {
        if (!canConfirm) {
            return;
        }
        const layers = castArray(layer);
        onSelectionConfirm(layers);
        onClose();
    };

    const header = (
        <div className="ms-filter-layer-selector__header">
            <div className="ms-filter-layer-selector__title">
                <Message msgId="widgets.builder.wizard.selectLayers" />
                <Button
                    style={{ marginLeft: 4 }}
                    tooltipPosition="right"
                    tooltip={<HTML msgId="widgets.chartSwitcher.subTitle" />}
                    className="maps-subtitle square-button no-border"
                    key="info-sign">
                    <Glyphicon glyph="info-sign" />
                </Button>
            </div>
            <Button
                className="square-button no-border"
                onClick={onClose}>
                <Glyphicon glyph="1-close" />
            </Button>
        </div>
    );

    const footer = (
        <div className="ms-filter-layer-selector__footer">
            <Button onClick={onClose}>
                <Message msgId="close" />
            </Button>
            <Button
                bsStyle="primary"
                disabled={!canConfirm}
                onClick={handleConfirm}>
                <Message msgId="gfi.apply" />
            </Button>
        </div>
    );

    return (
        <BorderLayout
            className="bg-body ms-filter-layer-selector"
            style={{height: '100%'}}
            header={header}
            footer={footer}
        >
            {selected && !canProceed && layerError ? (
                <div className="ms-filter-layer-selector__warning">
                    <InfoPopover
                        trigger={false}
                        glyph="warning-sign"
                        bsStyle="warning"
                        placement="left"
                        title={<Message msgId="widgets.builder.errors.noWidgetsAvailableTitle" />}
                        text={<HTML msgId={layerError} />}
                    />
                </div>
            ) : null}
            <Catalog
                onChangeCatalogMode={onChangeCatalogMode}
                selectedService={dashboardSelectedService === "" ? dashboardSelectedService : dashboardSelectedService === undefined ? defaultSelectedService : dashboardSelectedService}
                onChangeSelectedService={(service) => onChangeSelectedService(service, dashboardServices || defaultServices)}
                services={dashboardServices || defaultServices}
                selected={selected}
                catalog={catalog || selectedCatalog}
                onRecordSelected={r => setSelected(r)}
                getItems={getItems}
                onItemClick={onItemClick}
                canEditService={canEditService}
            />
        </BorderLayout>
    );
};

FilterLayerSelectorComponent.propTypes = {
    onClose: PropTypes.func,
    onSelectionConfirm: PropTypes.func,
    setSelected: PropTypes.func,
    selected: PropTypes.array,
    layer: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    layerError: PropTypes.string,
    canProceed: PropTypes.bool,
    catalog: PropTypes.object,
    defaultServices: PropTypes.object,
    onChangeSelectedService: PropTypes.func,
    defaultSelectedService: PropTypes.string,
    onChangeCatalogMode: PropTypes.func,
    dashboardServices: PropTypes.object,
    dashboardSelectedService: PropTypes.string,
    getItems: PropTypes.func,
    onItemClick: PropTypes.func,
    selectedCatalog: PropTypes.object,
    canEditService: PropTypes.bool
};

const withServiceDefaults = withProps(({
    defaultServices,
    defaultSelectedService,
    catalogServices,
    catalogSelectedService,
    selectedCatalog
}) => {
    const services = !isEmpty(defaultServices)
        ? defaultServices
        : !isEmpty(catalogServices)
            ? catalogServices
            : selectedCatalog
                ? { 'default': selectedCatalog }
                : {};
    const selectedServiceKey = defaultSelectedService
        || catalogSelectedService
        || Object.keys(services)[0];
    return {
        defaultServices: services,
        defaultSelectedService: selectedServiceKey
    };
});

const FilterLayerSelector = connect(
    (state) => ({
        selectedCatalog: selectedCatalogSelector(state),
        catalogServices: catalogServicesSelector(state),
        catalogSelectedService: catalogSelectedServiceSelector(state)
    })
)(FilterLayerSelectorComponent);

export default chartLayerSelector(
    catalogEditorEnhancer(
        viewportBuilderConnectMask(
            withServiceDefaults(FilterLayerSelector)
        )
    )
);


