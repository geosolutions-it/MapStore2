import React from 'react';
import classnames from "classnames";

/**
 * Wrapper for DockablePanel with main intension to support applying of custom styling to make dock panels have proper
 * offset depending on the sidebars presence on the page
 * @memberof components.misc.panels
 * @name DockContainer
 * @param id {string} - id applied to the container
 * @param children {JSX.Element}
 * @param dockStyle {object} - style object obtained from mapLayoutValuesSelector and used to calculate offsets
 * @param className {string} - class name
 * @param style - style object to apply to the container. Can be used to overwrite styles applied by dockStyle calculations
 * @returns {JSX.Element}
 * @constructor
 */
const DockContainer = ({ id, children, dockStyle, className, style = {}}) => {
    const persistentStyle = {
        width: `calc(100% - ${(dockStyle?.right ?? 0) + (dockStyle?.left ?? 0)}px)`,
        transform: `translateX(-${(dockStyle?.right ?? 0)}px)`,
        pointerEvents: 'none'
    };
    return (
        <div id={id} className={classnames({
            ...(className ? {[className]: true} : {}),
            'dock-container': true
        })} style={{...persistentStyle, ...style}}>
            {children}
        </div>
    );
};

export default DockContainer;
