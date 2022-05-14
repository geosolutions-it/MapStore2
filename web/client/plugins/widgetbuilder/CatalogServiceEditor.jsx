import React, { useState } from 'react';
import { isEmpty } from 'lodash';

import uuid from 'uuid';
import {set} from "../../utils/ImmutableUtils";
import CatalogServiceEditorComponent from '../../components/catalog/CatalogServiceEditor';
import { DEFAULT_ALLOWED_PROVIDERS } from '../MetadataExplorer';

const emptyService = {
    url: "",
    type: "wms",
    title: "",
    isNew: true,
    showAdvancedSettings: false,
    showTemplate: false,
    hideThumbnail: false,
    metadataTemplate: "<p>${description}</p>",
    excludeShowTemplate: true
};

export default ({service: defaultService, catalogServices,
    error = () => {}, onAddService = () => {}, isNew, dashboardServices, defaultServices, defaultSelectedService,
    dashboardSelectedService, ...props}) => {
    const [service, setService] = useState(isNew ? emptyService :
        isEmpty(dashboardSelectedService) ? {...defaultServices[defaultSelectedService],
            old: defaultServices[defaultSelectedService], key: defaultSelectedService, excludeShowTemplate: true} :
            {...dashboardServices[dashboardSelectedService], old: dashboardServices[dashboardSelectedService],
                key: dashboardSelectedService, excludeShowTemplate: true} );

    const existingServices = isEmpty(dashboardServices) ? defaultServices : dashboardServices;

    const addNewService = () => {
        if (service.type !== 'tms' && (!service.title || !service.url)) {
            error({ title: 'catalog.notification.errorTitle', message: 'catalog.notification.warningAddCatalogService'});
            return;
        }
        const key = !isNew ? service.key : service.title + uuid();
        const newService = {
            ...service, key
        };
        onAddService(newService, existingServices, isNew);
    };

    const handleChangeServiceFormat = (property, value) => {
        let currentData = service;
        if (property === "provider") {
            currentData.provider = value;
        }
        if (currentData[property]) {
            currentData[property] = typeof value === 'boolean' ? !(currentData[property]) : value;
        } else {
            currentData = set(`${property}`, value, currentData);
        }
        setService(currentData);
    };

    return (<div style={{padding: '1rem', height: '100%'}}>
        <CatalogServiceEditorComponent
            onChangeUrl={(url) => setService({...service, url})}
            onChangeType={(type) => setService({...service, type})}
            onChangeTitle={(title) => setService({...service, title})}
            service={service}
            onChangeServiceFormat={(format) => setService({...service, format})}
            onToggleAdvancedSettings={() => setService({...service, showAdvancedSettings: !service.showAdvancedSettings})}
            onAddService={addNewService}
            onChangeServiceProperty={handleChangeServiceFormat}
            onToggleTemplate={() => setService({...service, showTemplate: !service.showTemplate})}
            onToggleThumbnail={() => setService({...service, hideThumbnail: !service.hideThumbnail})}
            serviceTypes={[{ name: "csw", label: "CSW" }, { name: "wms", label: "WMS" },
                { name: "wmts", label: "WMTS" }, { name: "tms", label: "TMS", allowedProviders: DEFAULT_ALLOWED_PROVIDERS }, {name: "wfs", label: "WFS"}]}
            onChangeMetadataTemplate={(metadataTemplate) => setService({...service, metadataTemplate})}
            services={existingServices}
            {...props}
        />
    </div>);
};
