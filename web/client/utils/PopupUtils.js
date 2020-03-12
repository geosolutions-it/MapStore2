/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import uuid from "uuid";
export const createContainer = ( id = uuid(), className = "ms-map-popup") => {
    const c = document.createElement('div');
    c.setAttribute("id", id + "-map-popup");
    c.setAttribute("class", className);
    return c;
};
export const isHTML = (text = "") =>  text.startsWith("<");
// Append a node element a text ar an HTML string
export const append = (container, content) => {
    if (!content) {
        return container;
    }
    if (content instanceof Node) {
        const docFrag = document.createDocumentFragment();
        docFrag.appendChild(content);
        container.appendChild(docFrag);
    } else if (isHTML(content)) {
        container.innerHTML = content;
    } else {
        container.append(document.createTextNode(String(content)));
    }
    return container;
};
export const getPopupCoordinates = ({lat, lng} = {}, flip = false) => flip && [lng, lat] || [lat, lng];
