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
 * Enhances the Contents container to wrap the methods for SectionContents, setting up th ecorrect path
 * for the handlers and to pass the ContentComponent enhanced for sections
 */
export default compose(
    defaultProps({
        ContentComponent: SectionContent
    }),
    withHandlers({
        add: ({ add = () => { }, sectionId }) => (path, ...args) => add(`sections[{"id": "${sectionId}"}].` + path, ...args),
        update: ({ update = () => { }, sectionId }) => (path, ...args) => update(`sections[{"id": "${sectionId}"}].` + path, ...args)
    }),
    setDisplayName("SectionContents")
)(Contents);

