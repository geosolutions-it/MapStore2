import React, { useState, useMemo } from 'react';
import API from '../../../api/catalog';
import { buildServiceUrl } from '../../../utils/CatalogUtils';

const catalogRequestsWorkflow = (Component) => {
    function CatalogWithRequestWorkFlow({
        pageSize = 12,
        ...props
    }) {
        const {services, selectedService, selected, onSelect, onRecordSelected } = props;
        const service = services?.[selectedService] || {};
        const selectedFormat = service?.type;
        // This state can be passed from the parent using selector
        const [searchText, setSearchText] = useState('');
        const [result, setResult] = useState('');
        const [searchOptions] = useState({});
        const [layerOptions] = useState({});
        const locales = 'en-US';
        function handleSearch({ format, url, startPosition, maxRecords, text, options }) {
            API[format].textSearch(url, startPosition, maxRecords, text, { options })
                .then((response) => {
                    setResult(response);
                });
        }
        const records = useMemo(() => {
            return result && selectedFormat && API[selectedFormat]?.getCatalogRecords
                ? (API[selectedFormat].getCatalogRecords(result, { ...searchOptions, layerOptions, service: services[selectedService] }, locales) || [])
                    .map(record => {
                        return {
                            ...record,
                            ...(services[selectedService]?.showTemplate && services[selectedService]?.metadataTemplate && {
                                showTemplate: true,
                                metadataTemplate: services[selectedService]?.metadataTemplate
                            }),
                            ...(services[selectedService]?.hideThumbnail !== undefined && {
                                hideThumbnail: services[selectedService]?.hideThumbnail
                            })
                        };
                    })
                : [];
        }, [result, selectedFormat, searchOptions, layerOptions, services, selectedService, locales]);

        return (
            <Component
                {...props}
                selected={selected ? (Array.isArray(selected) ? selected : [selected]) : []}
                records={records}
                result={result}
                pageSize={pageSize}
                onSearch={handleSearch}
                searchText={searchText}
                selectedFormat={selectedFormat}
                onChangeText={(text) => {
                    setSearchText(text);
                    handleSearch({ format: selectedFormat, url: buildServiceUrl(service), startPosition: 1, maxRecords: pageSize, text, options: { service } });
                }}
                onSelect={(record, checked, event) => {
                    if (onSelect) {
                        onSelect({ record }, checked, event);
                    } else {
                        onRecordSelected(record);
                    }
                }}
            />
        );
    }
    return CatalogWithRequestWorkFlow;
};

export default catalogRequestsWorkflow;
