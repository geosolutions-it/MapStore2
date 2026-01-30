import React, { useEffect, useRef, useState } from "react";
import './style.less';

/**
 * HOC that wraps a component in a resizable container.
 * @param {React.Component} Component - The component to wrap
 * @returns {React.Component} A component wrapped in a resizable div
 *
 * Props:
 * @prop {boolean} hasNoGeometry - When true, disables resize functionality (default: false).
 * If true, the wrapped component is rendered to fill the available height without resize functionality.
 * @prop {number} defaultHeight - Initial height in pixels (default: 300)
 * @prop {number} minHeight - Minimum height in pixels (default: 75)
 * @prop {number} maxHeight - Maximum height in pixels (default: 70% of the window inner height)
 */
const withResize = (Component) => {
    return (props) => {
        const { hasNoGeometry = false, defaultHeight = 300, minHeight = 75, maxHeight = '70%' } = props;
        const [height, setHeight] = useState(defaultHeight);
        const [isResizing, setIsResizing] = useState(false);
        const containerRef = useRef(null);
        const startYRef = useRef(0);
        const startHeightRef = useRef(0);

        useEffect(() => {
            const maxAllowedHeight = typeof maxHeight === 'number'
                ? maxHeight
                : (window.innerHeight * (maxHeight.replace('%', '')) / 100);

            const handlePointerMove = (e) => {
                if (!isResizing) return;

                const deltaY = e.clientY - startYRef.current;
                const newHeight = startHeightRef.current - deltaY;
                const clampedHeight = Math.max(minHeight, Math.min(newHeight, maxAllowedHeight));
                setHeight(clampedHeight);
            };

            const handlePointerUp = () => {
                setIsResizing(false);
            };

            if (isResizing) {
                document.addEventListener('pointermove', handlePointerMove);
                document.addEventListener('pointerup', handlePointerUp);
            }

            return () => {
                document.removeEventListener('pointermove', handlePointerMove);
                document.removeEventListener('pointerup', handlePointerUp);
            };
        }, [isResizing, minHeight, maxHeight]);

        const handleMouseDown = (e) => {
            e.preventDefault();
            setIsResizing(true);
            startYRef.current = e.clientY;
            startHeightRef.current = height;
        };

        // If hasNoGeometry is true, render the component without the resize container
        if (hasNoGeometry) {
            return (
                <div className="ms-featuregrid-fill">
                    <Component {...props} />
                </div>
            );
        }

        // Render with resize functionality
        return (
            <div
                ref={containerRef}
                className="ms-resize-container"
                style={{ height: `${height}px` }}
            >
                <div
                    onMouseDown={handleMouseDown}
                    className="ms-resize-handle"
                />
                <div className="ms-resize-content">
                    <Component {...props} />
                </div>
            </div>
        );
    };
};

export default withResize;
