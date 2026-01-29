/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Popover,
    Glyphicon
} from 'react-bootstrap';

import Overlay from '../Overlay';
import './AlertPopover.less';

/**
 * AlertPopover - A popover component for displaying alerts/errors with auto-show and auto-dismiss functionality.
 *
 * Features:
 * - Auto-shows on first error occurrence with countdown timer
 * - Manual close button and hover interaction after first show
 * - Pause countdown on mouse hover
 *
 * @memberof components.misc.popover
 * @class
 * @name AlertPopover
 *
 * @prop {node} content - The content to display (can be HTML component or any React node)
 * @prop {boolean} show - Controls visibility. When true and first time, triggers auto-show
 * @prop {number} [autoDismissSeconds=5] - Seconds before auto-dismiss (0 disables)
 * @prop {string} [placement="bottom"] - Popover placement (top, bottom, left, right)
 * @prop {string} [glyph="exclamation-mark"] - Icon glyph for the trigger
 * @prop {string} [bsStyle="danger"] - Bootstrap style variant
 * @prop {string} [id="alert-popover"] - Unique identifier
 * @prop {string} [className] - Additional CSS class for icon container
 * @prop {string} [popoverClassName] - Additional CSS class for popover
 * @prop {function} [onClose] - Callback fired when popover closes
 * @prop {boolean} [showCountdown=true] - Whether to show countdown indicator
 * @prop {boolean} [pauseOnHover=true] - Whether to pause countdown on hover
 * @prop {boolean} [autoShowFirstTime=true] - Whether to auto-show on first error occurrence
 * @prop {object} [style] - Custom inline styles for icon container
 *
 * @example
 * // Basic usage with HTML content
 * <AlertPopover
 *   show={hasError}
 *   content={<HTML msgId="error.message"/>}
 * />
 *
 * @example
 * // Customized with longer timer
 * <AlertPopover
 *   show={hasError}
 *   content={<div>Custom error message</div>}
 *   autoDismissSeconds={10}
 *   placement="top"
 *   bsStyle="warning"
 * />
 */
export default function AlertPopover({
    content,
    show = false,
    autoDismissSeconds = 5,
    placement = "bottom",
    glyph = "exclamation-mark",
    bsStyle = "danger",
    id = "alert-popover",
    className = "",
    popoverClassName = "",
    onClose = () => {},
    showCountdown = true,
    pauseOnHover = true,
    autoShowFirstTime = true,
    style = {}
}) {
    // State management
    const [isOpen, setIsOpen] = useState(false);
    const [countdown, setCountdown] = useState(autoDismissSeconds);
    const [isPaused, setIsPaused] = useState(false);
    const [displayMode, setDisplayMode] = useState("hover"); // "auto" | "hover"
    const [hasAutoShown, setHasAutoShown] = useState(false);

    // Refs
    const targetRef = useRef(null);
    const timerRef = useRef(null);
    const closeTimeoutRef = useRef(null);

    const handleClose = () => {
        setIsOpen(false);
        if (timerRef.current) clearInterval(timerRef.current);
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
        onClose();
    };

    // Auto-show on first error
    useEffect(() => {
        if (show && content && !hasAutoShown) {
            if (autoShowFirstTime) {
                setDisplayMode("auto");
                setIsOpen(true);
                setCountdown(autoDismissSeconds);
                setIsPaused(false);
            } else {
                setDisplayMode("hover");
            }
            setHasAutoShown(true);
        }
    }, [show, content, hasAutoShown, autoDismissSeconds, autoShowFirstTime]);

    // Close popover when error clears
    useEffect(() => {
        if (!show || !content) {
            setIsOpen(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    }, [show, content]);

    // Countdown timer
    useEffect(() => {
        if (displayMode === "auto" && isOpen && autoDismissSeconds > 0) {
            timerRef.current = setInterval(() => {
                if (!isPaused) {
                    setCountdown(prev => {
                        if (prev <= 1) {
                            handleClose();
                            return 0;
                        }
                        return prev - 1;
                    });
                }
            }, 1000);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isOpen, isPaused, displayMode, autoDismissSeconds, handleClose]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
        };
    }, []);

    const handleIconClick = () => {
        if (hasAutoShown && show && content) {
            setDisplayMode("hover");
            setIsOpen(!isOpen);
        }
    };

    const handleIconMouseEnter = () => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }

        if (hasAutoShown && show && content) {
            setDisplayMode("hover");
            setIsOpen(true);
        }
    };

    const handleIconMouseLeave = () => {
        if (displayMode === "hover") {
            // Small delay before closing to allow mouse to move to popover
            closeTimeoutRef.current = setTimeout(() => {
                setIsOpen(false);
            }, 200);
        }
    };

    const handlePopoverMouseEnter = () => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }

        if (displayMode === "auto" && pauseOnHover) {
            setIsPaused(true);
        } else if (displayMode === "hover") {
            setIsOpen(true);
        }
    };

    const handlePopoverMouseLeave = () => {
        if (displayMode === "auto" && pauseOnHover) {
            setIsPaused(false);
        } else if (displayMode === "hover") {
            // Close popover when mouse leaves the popover
            setIsOpen(false);
        }
    };

    const renderCountdown = () => {
        if (!showCountdown || displayMode !== "auto" || autoDismissSeconds === 0) {
            return null;
        }

        const progress = (countdown / autoDismissSeconds) * 100;
        const radius = 6;
        const circumference = 2 * Math.PI * radius;
        const strokeDasharray = circumference;
        const strokeDashoffset = circumference - (progress / 100) * circumference;

        return (
            <div className="alert-popover-countdown">
                <svg width="16" height="16" className="countdown-svg">
                    <circle
                        cx="8"
                        cy="8"
                        r={radius}
                        className="countdown-background"
                    />
                    <circle
                        cx="8"
                        cy="8"
                        r={radius}
                        className={`countdown-progress ${isPaused ? 'paused' : 'counting'}`}
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                    />
                </svg>
                <div className={`countdown-number ${isPaused ? 'paused' : 'counting'}`}>
                    {countdown}
                </div>
            </div>
        );
    };

    return (
        <div className="alert-popover">
            <div
                ref={targetRef}
                className={`alert-popover-trigger ${className || "square-button-md _border-transparent"}`}
                style={style}
                onClick={handleIconClick}
                onMouseEnter={handleIconMouseEnter}
                onMouseLeave={handleIconMouseLeave}
            >
                <Glyphicon
                    className={`alert-popover-icon text-${bsStyle}`}
                    glyph={glyph}
                />
            </div>
            <Overlay
                target={targetRef.current}
                show={isOpen}
                placement={placement}
                rootClose
                onHide={handleClose}
            >
                <Popover
                    id={id}
                    placement={placement}
                    className={`alert-popover-popup ${popoverClassName}`}
                    onMouseEnter={handlePopoverMouseEnter}
                    onMouseLeave={handlePopoverMouseLeave}
                >
                    <div className="alert-popover-header">
                        {renderCountdown()}
                        <Glyphicon
                            glyph="1-close"
                            className="alert-popover-close"
                            onClick={handleClose}
                        />
                    </div>
                    <div className="alert-popover-content">
                        {content}
                    </div>
                </Popover>
            </Overlay>
        </div>
    );
}

AlertPopover.propTypes = {
    content: PropTypes.node,
    show: PropTypes.bool,
    autoDismissSeconds: PropTypes.number,
    placement: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
    glyph: PropTypes.string,
    bsStyle: PropTypes.oneOf(['danger', 'warning', 'info', 'success', 'primary', 'default']),
    id: PropTypes.string,
    className: PropTypes.string,
    popoverClassName: PropTypes.string,
    onClose: PropTypes.func,
    showCountdown: PropTypes.bool,
    pauseOnHover: PropTypes.bool,
    autoShowFirstTime: PropTypes.bool,
    style: PropTypes.object
};

