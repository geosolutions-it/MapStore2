
import React from 'react';
import isNil from 'lodash/isNil';

/**
 * Handler to deal with legend mouse wheel sensitivity issue
 * with chart widget has multiple legend items
 * NOTE: This is a workaround for issue in plotly.js https://github.com/plotly/plotly.js/issues/6737
 * until fix on plotly is implemented
 */
const withLegendScrollHandler = (WrappedComponent) => {
    return (props) => {
        /**
         * Event listener captures mouse wheel event of legend element
         * and modifies the deltaY such that the sensitivity is exhibited in a controlled manner
         */
        const legendMouseWheelEventHandler = (graphDiv) => {
            const legend = graphDiv.querySelector('.infolayer .legend');
            if (legend) {
                const legendBg = legend.querySelector('.bg');

                // add listener in capture mode
                legend.addEventListener('wheel', function(event) {
                    if (!event.isTrusted) return;
                    event.preventDefault();
                    event.stopPropagation();

                    const maxScrollDistance = legend.getBBox()?.height;
                    const scrollHeight = legendBg?.getBBox()?.height;

                    let deltaY = 0.30; // fallback fixed value
                    if (!isNil(scrollHeight) && !isNil(maxScrollDistance)) {
                        deltaY = (scrollHeight / maxScrollDistance) * 100;
                    }
                    if (Number(event.deltaY) < 0) {
                        deltaY *= -1; // negate on upward scroll
                    }
                    const newEvent = new WheelEvent('wheel', {
                        clientX: event.clientX,
                        clientY: event.clientY,
                        deltaY,
                        view: window,
                        bubbles: true,
                        cancelable: true
                    });
                    event.target.dispatchEvent(newEvent);
                }, true);
            }
        };
        return (
            <WrappedComponent
                {...props}
                onInitialized={(figure, graphDiv) => {
                    legendMouseWheelEventHandler(graphDiv);
                    props.onInitialized(figure, graphDiv);
                }}
            />);
    };
};

export default withLegendScrollHandler;
