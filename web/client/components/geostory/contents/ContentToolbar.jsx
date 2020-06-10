
/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";
import Toolbar from '../../misc/toolbar/Toolbar';
import {SizeButtonToolbar, AlignButtonToolbar, ThemeButtonToolbar, DeleteButtonToolbar} from "./ToolbarButtons";

const BUTTON_CLASSES = 'square-button-md no-border';
const toolButtons = {
    size: (props) => ({
        renderButton: <SizeButtonToolbar {...props}/>
    }),
    align: (props) => ({
        renderButton: <AlignButtonToolbar {...props}/>
    }),
    theme: (props) => ({
        renderButton: <ThemeButtonToolbar {...props}/>
    }),
    fit: ({editMap: disabled = false, fit, update = () => {} }) => ({
        // using normal ToolbarButton because this is a toggle button without options
        value: fit,
        glyph: fit === "contain" ? "fit-cover" : "fit-contain",
        disabled,
        visible: true,
        tooltipId: fit === "contain" ? "geostory.contentToolbar.cover" : "geostory.contentToolbar.fit",
        onClick: () => update('fit', fit === "contain" ? "cover" : "contain")
    }),
    cover: ({editMap: disabled = false, cover, updateSection = () => {} }) => ({
        // using normal ToolbarButton because this is a toggle button without options
        value: cover,
        glyph: cover ? "height-auto" : "height-view",
        visible: true,
        disabled,
        tooltipId: cover ? "geostory.contentToolbar.contentHeightAuto" : "geostory.contentToolbar.contentHeightView",
        onClick: () => updateSection({cover: !cover}, "merge")
    }),
    editMedia: ({editMap: disabled = false, path, editMedia = () => {} }) => ({
        // using normal ToolbarButton because this has no options
        glyph: "pencil",
        "data-button": "pencil",
        visible: true,
        disabled,
        tooltipId: "geostory.contentToolbar.editMedia",
        onClick: () => {
            editMedia({path});
        }
    }),
    // remove content
    remove: (props) => ({
        renderButton: <DeleteButtonToolbar {...props}/>

    }),
    editMap: ({editMap = false, update = () => {}}) => ({
        // using normal ToolbarButton because this has no options
        glyph: "map-edit",
        visible: true,
        disabled: editMap,
        bsStyle: editMap ? "success" : "default",
        tooltipId: "geostory.contentToolbar.editMap",
        onClick: () => {
            update( 'editMap', !editMap);
        }
    }),
    editURL: ({ editURL = false, path, editWebPage = () => {}}) => ({
        glyph: "pencil",
        visible: true,
        disabled: editURL,
        bsStyle: editURL ? "success" : "default",
        tooltipId: "geostory.contentToolbar.editURL",
        onClick: () => {
            editWebPage({path});
        }
    }),
    muted: ({ update, muted }) => ({
        glyph: muted ? 'muted' : 'audio',
        visible: true,
        active: !muted,
        tooltipId: muted ? 'geostory.contentToolbar.enableAudio' : 'geostory.contentToolbar.disableAudio',
        onClick: () => {
            update('muted', !muted);
        }
    }),
    autoplay: ({ update, autoplay, fit }) => ({
        glyph: 'play-circle',
        visible: !!(fit !== 'cover'),
        active: autoplay,
        tooltipId: autoplay ? 'geostory.contentToolbar.disableAutoplay' : 'geostory.contentToolbar.enableAutoplay',
        onClick: () => {
            update('autoplay', !autoplay);
        }
    }),
    loop: ({ update, loop, fit }) => ({
        glyph: 'loop',
        visible: !!(fit !== 'cover'),
        active: loop,
        tooltipId: loop ? 'geostory.contentToolbar.disableLoop' : 'geostory.contentToolbar.enableLoop',
        onClick: () => {
            update('loop', !loop);
        }
    }),
    showCaption: ({ editMap: disabled = false, update, showCaption, caption, description }) => ({
        glyph: 'caption',
        visible: !!(caption || description),
        disabled,
        active: !!(showCaption && !disabled),
        tooltipId: showCaption ? 'geostory.contentToolbar.hideCaption' : 'geostory.contentToolbar.showCaption',
        onClick: () => {
            update('showCaption', !showCaption);
        }
    })
};

/**
 * Toolbar to update properties of content,
 * @prop {array} tools list of tool's names or object ({ id: 'toolName' }) to display in the edit toolbar, available tools `size`, `align` and `theme`
 * @prop {string} size one of `small`, `medium`, `large` and `full`
 * @prop {string} align one of `left`, `center` and `right`
 * @prop {string} theme one of `bright`, `bright-text`, `dark` and `dark-text`
 * @prop {string} fit one of `contain` and `cover`
 * @prop {boolean} muted enable/disable muted property (video)
 * @prop {boolean} autoplay enable/disable autoplay property (video)
 * @prop {boolean} loop enable/disable loop property (video)
 * @prop {boolean} showCaption show/hide caption under media content
 * @prop {function} update handler for select properties events, parameters (key, value)
 * @example
 *
 * // tools prop with string
 * function Content({ children }) {
 *  return <div className="test-toolbar"><ContentToolbar tools={[ 'size' ]}/>{children}</div>;
 * }
 *
 * // tools prop with object entry to override default props
 * function Content({ children }) {
 *  const size = { id: 'size', pullRight: true }; // override pullRight props of size dropdown
 *  return <div className="test-toolbar"><ContentToolbar tools={[ size ]}/>{children}</div>;
 * }
 *
 */
export default function ContentToolbar({
    tools = [],
    ...props
}) {
    return (
        <div className="ms-content-toolbar">
            <Toolbar
                btnDefaultProps={{
                    className: BUTTON_CLASSES,
                    noTooltipWhenDisabled: true
                }}
                buttons={tools
                    .filter((tool) => tool?.id && toolButtons[tool.id] || toolButtons[tool])
                    .map(tool => tool?.id && toolButtons[tool.id]({ ...props, ...tool }) || toolButtons[tool](props))}/>
        </div>
    );
}
