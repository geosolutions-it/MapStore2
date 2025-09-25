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

/**
 * Lists all available template names
 * @returns {string[]} Array of template names
 */
export const getAvailableTemplates = () => Object.keys(templates);

/**
 * Registers a new template in the registry
 * @param {string} templateName - Name for the new template
 * @param {React.Component} templateComponent - The template component
 * @returns {void}
 */
export const registerTemplate = (templateName, templateComponent) => {
    templates[templateName] = templateComponent;
};

export default templates;
