import React, { useEffect, useRef, useState } from "react";

/**
 * HOC that wraps a component in a resizable container.
 * @param {React.Component} Component - The component to wrap
 * @returns {React.Component} A component wrapped in a resizable div
 *
 * Props:
 * @prop {boolean} resizeContainer - If true, enables resize functionality (default: true)
 * @prop {number} defaultHeight - Initial height in pixels (default: 300)
 * @prop {number} minHeight - Minimum height in pixels (default: 75)
 * @prop {number} maxHeight - Maximum height in pixels (default: 70% of the window inner height)
 */
const withResize = (Component) => {
    return (props) => {
        const { resizeContainer = true, defaultHeight = 300, minHeight = 75, maxHeight = '70%' } = props;
        const [height, setHeight] = useState(defaultHeight);
        const [isResizing, setIsResizing] = useState(false);
        const containerRef = useRef(null);
        const startYRef = useRef(0);
        const startHeightRef = useRef(0);

        useEffect(() => {
            const maxAllowedHeight = typeof maxHeight === 'number'
                ? maxHeight
                : (window.innerHeight * (maxHeight.replace('%', '')) / 100);

            const handleMouseMove = (e) => {
                if (!isResizing) return;

                const deltaY = e.clientY - startYRef.current;
                const newHeight = startHeightRef.current - deltaY;
                const clampedHeight = Math.max(minHeight, Math.min(newHeight, maxAllowedHeight));
                setHeight(clampedHeight);
            };

            const handleMouseUp = () => {
                setIsResizing(false);
            };

            if (isResizing) {
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
                document.body.style.cursor = 'row-resize';
                document.body.style.userSelect = 'none';
            }

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            };
        }, [isResizing, minHeight, maxHeight]);

        const handleMouseDown = (e) => {
            e.preventDefault();
            setIsResizing(true);
            startYRef.current = e.clientY;
            startHeightRef.current = height;
        };

        // If resizeContainer is false, just render in a normal div
        if (!resizeContainer) {
            return (
                <div>
                    <Component {...props} />
                </div>
            );
        }

        // Render with resize functionality
        return (
            <div
                ref={containerRef}
                style={{
                    height: `${height}px`,
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}
            >
                <div
                    onMouseDown={handleMouseDown}
                    style={{
                        height: '4px',
                        cursor: 'row-resize',
                        backgroundColor: 'transparent',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 10,
                        borderTop: '2px solid transparent',
                        transition: 'border-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderTopColor = '#ccc';
                    }}
                    onMouseLeave={(e) => {
                        if (!isResizing) {
                            e.currentTarget.style.borderTopColor = 'transparent';
                        }
                    }}
                />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <Component {...props} />
                </div>
            </div>
        );
    };
};

export default withResize;
