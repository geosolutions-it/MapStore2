/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import { Modes } from "../../../utils/GeoStoryUtils";
import Content from './Content';

import AddBar from "../common/AddBar";

/**
 * Generic Container for story contents.
 * Renders the contents and associate the handlers modifying the handlers accordingly. Adds also the add buttons after each content.
 * @prop {string} className
 * @prop {object} contentProps
 * @prop {object[]} addButtons buttons for the popup toolbar. If empty or not present, the add button will not show.
 * The object handles the click event (TODO: allow customization) and triggers add handler with the correct path and position.
 * You can configure the type with `template` property of this object as 3rd argument of `add` handler
 * @prop {string} mode
 * @prop {component} ContentComponent component to use as content.
 * @prop {function} add handler for add events. parameters are (path, position, element)
 * @prop {function} update handler for update events.parameters are (path, value, mode)
 * @prop {object} tools list of tool's names to display in the edit toolbar
 * @example
 * ```
 * // tools configuration
 * // this example renders edit toolbar only for contents of type `text`
 * // with 3 buttons related to size, align and theme properties.
 * const tools = {
 *  text: ['size', 'align', 'theme'] // see ContentToolbar component for available properties
 * };
 * ```
 */
export default ({
    viewWidth,
    viewHeight,
    className,
    contentProps = {},
    addButtons = [],
    tools = [],
    contents = [],
    ContentComponent = Content,
    mode,
    sectionType,
    editMedia = () => {},
    editWebPage = () => {},
    add = () => {},
    update = () => {},
    remove = () => {},
    bubblingTextEditing = () => {},
    storyTheme,
    sections = [],
    storyFonts
}) =>
    (<div className={className}>
        {contents.reduce(( rendered = [], { id, ...props }) => {
            const content =
                [(<ContentComponent
                    id={id}
                    key={`${id}-content`}
                    mode={mode}
                    viewWidth={viewWidth}
                    sectionType={sectionType}
                    viewHeight={viewHeight}
                    editMedia={({path = ""}, ...args) => editMedia({path: `contents[{"id": "${id}"}]` + path}, ...args)}
                    editWebPage={({path = ""}, ...args) => editWebPage({ path: `contents[{"id": "${id}"}]` + path }, ...args)}
                    // restructure the path to give it the correct scope
                    add={(path, ...args) => add(`contents[{"id": "${id}"}].` + path, ...args)}
                    update={(path, ...args) => update(`contents[{"id": "${id}"}].` + path, ...args)}
                    remove={(path, ...args) => remove(`contents[{"id": "${id}"}]` + (path ? "." + path : ""), ...args)}
                    {...contentProps}
                    {...props}
                    storyTheme={storyTheme}
                    storyFonts={storyFonts}
                    bubblingTextEditing={bubblingTextEditing}
                    tools={tools && tools[props.type]}
                    sections={sections} />)];
            if (mode === Modes.EDIT && addButtons.length > 0) {
                content.push(
                    <AddBar
                        key={`${id}-content-add-buttons`}
                        containerWidth={viewWidth}
                        containerHeight={viewHeight}
                        buttons={addButtons.map((button = {}) => ({
                            ...button,
                            onClick: () => add(`contents`, id, button.template)
                        }))}
                    />
                );
            }
            return [...rendered, ...content];
        }, [])}
    </div>);
