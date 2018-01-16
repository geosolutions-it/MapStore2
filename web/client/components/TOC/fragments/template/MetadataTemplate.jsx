/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const MetadataTemplate = "<div id={model.identifier}>" +
        "<Bootstrap.Table>" +
            "<tbody>" +
                "<tr>" +
                    "<td><Message msgId=\"toc.layerMetadata.identifier\"/></td><td>{model.identifier}</td>" +
                "</tr>" +
                "<tr>" +
                    "<td><Message msgId=\"toc.layerMetadata.title\"/></td><td>{model.title}</td>" +
                "</tr>" +
                "<tr>" +
                    "<td><Message msgId=\"toc.layerMetadata.abstract\"/></td><td>{model.abstract}</td>" +
                "</tr>" +
                "<tr>" +
                    "<td><Message msgId=\"toc.layerMetadata.subject\"/></td><td>{Array.isArray(model.subject) ? model.subject.map((value, i) => <ul key={'meta'+i}><li key={i}>{value}</li></ul>) : model.subject}</td>" +
                "</tr>" +
                "<tr>" +
                    "<td><Message msgId=\"toc.layerMetadata.type\"/></td><td>{model.type}</td>" +
                "</tr>" +
                "<tr>" +
                    "<td><Message msgId=\"toc.layerMetadata.creator\"/></td><td>{model.creator}</td>" +
                "</tr>" +
            "</tbody>" +
        "</Bootstrap.Table>" +
    "</div>";

module.exports = MetadataTemplate;
