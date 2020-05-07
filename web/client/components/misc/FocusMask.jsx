import React from 'react';
import PropTypes from 'prop-types';
import ContainerDimensions from 'react-container-dimensions';

/**
 *  It draws a mask over the app blocking all events
 *  If a target has a correct selector a hole will be drawn in the mask
 *  this will focus the target and let pass the events.
 *  Setting stopEventsOnTarget (target obj)
 *  or stopEventsOnTargets properties to true will stop events also on target
 */
export default class FocusMask extends React.Component {
    static propTypes = {
        targets: PropTypes.arrayOf(PropTypes.shape({
            selector: PropTypes.string,
            stopEventsOnTarget: PropTypes.bool
        })),
        padding: PropTypes.number,
        borderRadius: PropTypes.number,
        onMaskClicked: PropTypes.func,
        stopEventsOnTargets: PropTypes.bool
    }
    static defaultProps = {
        targets: [],
        padding: 0,
        borderRadius: 8,
        onMaskClicked: () => { },
        stopEventsOnTargets: false
    }
    /* refer to https://mathiasbynens.be/notes/css-escapes css selector cannot start with a digit,
    *  or a hyphen (-) followed by a digit. Identifiers require at least one symbol
    *  (i.e. the empty string is not a valid identifier).
    */
    getAdjustedSelector = (selector = "") => {
        return selector.replace(/#\d|^#-\d/g, (digit, hyphen) => {
            if (hyphen) {
                return "#\\" + hyphen[1] + hyphen[2];
            }
            return "#\\3" + digit[1] + " ";
        });
    }
    getFocusedTarget = (targets = this.props.targets) => {
        const { padding = {} } = this.props;
        return targets.map(({ selector }) => {
            let obj = null;

            try {
                const el = window.document.querySelector(this.getAdjustedSelector(selector));
                if (el) {
                    const { top, right, bottom, left } = el.getBoundingClientRect();
                    obj = {
                        x: left - padding,
                        y: top - padding,
                        w: right - left + 2 * padding,
                        h: bottom - top + 2 * padding
                    };
                }
            } catch (e) {
                // eslint-disable-next-line no-console
                console.warn(e);
            } finally {
                return obj;
            }
        }).filter(d => d);
    }
    getHolePath = ({ x, y, w, h }) => {
        const { borderRadius: bR = 8 } = this.props;
        return `M ${x} ${y + bR} q 0 -${bR} ${bR} -${bR} h ${w - 2 * bR} q ${bR} 0 ${bR} ${bR} v ${h - 2 * bR} q 0 ${bR} -${bR} ${bR} h-${w - 2 * bR} q -${bR} 0 -${bR} -${bR} v-${h - 2 * bR}`;
    }
    getPath = (height, width, focusedTarget = this.getFocusedTarget()) => {
        const base = `M 0 0 h ${width} v ${height} h -${width} v -${height}`;
        const holes = focusedTarget.map(this.getHolePath);
        return base + holes.join(" ");
    }
    render() {
        const { onMaskClicked, stopEventsOnTargets = false, targets } = this.props;
        const stopEventTargets = this.getFocusedTarget(targets.filter(({ stopEventsOnTarget }) => stopEventsOnTargets || stopEventsOnTarget));
        return (
            <div style={{ position: "fixed", height: "100vh", width: "100vw", top: 0, left: 0, zIndex: 1000000, pointerEvents: 'none' }}>
                <ContainerDimensions>
                    {({ width, height }) =>
                        <svg width={width} height={height} xmlns="http://www.w3.org/2000/svg">
                            <path
                                d={this.getPath(height, width)}
                                fill="rgba(0,0,0,0.7)"
                                fillRule="evenodd"
                                pointerEvents="visiblePainted"
                                onClick={onMaskClicked}
                            />
                            {stopEventTargets.map((t, idx) =>
                                <path
                                    key={idx}
                                    d={this.getHolePath(t)}
                                    fill="transparent"
                                    pointerEvents="visiblePainted" />
                            )}
                        </svg>
                    }
                </ContainerDimensions>
            </div>);
    }
}
