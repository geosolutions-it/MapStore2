import React, { useState, useMemo, useEffect } from 'react';
import API from '../../../api/catalog';
import { buildServiceUrl } from '../../../utils/CatalogUtils';

const catalogRequestsWorkflow = (Component) => {
    function CatalogWithRequestWorkFlow({
        pageSize = 12,
        locales = 'en-US',
        layerOptions = {},
        services,
        selectedService,
        selected,
        onSelect,
        multiSelect,
        canEditService,
        includeAddToMap,
        onChangeSelectedService,
        onChangeCatalogMode,
        title
    }) {

        const service = services?.[selectedService] || {};
        const selectedFormat = service?.type;

        const [searchText, setSearchText] = useState('');
        const [result, setResult] = useState('');
        const [loading, setLoading] = useState(false);
        const [searchOptions, setSearchOptions] = useState({});
        const [loadingError, setLoadingError] = useState(null);

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

        function handleSearch({ format, url, startPosition, maxRecords, text, options }) {
            setLoading(true);
            setSearchOptions({
                url,
                ...options,
                startPosition,
                maxRecords,
                searchText: text
            });
            if (!format || !API[format]?.textSearch) {
                return;
            }
            API[format].textSearch(url, startPosition, maxRecords, text, { options })
                .then((response) => {
                    setResult(response);
                }).
                catch((err) => {
                    setLoadingError(err);
                })
                .finally(() => {
                    setLoading(false);
                });
        }

        useEffect(() => {
            if (service) {
                handleSearch({ format: selectedFormat, url: buildServiceUrl(service), startPosition: 1, maxRecords: pageSize, text: searchText, options: { service } });
            }
        }, [selectedFormat, selectedService, service]);


        const selectedRecords = useMemo(() => {
            if (!selected) {
                return [];
            }
            return Array.isArray(selected) ? selected : [selected];
        }, [selected]);

        const handleSingleSelect = (record, checked, event) => {
            const fetchResourceByPk = API[selectedFormat]?.fetchResourceByPk;
            if (!fetchResourceByPk) {
                if (onSelect) {
                    onSelect({ record }, checked, event);
                }
                return;
            }
            setLoading(true);
            const baseUrl = buildServiceUrl(service);
            fetchResourceByPk({ baseURL: baseUrl, record })
                .then(resource => {
                    const recordWithResource = {
                        ...record,
                        ...resource
                    };
                    if (onSelect) {
                        onSelect({ record: recordWithResource }, checked, event);
                    }
                }).catch(() => {
                    console.warn('Error fetching resource');
                }).finally(() => {
                    setLoading(false);
                });
        };

        return (
            <Component
                canEditService={canEditService}
                includeAddToMap={includeAddToMap}
                onChangeSelectedService={onChangeSelectedService}
                multiSelect={multiSelect}
                onChangeCatalogMode={onChangeCatalogMode}
                title={title}
                services={services}
                selectedService={selectedService}
                selected={selectedRecords}
                isAllSelected={false}
                isIndeterminate={false}
                records={records}
                result={result}
                pageSize={pageSize}
                onSearch={handleSearch}
                searchOptions={searchOptions}
                searchText={searchText}
                selectedFormat={selectedFormat}
                onChangeText={(text) => {
                    setSearchText(text);
                    handleSearch({ format: selectedFormat, url: buildServiceUrl(service), startPosition: 1, maxRecords: pageSize, text, options: { service } });
                }}
                onSelect={(record, checked, event) => {
                    handleSingleSelect(record, checked, event);
                }}
                loading={loading}
                loadingError={loadingError}
            />
        );
    }
    return CatalogWithRequestWorkFlow;
};

export default catalogRequestsWorkflow;
