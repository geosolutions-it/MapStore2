import React from "react";
import FlexBox, { FlexFill } from "./FlexBox";

export default ({
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
    bodyClassName
}) => {
    return (
        <FlexBox id={id} className={className} column classNames={['_fill', '_absolute']}>
            {header}
            <FlexFill flexBox column className={bodyClassName} classNames={['_relative', 'ms2-layout-body']}>
                <div className="_fill _absolute">{background}</div>
                <div className="_relative">{top}</div>
                <FlexFill flexBox classNames={['_relative', 'ms2-layout-main-content']}>
                    <div className="_relative ms2-layout-left-column">{leftColumn}</div>
                    <FlexFill classNames={['_relative', 'ms2-layout-content']}>
                        {children}
                    </FlexFill>
                    <div className="_relative ms2-layout-right-column">{rightColumn}</div>
                    <div className="ms2-layout-columns">{columns}</div>
                </FlexFill>
                <div className="_relative">{bottom}</div>
            </FlexFill>
            {footer}
        </FlexBox>
    );
};
