import React, { useState } from 'react';
import CatalogServiceEditorComponent from '../../components/catalog/CatalogServiceEditor';
import { DEFAULT_ALLOWED_PROVIDERS } from '../MetadataExplorer';

export default ({service: defaultService, catalogServices, error = () => {}, ...props}) => {
    const [service, setService] = useState({...defaultService, showAdvancedSettings: false, autoload:
            false, localizedLayerStyles: false, hideThumbnail: true, showTemplate: false, metadataTemplate: ""});

    const [services, setServices] = useState(catalogServices);
    const serviceTypes = [{ name: "csw", label: "CSW" }, { name: "wms", label: "WMS" },
        { name: "wmts", label: "WMTS" }, { name: "tms", label: "TMS", allowedProviders: DEFAULT_ALLOWED_PROVIDERS }, {name: "wfs", label: "WFS"}];

    const addNewService = () => {
        if (!service.title || !service.url) {
            error({ title: 'catalog.notification.errorTitle', message: 'catalog.notification.warningAddCatalogService'});
            return;
        }
        // TODO Save service
    };
    return (<CatalogServiceEditorComponent
        onChangeUrl={(url) => setService({...service, url})}
        onChangeType={(type) => setService({...service, type})}
        onChangeTitle={(title) => setService({...service, title})}
        service={service}
        services={services}
        setServices={setServices}
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
