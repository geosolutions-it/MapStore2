import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';
import useCheckScroll from '../../hooks/useCheckScroll';
import { ButtonWithTooltip as Button } from './Button';

/**
 * Renders underline tabs in a horizontally scrollable strip with optional controls.
 * @prop {string} className class name applied to the tabs list
 * @prop {array} tabs list of tabs, each one with `title` and `eventKey`
 * @prop {string} selectedTabId the `eventKey` of the selected tab
 * @prop {function} onSelect called with the `eventKey` of the clicked tab
 */
const ScrollableTabs = ({ className, tabs, selectedTabId, onSelect = () => {} }) => {
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
                <div className={className}>
                    <ul className="nav" role="tablist">
                        {tabs.map(({ title, eventKey }) => (
                            <li
                                key={eventKey}
                                role="presentation"
                                className={eventKey === selectedTabId ? 'active' : ''}>
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={eventKey === selectedTabId}
                                    onClick={() => onSelect(eventKey)}>
                                    {title}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
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
    tabs: PropTypes.array,
    selectedTabId: PropTypes.string,
    onSelect: PropTypes.func
};

ScrollableTabs.defaultProps = {
    tabs: []
};

export default ScrollableTabs;
