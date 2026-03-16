import React, { useState, useMemo, useEffect } from 'react';
import API from '../../../api/catalog';
import { buildServiceUrl } from '../../../utils/CatalogUtils';

// const getRecordIdentifier = (record = {}) => {
//     return record?.identifier
//                 || record?.name
//                 || record?.title?.default
//                 || record?.title
//                 || record?.url
//                 || record?.tileMapUrl;
// };

// const areSameRecord = (recordA = {}, recordB = {}) => {
//     const identifierA = getRecordIdentifier(recordA);
//     const identifierB = getRecordIdentifier(recordB);
//     if (identifierA && identifierB) {
//         return identifierA === identifierB;
//     }
//     return recordA === recordB;
// };


const catalogRequestsWorkflow = (Component) => {
    function CatalogWithRequestWorkFlow({
        pageSize = 12,
        locales = 'en-US',
        layerOptions = {},
        services,
        selectedService,
        selected,
        onSelect,
        // onRecordSelected,
        multiSelect,
        canEditService,
        includeAddToMap,
        onChangeSelectedService,
        onChangeCatalogMode,
        title
    }) {

        // console.log(multiSelect, "multiSelect in workflow");
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

        // const isRecordSelected = (record = {}) => {
        //     const identifier = getRecordIdentifier(record);
        //     if (!identifier) {
        //         return selectedRecords.some(selectedRecord => selectedRecord === record);
        //     }
        //     return selectedRecords.some(selectedRecord => getRecordIdentifier(selectedRecord) === identifier);
        // };


        // const isAllSelected = useMemo(() => {
        //     if (!records.length) {
        //         return false;
        //     }
        //     return records.every(record => isRecordSelected(record));
        // }, [records, selectedRecords]);

        // const isIndeterminate = useMemo(() => {
        //     if (!records.length || isAllSelected) {
        //         return false;
        //     }
        //     return records.some(record => isRecordSelected(record));
        // }, [records, selectedRecords, isAllSelected]);

        const handleSingleSelect = (record, checked, event) => {
            if (onSelect) {
                onSelect({ record }, checked, event);
                return;
            }
        };

        // const handleSelectAll = (checked) => {
        //     if (!multiSelect || !records.length) {
        //         return;
        //     }
        //     if (onSelect) {
        //         records.forEach((record) => {
        //             const present = isRecordSelected(record);
        //             if (checked && !present) {
        //                 onSelect({ record }, true);
        //             }
        //             if (!checked && present) {
        //                 onSelect({ record }, false);
        //             }
        //         });
        //         return;
        //     }
        //     if (!onRecordSelected) {
        //         return;
        //     }
        //     if (!checked) {
        //         onRecordSelected(selectedRecords.filter(selectedRecord => !records.some(record => areSameRecord(selectedRecord, record))));
        //         return;
        //     }
        //     const recordsToAdd = records.filter(record => !selectedRecords.some(selectedRecord => areSameRecord(selectedRecord, record)));
        //     onRecordSelected(selectedRecords.concat(recordsToAdd));
        // };

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
                handleSelectAll={() => { }}
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
