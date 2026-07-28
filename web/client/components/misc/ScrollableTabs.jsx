import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';
import useCheckScroll from '../../hooks/useCheckScroll';
import Tabs from '../catalog/resources/Tabs';
import { ButtonWithTooltip as Button } from './Button';

/**
 * Renders underline tabs in a horizontally scrollable strip with optional controls.
 */
const ScrollableTabs = ({ className, tabs, ...props }) => {
    const [scrollRef, showButtons, isLeftDisabled, isRightDisabled, scroll] = useCheckScroll({ data: tabs });

    return (
        <div className="ms-scrollable-tabs">
            {showButtons ? (
                <Button
                    className="square-button ms-scrollable-tabs-control"
                    disabled={isLeftDisabled}
                    onClick={() => scroll('left')}
                    tooltipId="scrollableTabs.scrollLeft">
                    <Glyphicon glyph="chevron-left"/>
                </Button>
            ) : null}
            <div ref={scrollRef} className="ms-scrollable-tabs-content">
                <Tabs
                    {...props}
                    className={className}
                    tabs={tabs}/>
            </div>
            {showButtons ? (
                <Button
                    className="square-button ms-scrollable-tabs-control"
                    disabled={isRightDisabled}
                    onClick={() => scroll('right')}
                    tooltipId="scrollableTabs.scrollRight">
                    <Glyphicon glyph="chevron-right"/>
                </Button>
            ) : null}
        </div>
    );
};

ScrollableTabs.propTypes = {
    className: PropTypes.string,
    tabs: PropTypes.array
};

ScrollableTabs.defaultProps = {
    className: 'ms-tabs tabs-underline',
    tabs: []
};

export default ScrollableTabs;
