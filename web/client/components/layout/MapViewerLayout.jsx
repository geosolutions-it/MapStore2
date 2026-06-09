import React from "react";
import FlexBox, { FlexFill } from "./FlexBox";
import useResizeObserver from "./hooks/useResizeObserver";

const MapViewerLayout = ({
    id,
    header,
    footer,
    background,
    leftColumn,
    rightColumn,
    columns,
    className,
    top,
    bottom,
    children,
    bodyClassName,
    onResize
}) => {
    const contentResizeRef = useResizeObserver({
        onResize,
        watch: ['bottom']
    });
    return (
        <FlexBox id={id} className={className} column classNames={['_fill', '_absolute', 'ms-map-viewer-layout']}>
            {header}
            <FlexFill flexBox column className={bodyClassName} classNames={['_relative', 'ms-map-viewer-layout-body']}>
                <div className="_fill _absolute">{background}</div>
                <div className="_relative">{top}</div>
                <FlexFill flexBox classNames={['_relative', 'ms-map-viewer-layout-main-content']}>
                    <div className="_relative ms-map-viewer-layout-left-column">{leftColumn}</div>
                    <FlexFill ref={contentResizeRef} classNames={['_relative', 'ms-map-viewer-layout-content']}>
                        {children}
                    </FlexFill>
                    <div className="_relative ms-map-viewer-layout-right-column">{rightColumn}</div>
                    <div className="ms-map-viewer-layout-columns">{columns}</div>
                </FlexFill>
                <div className="_relative ms-map-viewer-layout-bottom">{bottom}</div>
            </FlexFill>
            {footer}
        </FlexBox>
    );
};

export default MapViewerLayout;
