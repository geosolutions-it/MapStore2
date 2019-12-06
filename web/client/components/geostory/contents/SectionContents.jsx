/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { compose, defaultProps, withHandlers, setDisplayName } from "recompose";
import Contents from './Contents';
import SectionContent from "./SectionContent";

/**
 * Enhances the Contents container to wrap the methods for SectionContents, setting up the correct path
 * for the handlers and to pass the ContentComponent enhanced for sections
 */
export default compose(
    // SectionContent is enhanced to wrap, add scroll events and so on
    defaultProps({
        ContentComponent: SectionContent
    }),
    withHandlers({
        // NOTE: adds the section initial path to content. The Contents adds contents[...] on it's own for inner add buttons
        editMedia: ({ editMedia = () => { }, sectionId }) => ({path}, ...args) => editMedia({path: `sections[{"id": "${sectionId}"}].` + path}, ...args),
        editWebPage: ({ editWebPage = () => { }, sectionId }) => ({path}, ...args) => editWebPage({path: `sections[{"id": "${sectionId}"}].` + path}, ...args),
        add: ({ add = () => { }, sectionId }) => (path, ...args) => add(`sections[{"id": "${sectionId}"}].` + path, ...args),
        update: ({ update = () => { }, sectionId }) => (path, ...args) => update(`sections[{"id": "${sectionId}"}].` + path, ...args),
        remove: ({ remove = () => { }, sectionId }) => (path, ...args) => remove(`sections[{"id": "${sectionId}"}].` + path, ...args)
    }),
    setDisplayName("SectionContents")
)(Contents);

