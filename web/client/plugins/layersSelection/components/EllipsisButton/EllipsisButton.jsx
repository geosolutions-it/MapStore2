import React, { useState, useEffect, useContext } from 'react';
import ReactDOM from "react-dom";
import bbox from '@turf/bbox';
import { saveAs } from 'file-saver';
import axios from 'axios';

import Message from '../../../../components/I18N/Message';
import { describeFeatureType } from '../../../../api/WFS';

import { SelectRefContext } from '../LayersSelection';
import Statistics from './Statistics/Statistics';
import './EllipsisButton.css';

/**
 * EllipsisButton provides a contextual menu for selected layer data.
 * It allows users to:
 * - Zoom to selection extent
 * - View statistics
 * - Create a new layer from selection
 * - Export data (GeoJSON, JSON, CSV)
 * - Apply attribute filters (if supported)
 * - Clear the selection
 *
 * @param {Object} props - Component props.
 * @param {Object} props.node - Layer node (descriptor).
 * @param {Array} props.layers - All available layers.
 * @param {Object} props.selectionData - GeoJSON FeatureCollection.
 * @param {Function} props.onAddOrUpdateSelection - Callback to update selection.
 * @param {Function} props.onZoomToExtent - Callback to zoom to selection.
 * @param {Function} props.onAddLayer - Callback to add a new layer.
 * @param {Function} props.onChangeLayerProperties - Callback to change layer properties.
 */
export default ({
    node = {},
    // layers = [],
    selectionData = {},
    onAddOrUpdateSelection = () => { },
    onZoomToExtent = () => { },
    onAddLayer = () => { },
    onChangeLayerProperties = () => { }
}) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);
    const [statisticsOpen, setStatisticsOpen] = useState(false);
    const [numericFields, setNumericFields] = useState([]);

    const SelectRef = useContext(SelectRefContext);
    const ellipsisContainerClass = 'ellipsis-container';
    useEffect(() => {
        const selectElement = SelectRef.current?.addEventListener ? SelectRef.current : ReactDOM.findDOMNode(SelectRef.current);
        if (!selectElement || !selectElement.addEventListener) { return null; }
        const handleClick = e => {
            if (menuOpen) {
                let parentElement = e.target;
                let foundThis = false;
                while (!foundThis && parentElement !== e.currentTarget) {
                    foundThis = parentElement.className === ellipsisContainerClass;
                    parentElement = parentElement.parentElement;
                }
                if (!foundThis) { setMenuOpen(false); }
            }
        };
        selectElement.addEventListener("click", handleClick);
        return () => selectElement.removeEventListener("click", handleClick);
    });

    const toggleMenu = () => setMenuOpen(!menuOpen);
    const toggleExport = () => setExportOpen(!exportOpen);

    /**
     * Generate id base on timestamp
     * @returns {integer} unique Id
     */
    const generateId = () => {
        const timestamp = Date.now();  // Get current timestamp in milliseconds
        const randomNum = Math.floor(Math.random() * 1000); // Add a random number for extra uniqueness
        return `${timestamp}-${randomNum}`;
    };

    const triggerAction = (action) => {
        switch (action) {
        case 'clear': {
            onAddOrUpdateSelection(node, {});
            break;
        }
        case 'zoomTo': {
            if (selectionData.features?.length > 0) {
                const extent = bbox(selectionData);
                if (extent) { onZoomToExtent(extent, selectionData.crs.properties[selectionData.crs.type]); }
            }
            break;
        }
        case 'createLayer': {
            if (selectionData.features?.length > 0) {
                const nodeName = node.title + '_Select_';

                // generate id for layer base on timestamp
                const uniqueId = generateId();

                onAddLayer({
                    type: 'vector',
                    visibility: true,
                    name: nodeName + uniqueId,
                    hideLoading: true,
                    // bbox: {
                    //     bounds: bbox({
                    //         type: "FeatureCollection",
                    //         features: selectionData.features
                    //     }),
                    //     crs: node.bbox.crs
                    // },
                    features: selectionData.features
                });
            }
            break;
        }
        case 'exportToGeoJson': {
            if (selectionData.features?.length > 0) { saveAs(new Blob([JSON.stringify(selectionData)], { type: 'application/json' }), node.title + '.json'); }
            break;
        }
        case 'exportToJson': {
            if (selectionData.features?.length > 0) { saveAs(new Blob([JSON.stringify(selectionData.features.map(feature => feature.properties))], { type: 'application/json' }), node.title + '.json'); }
            break;
        }
        case 'exportToCsv': {
            if (selectionData.features?.length > 0) { saveAs(new Blob([Object.keys(selectionData.features[0].properties).join(',') + '\n' + selectionData.features.map(feature => Object.values(feature.properties).join(',')).join('\n')], { type: 'text/csv' }), node.title + '.csv'); }
            break;
        }
        case 'filterData': {
            const customOnChangeLayerProperties = fieldIdName => onChangeLayerProperties(node.id, {
                layerFilter: {
                    // searchUrl: null,
                    // featureTypeConfigUrl: null,
                    // showGeneratedFilter: false,
                    // attributePanelExpanded: true,
                    // spatialPanelExpanded: false,
                    // crossLayerExpanded: false,
                    // showDetailsPanel: false,
                    // groupLevels: 5,
                    // useMapProjection: false,
                    // toolbarEnabled: true,
                    groupFields: [
                        {
                            id: 1,
                            logic: 'OR',
                            index: 0
                        }
                    ],
                    // maxFeaturesWPS: 5,
                    filterFields: selectionData.features.map(feature => ({
                        rowId: new Date().getDate(),
                        groupId: 1,
                        attribute: fieldIdName,
                        operator: '=',
                        value: feature.properties[fieldIdName],
                        type: 'number',
                        fieldOptions: {
                            valuesCount: 0,
                            currentPage: 1
                        },
                        exception: null
                    }))
                    // spatialField: null,
                    // simpleFilterFields: [],
                    // map: null,
                    // filters: [],
                    // crossLayerFilter: null,
                    // autocompleteEnabled: true
                }
            });
            switch (node.type) {
            case 'arcgis': {
                // TODO : implement here when MapStore supports filtering for arcgis services
                throw new Error(`Unsupported layer type: ${node.type}`);
                // break;
            }
            case 'wms':
            case 'wfs': {
                describeFeatureType(node.url, node.name)
                    .then(describe => customOnChangeLayerProperties(describe.featureTypes.find(featureType => node.name.endsWith(featureType.typeName)).properties.find(property => ['xsd:string', 'xsd:int'].find(type => type === property.type) && !property.nillable && property.maxOccurs === 1 && property.minOccurs === 1).name))
                    .catch(err => { throw new Error(`Error while querying layer: ${err.message}`); });
                break;
            }
            default:
                throw new Error(`Unsupported layer type: ${node.type}`);
            }
            break;
        }
        default:
        }
        toggleMenu();
    };

    useEffect(() => {
        switch (node.type) {
        case 'arcgis': {
            const arcgisNumericFields = new Set(['esriFieldTypeSmallInteger', 'esriFieldTypeInteger', 'esriFieldTypeSingle', 'esriFieldTypeDouble']);
            const singleLayerId = parseInt(node.name ?? '', 10);
            Promise.all((Number.isInteger(singleLayerId) ? node.options.layers.filter(l => l.id === singleLayerId) : node.options.layers).map(l => axios.get(`${node.url}/${l.id}`, { params: { f: 'json' } })
                .then(describe => describe.data.fields.filter(field => field.domain === null && arcgisNumericFields.has(field.type)).map(field => field.name))
                .catch(() => [])
            ))
                .then(responses => setNumericFields(responses.map(response => response ?? []).flat()))
                .catch(() => setNumericFields([]));
            break;
        }
        case 'wms':
        case 'wfs': {
            describeFeatureType(node.url, node.name)
                .then(describe => setNumericFields(describe.featureTypes[0].properties.filter(property => property.localType === 'number').map(property => property.name)))
                .catch(() => setNumericFields([]));
            break;
        }
        default:
        }
    }, []);

    return (
        <div className={ellipsisContainerClass}>
            <button className="ellipsis-button" onClick={toggleMenu}>
                ...
            </button>
            {menuOpen && (
                <div className="ellipsis-menu">
                    <p onClick={() => triggerAction('zoomTo')}><Message msgId="layersSelection.button.zoomTo" /></p>
                    <p onClick={() => { toggleMenu(); selectionData.features?.length > 0 ? setStatisticsOpen(true) : null; }}><Message msgId="layersSelection.button.statistics" /></p>
                    <p onClick={() => triggerAction('createLayer')}><Message msgId="layersSelection.button.createLayer" /></p>
                    {node.type !== 'arcgis' && <p onClick={() => triggerAction('filterData')}><Message msgId="layersSelection.button.filterData" /></p>}
                    <div>
                        <p onClick={toggleExport} className="export-toggle">
                            <Message msgId="layersSelection.button.export" />
                            <span>{exportOpen ? "−" : "+"}</span>
                        </p>
                        {exportOpen && (
                            <div>
                                <p onClick={() => triggerAction('exportToGeoJson')}> - <Message msgId="layersSelection.button.exportToGeoJson" /></p>
                                <p onClick={() => triggerAction('exportToJson')}> - <Message msgId="layersSelection.button.exportToJson" /></p>
                                <p onClick={() => triggerAction('exportToCsv')}> - <Message msgId="layersSelection.button.exportToCsv" /></p>
                            </div>
                        )}
                    </div>
                    <p onClick={() => triggerAction('clear')}><Message msgId="layersSelection.button.clear" /></p>
                </div>
            )}
            {statisticsOpen && <Statistics
                setStatisticsOpen={setStatisticsOpen}
                fields={numericFields}
                features={selectionData.features ?? []}
            />}
        </div>
    );
};
