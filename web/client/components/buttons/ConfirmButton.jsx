const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const classnames = require('classnames');

class ConfirmButton extends React.Component {
    static propTypes = {
        // if true, we will disable the button after confirming & disabled
        // if false || empty, we will loop around and allow click & confirm again
        disableAfterConfirmed: PropTypes.bool,
        resetOnBlur: PropTypes.bool,
        onConfirm: PropTypes.func,
        onDisable: PropTypes.func,
        onClick: PropTypes.func,
        // displayed normally, before confirming, while active
        text: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.node
        ]),
        className: PropTypes.string,
        style: PropTypes.object,
        // displayed only while confirming
        confirming: PropTypes.shape({
            text: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.node
            ]),
            className: PropTypes.string,
            style: PropTypes.object,
            // alias for onConfirm (convenience)
            onClick: PropTypes.func
        }),
        // displayed only after confirmed (clicked twice, disabled)
        disabled: PropTypes.shape({
            text: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.node
            ]),
            className: PropTypes.string,
            style: PropTypes.object
        }),
        // children always displayed (optional)
        children: PropTypes.node,
        // custom props to pass into button
        buttonProps: PropTypes.object
    };

    static defaultProps = {
        resetOnBlur: true
    };

    state = {
        is: 'active'
    };

    onClick = () => {
        return this.props.onClick ? this.props.onClick.bind(this) : () => {};
    };

    onDisable = () => {
        return this.props.onDisable ? this.props.onDisable.bind(this) : () => {};
    };

    onConfirm = () => {
        if (this.props.onConfirm) {
            return this.props.onConfirm();
        } else if (this.props.confirming && this.props.confirming.onClick) {
            return this.props.confirming.onClick();
        }
        return () => {};
    };

    render() {
        const {
            // disableAfterConfirmed,
            children, // always shows
            buttonProps,
            // confirming config
            confirming,
            // disabled config
            disabled
        } = this.props;
        let {
            // active state
            text,
            style,
            className = 'btn btn-sm btn-danger'
        } = this.props;

        const isDisabled = this.isDisabled();
        const isConfirming = this.isConfirming();
        // const isActive = this.isActive();

        if (isDisabled) {
            text = disabled && disabled.text || 'Loading...';
            className = disabled && disabled.className || 'btn btn-sm btn-secondary';
            style = disabled && disabled.style || {};
        }
        if (isConfirming) {
            text = confirming && confirming.text || 'Confirm?';
            className = confirming && confirming.className || 'btn btn-sm btn-warning';
            style = confirming && confirming.style || {};
        }

        return (
            <button
                className={classnames('confirm-button', className)}
                style={style}
                onClick={this.handleClick}
                onBlur={this.handleBlur}
                disabled={isDisabled}
                {...buttonProps}
            >
                {children}
                {children ? ' ' : ''}
                {text}
            </button>
        );
    }

    isDisabled = () => {
        return this.state.is === 'disabled';
    };

    isConfirming = () => {
        return this.state.is === 'confirming';
    };

    isActive = () => {
        return !this.isConfirming() && !this.isDisabled();
    };

    handleClick = () => {
        if (this.isConfirming() && this.props.disableAfterConfirmed) {
            // have confirmed and are now disabled
            this.onConfirm();
            this.onDisable();
            this.setState({ is: 'disabled' });
            return;
        }
        if (this.isConfirming()) {
            // we are clicking into the active state (from confirming)
            //   loop around to the beginning...
            this.onConfirm();
            this.setState({ is: 'active' });
            return;
        }
        // we are clicking into the confirming state (from active)
        this.onClick();
        this.setState({ is: 'confirming' });
    };

    handleBlur = () => {
        // reset the button
        this.setState({ is: 'active' });
        return;
    };
}

module.exports = ConfirmButton;
