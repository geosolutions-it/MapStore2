/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const MetadataTemplate = "<div id={model.identifier}>" +
        "<Bootstrap.Table>" +
            "<thead>" +
            "<tr>" +
                "<th>Campo</th><th>Valore</th>" +
            "</tr>" +
            "</thead>" +
            "<tbody>" +
                "<tr>" +
                    "<td>Identifier</td><td>{model.identifier}</td>" +
                "</tr>" +
                "<tr>" +
                    "<td>Title</td><td>{model.title}</td>" +
                "</tr>" +
                "<tr>" +
                    "<td>Abstract</td><td>{model.abstract}</td>" +
                "</tr>" +
                "<tr>" +
                    "<td>Subject</td><td>{Array.isArray(model.subject) ? model.subject.map((value, i) => <ul key={'meta'+i}><li key={i}>{value}</li></ul>) : model.subject}</td>" +
                "</tr>" +
                "<tr>" +
                    "<td>Type</td><td>{model.type}</td>" +
                "</tr>" +
                "<tr>" +
                    "<td>Creator</td><td>{model.creator}</td>" +
                "</tr>" +
            "</tbody>" +
        "</Bootstrap.Table>" +
    "</div>";

module.exports = MetadataTemplate;
