import React, { useState } from 'react';
import { isEmpty } from 'lodash';

import uuid from 'uuid';
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

    const handleChangeServiceProperty = (property, value) => {
        setService({ ...service, [property]: value });
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
            onChangeServiceProperty={handleChangeServiceProperty}
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
