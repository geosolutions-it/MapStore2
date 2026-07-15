import React from 'react';
import PropTypes from 'prop-types';
import { Button, Glyphicon } from 'react-bootstrap';
import useCheckScroll from '../../hooks/useCheckScroll';
import Tabs from '../catalog/resources/Tabs';

/**
 * Renders underline tabs in a horizontally scrollable strip with optional controls.
 */
const ScrollableTabs = ({ className, tabs, ...props }) => {
    const [scrollRef, showButtons, isLeftDisabled, isRightDisabled, scroll] = useCheckScroll({ data: tabs });

    return (
        <div className="ms-scrollable-tabs">
            {showButtons ? (
                <Button
                    aria-label="Scroll tabs left"
                    className="square-button ms-scrollable-tabs-control"
                    disabled={isLeftDisabled}
                    onClick={() => scroll('left')}
                    title="Scroll tabs left">
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
                    aria-label="Scroll tabs right"
                    className="square-button ms-scrollable-tabs-control"
                    disabled={isRightDisabled}
                    onClick={() => scroll('right')}
                    title="Scroll tabs right">
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
