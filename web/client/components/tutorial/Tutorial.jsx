/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const Joyride = require('react-joyride').default;
const {defaultStyle, introStyle, errorStyle} = require('./style/style');
const assign = require('object-assign');
const I18N = require('../I18N/I18N');

require('react-joyride/lib/react-joyride-compiled.css');
require('./style/tutorial.css');

const Tutorial = React.createClass({
    propTypes: {
        toggle: React.PropTypes.bool,
        preset: React.PropTypes.string,
        presetList: React.PropTypes.object,
        intro: React.PropTypes.bool,
        introPosition: React.PropTypes.number,
        rawSteps: React.PropTypes.array,
        nextLabel: React.PropTypes.string,
        showCheckbox: React.PropTypes.bool,
        defaultStep: React.PropTypes.object,
        error: React.PropTypes.object,

        steps: React.PropTypes.array,
        stepIndex: React.PropTypes.number,
        run: React.PropTypes.bool,
        autoStart: React.PropTypes.bool,
        keyboardNavigation: React.PropTypes.bool,
        resizeDebounce: React.PropTypes.bool,
        resizeDebounceDelay: React.PropTypes.number,
        holePadding: React.PropTypes.number,
        scrollOffset: React.PropTypes.number,
        scrollToSteps: React.PropTypes.bool,
        scrollToFirstStep: React.PropTypes.bool,
        showBackButton: React.PropTypes.bool,
        showOverlay: React.PropTypes.bool,
        allowClicksThruHole: React.PropTypes.bool,
        showSkipButton: React.PropTypes.bool,
        showStepsProgress: React.PropTypes.bool,
        tooltipOffset: React.PropTypes.number,
        type: React.PropTypes.string,
        disableOverlay: React.PropTypes.bool,
        debug: React.PropTypes.bool,

        actions: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            toggle: false,
            preset: 'map',
            presetList: {},
            intro: true,
            introPosition: (window.innerHeight - 348) / 2,
            rawSteps: [],
            nextLabel: 'next',
            showCheckbox: true,
            defaultStep: {
                title: '',
                text: '',
                position: 'bottom',
                type: 'click',
                allowClicksThruHole: true
            },
            error: {
                style: errorStyle,
                text: <I18N.Message msgId="tutorial.error"/>
            },

            steps: [],
            stepIndex: 0,
            run: true,
            autoStart: true,
            keyboardNavigation: true,
            resizeDebounce: false,
            resizeDebounceDelay: 200,
            holePadding: 0,
            scrollOffset: 20,
            scrollToSteps: true,
            scrollToFirstStep: false,
            showBackButton: true,
            showOverlay: true,
            allowClicksThruHole: false,
            showSkipButton: false,
            showStepsProgress: true,
            tooltipOffset: 10,
            type: 'continuous',
            disableOverlay: false,
            debug: false,

            actions: {
                onSetup: () => {},
                onStart: () => {},
                onUpdate: () => {},
                onToggle: () => {},
                onReset: () => {}
            }
        };
    },
    componentWillMount() {
        let rawSteps = this.props.rawSteps.length > 0 ? this.props.rawSteps : this.props.presetList[this.props.preset] || [];
        var steps = rawSteps.filter((step) => {
            return step.selector && step.selector.substring(0, 1) === '#';
        }).map((step) => {
            let title = step.title || step.translation ? step.title || <I18N.Message msgId={"tutorial." + step.translation + ".title"}/> : '';
            let text = step.text || step.translation ? step.text || <I18N.Message msgId={"tutorial." + step.translation + ".text"}/> : '';
            let checkbox = this.props.showCheckbox ? <div id="tutorial-intro-checkbox-container"><input type="checkbox" id="tutorial-intro-checkbox" onChange={this.props.actions.onToggle}/><span><I18N.Message msgId={"tutorial.checkbox"}/></span></div> : <div id="tutorial-intro-checkbox-container"/>;
            text = (step.selector === '#intro-tutorial') ? <div><div>{text}</div>{checkbox}</div> : text;
            let style = (step.selector === '#intro-tutorial') ? introStyle : defaultStyle;
            let isFixed = (step.selector === '#intro-tutorial') ? true : step.isFixed || false;
            assign(style, step.style);
            let newStep = assign({}, this.props.defaultStep, step, {
                title,
                text,
                style,
                isFixed
            });
            return newStep;
        });
        this.props.actions.onSetup(steps);
    },
    componentWillUpdate(newProps) {
        if (!this.props.toggle && newProps.toggle) {
            this.props.actions.onStart();
            this.joyride.reset(true);
        }
    },
    componentWillUnmount() {
        this.props.actions.onReset();
    },
    onTour(tour) {
        if (tour && tour.type && tour.type.split(':')[1] !== 'before') {
            if (tour.type === 'error:target_not_found' || tour.action === 'next' && this.props.intro) {
                this.joyride.reset(true);
            }
            this.props.actions.onUpdate(tour, this.props.steps, this.props.error);
        }
    },
    render() {
        return (
            <div>
                <Joyride
                    ref={c => (this.joyride = c)}
                    steps={this.props.steps}
                    stepIndex={this.props.stepIndex}
                    run={this.props.run}
                    autoStart={this.props.autoStart}
                    keyboardNavigation={this.props.keyboardNavigation}
                    locale={{
                        back: <I18N.Message msgId="tutorial.back"/>,
                        close: <I18N.Message msgId="tutorial.close"/>,
                        last: <I18N.Message msgId="tutorial.last"/>,
                        next: <I18N.Message msgId={'tutorial.' + this.props.nextLabel}/>,
                        skip: <I18N.Message msgId="tutorial.skip"/>
                    }}
                    resizeDebounce={this.props.resizeDebounce}
                    resizeDebounceDelay={this.props.resizeDebounceDelay}
                    holePadding={this.props.holePadding}
                    scrollOffset={this.props.scrollOffset}
                    scrollToSteps={this.props.scrollToSteps}
                    scrollToFirstStep={this.props.scrollToFirstStep}
                    showBackButton={this.props.showBackButton}
                    showOverlay={this.props.showOverlay}
                    allowClicksThruHole={this.props.allowClicksThruHole}
                    showSkipButton={this.props.showSkipButton}
                    showStepsProgress={this.props.showStepsProgress}
                    tooltipOffset={this.props.tooltipOffset}
                    type={this.props.type}
                    disableOverlay={this.props.disableOverlay}
                    debug={this.props.debug}
                    callback={this.onTour}
                />

                <div id="intro-tutorial" className="tutorial-presentation-position" style={{
                    top: this.props.introPosition
                }}/>

                <div id="error-tutorial" className="tutorial-presentation-position" style={{
                    top: this.props.introPosition + 200
                }}/>

            </div>

        );
    }
});

module.exports = Tutorial;
