import React, { useState } from 'react';
import API from '../../../api/catalog';
import { buildServiceUrl } from '../../../utils/CatalogUtils';

const catalogRequestsWorkflow = (Component) => {
    function CatalogWithRequestWorkFlow({
        pageSize = 12,
        ...props
    }) {

        const [searchText, setSearchText] = useState('');
        const [result, setResult] = useState('');
        function handleSearch({ format, url, startPosition, maxRecords, text, options }) {
            API[format].textSearch(url, startPosition, maxRecords, text, { options })
                .then((response) => {
                    setResult(response);
                });
        }
        const service = props?.services?.[props?.selectedService] || {};

        return (
            <Component
                {...props}
                result={result}
                pageSize={pageSize}
                onSearch={handleSearch}
                searchText={searchText}
                selectedFormat={service.type}
                onChangeText={(text) => {
                    setSearchText(text);
                    handleSearch({ format: service.type, url: buildServiceUrl(service), startPosition: 1, maxRecords: pageSize, text, options: {  service } });
                }}
            />
        );
    }
    return CatalogWithRequestWorkFlow;
};

export default catalogRequestsWorkflow;
