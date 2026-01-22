import React from 'react';

const AutoRefreshMenu = React.forwardRef((props, ref) => {
    return (
        <div
            ref={ref}
            className="dropdown-menu"
            style={{
                left: 'auto',
                right: 0,
                padding: '10px',
                minWidth: '200px',
                maxHeight: "calc(100vh / 2)",
                overflowY: "auto",
                zIndex: 9999
            }}>
            {props.children}
        </div>
    );
});

export default AutoRefreshMenu;
