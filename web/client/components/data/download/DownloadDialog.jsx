/**
  * Copyright 2020, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import { findIndex, head } from 'lodash';
import assign from 'object-assign';
import { Glyphicon } from 'react-bootstrap';
import Spinner from 'react-spinkit';

import Loader from '../../misc/Loader';
import Dialog from '../../misc/Dialog';
import Portal from '../../misc/Portal';
import Message from '../../I18N/Message';
import EmptyView from '../../misc/EmptyView';
import DownloadOptions from './DownloadOptions';
import Button from '../../misc/Button';
import {getAttributesList} from "../../../utils/FeatureGridUtils";

import { parseString } from 'xml2js';
import { stripPrefix } from 'xml2js/lib/processors';
import { describeProcess } from '../../../observables/wps/describe';

/**
 * @prop {Array<{
 *   name: string,               // MIME type of the format (e.g., 'application/json')
 *   label: string,              // Human-readable label shown in the UI (e.g., 'GeoJSON')
 *   type: 'vector' | 'raster',  // Type of data format, used to filter or group options
 *   validServices: string[]     // List of services this format is valid for (e.g., ['wps', 'wfs'])
 * }>} formats -
 * List of available export formats. Each format defines the MIME type, display label,
 * type of data (vector or raster), and the services (e.g., WPS, WFS) that support it.
 * ABOUT MIME TYPES: 'application/wfs-collection-1.0' AND 'application/wfs-collection-1.1'

    There is no direct 1:1 mapping, but if you want to export the same feature content using GML, the equivalent output formats would be:

    JSON Format	GML Equivalent MIME Type	Notes
    wfs-collection-1.0	text/xml; subtype=gml/2.1.2	Similar to WFS 1.0 with GML 2
    wfs-collection-1.1	text/xml; subtype=gml/3.1.1	Similar to WFS 1.1 with GML 3.1

    refer: https://docs.geoserver.org/main/en/user/services/wfs/outputformats.html
 */
const DownloadDialog = ({
    attributes,
    checkingWPSAvailability,
    closeGlyph,
    cropDataSetVisible,
    customAttributeSettings,
    defaultSelectedService, // per node
    defaultSrs,
    downloadLayer,
    downloadOptions,
    enabled,
    filterObj,
    formats,
    formatsLoading,
    hideServiceSelector,
    loading,
    mapLayer,
    onClearDownloadOptions,
    onClose,
    onDownloadOptionChange,
    onExport,
    onFormatOptionsFetch,
    onSetService,
    onSetWPSAvailability,
    service,
    srsList,
    virtualScroll,
    wfsFormats,
    wpsAvailable
}) => {

    const selectedLayer = mapLayer || downloadLayer || {};

    const [showLoader, setShowLoader] = useState(false);
    // const [loadedLayer, setLoadedLayer] = useState(layer);

    const checkWPSAvailability = (layerToCheck, selectedService) => {
        setShowLoader(true);

        describeProcess(layerToCheck.url, 'gs:DownloadEstimator,gs:Download')
            .toPromise()
            .then((response) => // xml to obj
                new Promise((resolve, reject) => parseString(response.data, { tagNameProcessors: [stripPrefix] }, (err, res) => (err ? reject(err) : resolve(res))))
            )
            .then((xmlObj) => {
                const ids = [
                    xmlObj?.ProcessDescriptions?.ProcessDescription?.[0]?.Identifier?.[0],
                    xmlObj?.ProcessDescriptions?.ProcessDescription?.[1]?.Identifier?.[0]
                ];

                const isWpsAvailable = findIndex(ids, x => x === 'gs:DownloadEstimator') > -1 && findIndex(ids, x => x === 'gs:Download') > -1;
                const isWfsAvailable = layerToCheck.search?.url;
                const shouldSelectWps = isWpsAvailable && (selectedService === 'wps' || !isWfsAvailable);

                // eslint-disable-next-line no-console
                // console.log('describeProcess', isWfsAvailable, isWpsAvailable, xmlObj);

                onSetService(shouldSelectWps ? 'wps' : 'wfs');
                onSetWPSAvailability(shouldSelectWps);
            })
            .catch(() => {
                onSetService('wfs');
                onSetWPSAvailability(false);
            })
            .finally(() => {
                setShowLoader(false);
            });
    };

    useEffect(() => {
        if (enabled) {
            onClearDownloadOptions(defaultSelectedService);

            // if (selectedLayer.type === 'wms') {
            // condition added only after this review:
            // https://github.com/geosolutions-it/MapStore2/pull/6204/commits/7dfb575983cea4d5a3c36de5cdfb19a0141bd74d
            checkWPSAvailability(selectedLayer, defaultSelectedService);
            // }
        }
    }, [enabled, selectedLayer, defaultSelectedService]); // equivalent componentDidUpdate

    // useEffect(() => {
    //     return () => {
    //         onClearDownloadOptions(defaultSelectedService);
    //     };
    // }, []);

    const renderIcon = () => {
        return loading ? <div style={{"float": "left"}}><Spinner spinnerName="circle" noFadeIn/></div> : <Glyphicon glyph="download" />;
    };

    const handleExport = () => {
        const selectedSrs = downloadOptions && downloadOptions.selectedSrs || defaultSrs || (head(srsList) || {}).name;
        const propertyName = getAttributesList(attributes, customAttributeSettings);
        onExport(selectedLayer?.url, filterObj, assign({}, downloadOptions, {selectedSrs}, {propertyName}));
    };

    const findValidFormats  = fmt => formats.filter(({validServices, type = 'vector'}) =>
        (!validServices || findIndex(validServices, x => x === fmt) > -1) &&
            (type === 'vector' && selectedLayer?.search?.url || type === 'raster' && !selectedLayer?.search?.url));

    const validWFSFormats = findValidFormats('wfs');
    const validWPSFormats = findValidFormats('wps');
    const wfsFormatsList = validWFSFormats.length > 0 ?
        validWFSFormats.filter(f => wfsFormats.find(wfsF => wfsF.name.toLowerCase() === f.name.toLowerCase())) :
        wfsFormats;
    const wfsAvailable = Boolean(selectedLayer?.search?.url);

    const formatsAvailable = service === 'wfs' ? wfsFormatsList : validWPSFormats;

    return enabled ? (<Portal>
        <Dialog id="mapstore-export" draggable={false} modal>
            <span role="header">
                <span className="modal-title  about-panel-title"><Message msgId="layerdownload.title" /></span>
                <button onClick={onClose} className="settings-panel-close close">{closeGlyph ? <Glyphicon glyph={closeGlyph}/> : <span>×</span>}</button>
            </span>
            <div role="body">
                {showLoader ?
                    <Loader size={100} style={{margin: '0 auto'}}/> :

                    !wpsAvailable && !wfsAvailable ?

                        <EmptyView title={<Message msgId="layerdownload.noSupportedServiceFound"/>}/> :

                        <DownloadOptions
                            attributes={attributes}
                            cropDataSetVisible={cropDataSetVisible}
                            customAttributesSettings={customAttributeSettings}
                            defaultSelectedService={defaultSelectedService}
                            defaultSrs={defaultSrs}
                            downloadFilteredVisible={!!selectedLayer?.layerFilter || (!!filterObj?.filterFields?.length || filterObj?.spatialFields?.length )}
                            downloadOptions={downloadOptions}
                            filterObj={filterObj}
                            formatOptionsFetch={service === 'wfs' ? onFormatOptionsFetch : () => {}}
                            formats={formatsAvailable}
                            formatsLoading={formatsLoading}
                            hideServiceSelector={hideServiceSelector}
                            layer={selectedLayer}
                            onChange={onDownloadOptionChange}
                            onClearDownloadOptions={onClearDownloadOptions}
                            onSetService={onSetService}
                            service={service}
                            srsList={srsList}
                            virtualScroll={virtualScroll}
                            wfsAvailable={wfsAvailable}
                            wpsAdvancedOptionsVisible={!selectedLayer?.search?.url}
                            wpsAvailable={wpsAvailable}
                        />}
            </div>

            {!checkingWPSAvailability && <div role="footer">
                <Button
                    bsStyle="primary"
                    className="download-button"
                    disabled={formatsLoading || formats.length === 0}
                    onClick={handleExport}>
                    {renderIcon()} <Message msgId="layerdownload.export" />
                </Button>
            </div>}
        </Dialog>
    </Portal>) : null;
};

DownloadDialog.propTypes = {
    attributes: PropTypes.array,
    checkingWPSAvailability: PropTypes.bool,
    closeGlyph: PropTypes.string,
    cropDataSetVisible: PropTypes.bool,
    customAttributeSettings: PropTypes.object,
    defaultSelectedService: PropTypes.string,
    defaultSrs: PropTypes.string,
    downloadLayer: PropTypes.object,
    downloadOptions: PropTypes.object,
    enabled: PropTypes.bool,
    filterObj: PropTypes.object,
    formats: PropTypes.array,
    formatsLoading: PropTypes.bool,
    hideServiceSelector: PropTypes.bool,
    loading: PropTypes.bool,
    mapLayer: PropTypes.object,
    onCheckWPSAvailability: PropTypes.func,
    onClearDownloadOptions: PropTypes.func,
    onClose: PropTypes.func,
    onDownloadOptionChange: PropTypes.func,
    onExport: PropTypes.func,
    onFormatOptionsFetch: PropTypes.func,
    onSetService: PropTypes.func,
    onSetWPSAvailability: PropTypes.func,
    service: PropTypes.string,
    srsList: PropTypes.array,
    virtualScroll: PropTypes.bool,
    wfsFormats: PropTypes.array,
    wpsAvailable: PropTypes.bool
};

DownloadDialog.defaultProps = {
    onExport: () => {},
    onClose: () => {},
    onCheckWPSAvailability: () => {},
    onSetService: () => {},
    onSetWPSAvailability: () => {},
    onDownloadOptionChange: () => {},
    onClearDownloadOptions: () => {},
    onFormatOptionsFetch: () => {},
    checkingWPSAvailability: false,
    closeGlyph: "1-close",
    wpsAvailable: false,
    service: 'wfs', // the current value of the service select
    defaultSelectedService: 'wps', // the initial value for setting the default service value
    wfsFormats: [],
    formats: [
        {name: 'image/tiff', label: 'TIFF', type: 'raster', validServices: ['wps']},
        {name: 'application/arcgrid', label: 'ArcGrid', type: 'raster', validServices: ['wps']},
        {name: 'application/json', label: 'GeoJSON', type: 'vector', validServices: ['wps']},
        {name: 'application/zip', label: 'Shapefile', type: 'vector', validServices: ['wps']},
        {name: 'text/csv', label: 'CSV', type: 'vector', validServices: ['wps']},
        {name: 'application/wfs-collection-1.0', label: 'GML2', type: 'vector', validServices: ['wps']},
        {name: 'application/wfs-collection-1.1', label: 'GML3', type: 'vector', validServices: ['wps']}
    ],
    formatsLoading: false,
    srsList: [
        {name: "native", label: "Native"},
        {name: "EPSG:4326", label: "WGS84"}
    ],
    virtualScroll: true,
    downloadOptions: {},
    hideServiceSelector: false
};

export default DownloadDialog;
