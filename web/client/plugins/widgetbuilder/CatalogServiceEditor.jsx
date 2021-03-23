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
    autoload: false,
    showAdvancedSettings: false,
    showTemplate: false,
    hideThumbnail: false,
    metadataTemplate: "<p>${description}</p>"
};
export default ({service: defaultService, catalogServices,
    error = () => {}, onAddService = () => {}, isNew, dashboardServices, defaultServices, ...props}) => {
    const [service, setService] = useState(isNew ? emptyService : {});

    const serviceTypes = [{ name: "csw", label: "CSW" }, { name: "wms", label: "WMS" },
        { name: "wmts", label: "WMTS" }, { name: "tms", label: "TMS", allowedProviders: DEFAULT_ALLOWED_PROVIDERS }, {name: "wfs", label: "WFS"}];

    const addNewService = () => {
        // TODO handle notifications in epic for success and error
        if (!service.title || !service.url) {
            error({ title: 'catalog.notification.errorTitle', message: 'catalog.notification.warningAddCatalogService'});
            return;
        }
        const title =  service.title + uuid();
        const newService = {
            ...service, title
        };
        const existingServices = isEmpty(dashboardServices) ? defaultServices : dashboardServices;
        const newServices = {
            ...existingServices, [newService.title]: {...newService, title}
        };
        onAddService(newService, newServices);
    };
    return (<CatalogServiceEditorComponent
        onChangeUrl={(url) => setService({...service, url})}
        onChangeType={(type) => setService({...service, type})}
        onChangeTitle={(title) => setService({...service, title})}
        service={service}
        onToggleAdvancedSettings={() => setService({...service, showAdvancedSettings: !service.showAdvancedSettings})}
        onAddService={addNewService}
        onChangeServiceProperty={(property) => setService({...service, [property]: !service[property]})}
        onToggleTemplate={() => setService({...service, showTemplate: !service.showTemplate})}
        onToggleThumbnail={() => setService({...service, hideThumbnail: !service.hideThumbnail})}
        serviceTypes={serviceTypes}
        onChangeMetadataTemplate={(metadataTemplate) => setService({...service, metadataTemplate})}
        {...props}
    />);
};
