import React from 'react';
import classnames from "classnames";

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
