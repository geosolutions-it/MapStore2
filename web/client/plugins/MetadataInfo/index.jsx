/*
* Copyright 2023, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getMetadataRecordById } from '../../actions/catalog';
import { hideLayerMetadata } from '../../actions/layers';
import { layerMetadataSelector } from '../../selectors/layers';
import Message from '../../components/I18N/Message';
import LayerMetadataModal from '../../components/TOC/fragments/LayerMetadataModal';
import { createPlugin } from '../../utils/PluginsUtils';


function MetadataInfo({
    layerMetadata,
    metadataTemplate,
    onHideLayerMetadata
}) {
    return (
        <LayerMetadataModal
            key="toollayermetadatamodal"
            layerMetadata={layerMetadata}
            metadataTemplate={metadataTemplate}
            hideLayerMetadata={onHideLayerMetadata}
            layerMetadataPanelTitle={<Message msgId="toc.layerMetadata.layerMetadataPanelTitle"/>}
        />
    );
}

MetadataInfo.propTypes = {
    layerMetadata: PropTypes.object,
    metadataTemplate: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.object, PropTypes.func]),
    onHideLayerMetadata: PropTypes.func
};

MetadataInfo.defaultProps = {
    onHideLayerMetadata: () => {}
};

const selector = (state) => ({
    layerMetadata: layerMetadataSelector(state)
});

const MetadataInfoPlugin = connect(selector, {
    onHideLayerMetadata: hideLayerMetadata
})(MetadataInfo);

const MetadataInfoButton = connect(selector, {
    onGetMetadataRecord: getMetadataRecordById,
    onHideLayerMetadata: hideLayerMetadata
})(({
    layerMetadata,
    onGetMetadataRecord,
    onHideLayerMetadata,
    metadataOptions,
    status,
    itemComponent,
    statusTypes,
    ...props
}) => {
    const onShowMetadata = () => {
        if (!layerMetadata.expanded) {
            onGetMetadataRecord(metadataOptions);
        } else {
            onHideLayerMetadata();
        }
    };
    const ItemComponent = itemComponent;
    if ([statusTypes.LAYER].includes(status)) {
        return (
            <ItemComponent
                {...props}
                glyph="info-sign"
                active={!!layerMetadata?.expanded}
                tooltipId={'toc.layerMetadata.toolLayerMetadataTooltip'}
                onClick={() => onShowMetadata()}
            />
        );
    }
    return null;
});

/**
 * Shows metadata info of a layer
 * @name MetadataInfo
 * @class
 * @memberof plugins
 * @prop {string[]|string|object|function} cfg.metadataTemplate custom template for displaying metadata
 * example :
 * ```
 * {
 * "name": "TOC",
 *      "cfg": {
 *          "metadataTemplate": ["<div id={model.identifier}>",
 *              "<Bootstrap.Table className='responsive'>",
 *                  "<thead>",
 *                  "<tr>",
 *                      "<th>Campo</th><th>Valore</th>",
 *                  "</tr>",
 *                  "</thead>",
 *                  "<tbody>",
 *                      "<tr>",
 *                          "<td>Identifier</td><td>{model.identifier}</td>",
 *                      "</tr>",
 *                      "<tr>",
 *                          "<td>Title</td><td>{model.title}</td>",
 *                      "</tr>",
 *                      "<tr>",
 *                          "<td>Abstract</td><td>{model.abstract}</td>",
 *                      "</tr>",
 *                      "<tr>",
 *                          "<td>Subject</td><td>{Array.isArray(model.subject) ? model.subject.map((value, i) => <ul key={'meta'+i}><li key={i}>{value}</li></ul>) : model.subject}</td>",
 *                      "</tr>",
 *                      "<tr>",
 *                          "<td>Type</td><td>{model.type}</td>",
 *                      "</tr>",
 *                      "<tr>",
 *                          "<td>Creator</td><td>{model.creator}</td>",
 *                      "</tr>",
 *                  "</tbody>",
 *              "</Bootstrap.Table>",
 *          "</div>"]
 *      }
 *  }
 * ```
 * @prop {object} cfg.metadataOptions options to pass to iso19139 xml metadata parser
 * @prop {object} cfg.metadataOptions.xmlNamespaces namespaces that are used in the metadata xml
 * ```
 * "xmlNamespaces": {
 *     "gmd": "http://www.isotc211.org/2005/gmd",
 *     "srv": "http://www.isotc211.org/2005/srv",
 *     "gco": "http://www.isotc211.org/2005/gco",
 *     "gmx": "http://www.isotc211.org/2005/gmx",
 *     "gfc": "http://www.isotc211.org/2005/gfc",
 *     "gts": "http://www.isotc211.org/2005/gts",
 *     "gml": "http://www.opengis.net/gml"
 * }
 * ```
 * @prop {object[]} cfg.metadataOptions.extractors metadata properties extractor definitions
 * ```
 * "extractors": [{
 *     "properties": {
 *         "title": "/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:citation/gmd:CI_Citation/gmd:title/gco:CharacterString",
 *         "lastRevisionDate": "/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:citation/gmd:CI_Citation/gmd:date/gmd:CI_Date/gmd:date/gco:Date[../../gmd:dateType/gmd:CI_DateTypeCode[@codeListValue='revision']]",
 *         "pointsOfContact": {
 *             "xpath": "/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:pointOfContact/gmd:CI_ResponsibleParty",
 *             "properties": {
 *                 "individualName": "gmd:individualName/gco:CharacterString",
 *                 "organisationName": "gmd:organisationName/gco:CharacterString",
 *                 "contactInfo": {
 *                     "xpath": "gmd:contactInfo/gmd:CI_Contact",
 *                     "properties": {
 *                         "phone": "gmd:phone/gmd:CI_Telephone/gmd:voice/gco:CharacterString",
 *                         "hoursOfService": "gmd:hoursOfService/gco:CharacterString"
 *                     }
 *                 },
 *                 "role": "gmd:role/gmd:CI_RoleCode/@codeListValue"
 *             }
 *         }
 *     },
 *     "layersRegex": "^espub_mob:gev_ajeu$"
 * }]
 * ```
 *
 * Each extractor is an object, that has two props: "properties" and "layersRegex". "layersRegex" allows to define a regular exression
 * that would be use to determine the names of the layers that the extractor should be used with.
 * "properties" is an object that contains a description of what metadata info should be displayed and how.
 * Each property of this object must be in the following form:
 *
 * ```
 * {
 *   [localizedPropKey]: "xpath string"
 * }
 * ```
 *
 * or
 *
 * ```
 * {
 *   [localizedPropKey]: {
 *     "xpath": "base xpath string",
 *     "properties": {
 *       ...
 *     }
 *   }
 * }
 * ```
 *
 * "localizedPropKey" is a value that is going to be used to compute a localized string id in the default metadata template like this:
 * "toc.layerMetadata.${localizedPropKey}". If the translation is missing a default string will be shown containing localizedPropKey.
 * The value of each "properties" object's prop can be either a string containing an xpath string that will be used to extract
 * a string from metadata xml to be displayed as a value of the corresponding prop in the ui, or an object
 * that describes a subtable, if metadata prop cannot be displayed just as a singular string value. That object has two properties:
 * "xpath", and "properties". "xpath" defines a relative xpath to be used as a base for all properties in "properties". This "properties" object
 * adheres to the same structure described here.
 *
 * If there are multiple extractors which "layersRegex" matches layer's name, the one that occures in the array first will be used for
 * metadata processing.
 */
export default createPlugin('MetadataInfo', {
    component: MetadataInfoPlugin,
    containers: {
        TOC: {
            name: 'MetadataInfo',
            target: 'toolbar',
            Component: MetadataInfoButton,
            position: 12
        }
    }
});
