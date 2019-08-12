/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import { Modes } from "../../../utils/GeoStoryUtils";
import AddBar from "../common/AddBar";

export default ({
        className,
        contentProps = {},
        addButtons = [],
        contents=[],
        ContentComponent,
        mode,
        add = () => {},
        update= () => {}}) =>
    (<div className={className}>
        {contents.reduce(( rendered = [], { id, ...props }) => {
            const content =
                [(<ContentComponent
                    id={id}
                    mode={mode}
                    add={(path, ...args) => add(`contents[{"id": "${id}"}].` + path, ...args)}
                    update={(path, ...args) => update(`contents[{"id": "${id}"}].` + path, ...args)}
                    {...contentProps}
                    {...props} />)];
            if (mode === Modes.EDIT && addButtons.length > 0) {
                content.push(
                    <AddBar
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
