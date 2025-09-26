/**
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import MousePositionLabelDMS from './MousePositionLabelDMS';
import MousePositionLabelYX from './MousePositionLabelYX';
import MousePositionLabelDD from './MousePositionLabelDD';
import MousePositionLabelDM from './MousePositionLabelDM';
import MousePositionLabelDMSNW from './MousePositionLabelDMSNW';

const templates = {
    MousePositionLabelDMS,
    MousePositionLabelYX,
    MousePositionLabelDD,
    MousePositionLabelDM,
    MousePositionLabelDMSNW
};

/**
 * Gets a template component by its name
 * @param {string} templateName - Name of the template to retrieve
 * @returns {React.Component} The template component
 * @throws {Error} When template is not found
 */
export const getTemplate = (templateName) => {
    if (!templates[templateName]) {
        throw new Error(`Template "${templateName}" not found in registry`);
    }
    return templates[templateName];
};

export default templates;
