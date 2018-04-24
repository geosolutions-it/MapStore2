const React = require('react');
const Overlay = require('../../../misc/Overlay');
const {Popover} = require('react-bootstrap');
const ReactDOM = require('react-dom');

/**
 * An overlay popover is added to a Wrapped component
 * @param {object} Wrapped must be a class component, do not use a functional
 * component because it misses the refs property
 * you can customize popover props, content and placement
*/
module.exports = (Wrapped) => class WithPopover extends React.Component {
    render() {
        let target = null;
        const {popoverOptions, ...props} = this.props;
        return (
            <span className="mapstore-info-popover">
                <Wrapped {...this.props} ref={button => { target = button; }} />
                <Overlay placement={popoverOptions.placement} show target={() => ReactDOM.findDOMNode(target)}>
                    <Popover
                        {...popoverOptions.props}>
                        {popoverOptions.content}
                    </Popover>
                </Overlay>
            </span>
        );
    }
};
