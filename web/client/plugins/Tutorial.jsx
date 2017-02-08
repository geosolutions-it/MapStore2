/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const Joyride = require('react-joyride').default;
const {connect} = require('react-redux');
const {bindActionCreators} = require('redux');
const {setupTutorial, startTutorial, updateTutorial, disableTutorial, resetTutorial} = require('../actions/tutorial');
const {defaultStyle, introStyle} = require('./tutorial/style');
const listSelectors = require('./tutorial/selectors');
const {toggleControl} = require('../actions/controls');
const assign = require('object-assign');
const I18N = require('../components/I18N/I18N');
const {Glyphicon} = require('react-bootstrap');

require('react-joyride/lib/react-joyride-compiled.css');
require('./tutorial/tutorial.css');

const defaultStep = {
    title: '',
    text: '',
    selector: '',
    position: 'bottom',
    type: 'click',
    allowClicksThruHole: true
};

const TutorialComponent = React.createClass({
    propTypes: {
        toggle: React.PropTypes.bool,
        intro: React.PropTypes.bool,
        introPosition: React.PropTypes.number,
        rawSteps: React.PropTypes.array,
        nextLabel: React.PropTypes.string,
        showCheckbox: React.PropTypes.bool,
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
            intro: true,
            introPosition: (window.innerHeight - 348) / 2,
            rawSteps: [],
            nextLabel: 'next',
            showCheckbox: true,
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
        var steps = this.props.rawSteps.filter((step) => {
            return step.selector && step.selector.substring(0, 1) === '#' || listSelectors[step.selector];
        }).map((step) => {
            let selector = listSelectors[step.selector] || step.selector;
            let title = step.title || step.translation ? step.title || <I18N.Message msgId={"tutorial." + step.translation + ".title"}/> : '';
            let text = step.text || step.translation ? step.text || <I18N.Message msgId={"tutorial." + step.translation + ".text"}/> : '';
            let checkbox = this.props.showCheckbox ? <div id="tutorial-intro-checkbox-container"><input type="checkbox" id="tutorial-intro-checkbox" onChange={this.props.actions.onToggle}/><span><I18N.Message msgId={"tutorial.checkbox"}/></span></div> : <div id="tutorial-intro-checkbox-container"/>;
            text = (step.selector === '#intro-tutorial' || step.selector === 'intro') ? <div><div>{text}</div>{checkbox}</div> : text;
            let style = (step.selector === '#intro-tutorial' || step.selector === 'intro') ? introStyle : defaultStyle;
            let isFixed = (step.selector === '#intro-tutorial' || step.selector === 'intro') ? true : step.isFixed || false;
            assign(style, step.style);
            let newStep = assign({}, defaultStep, step, {
                title,
                text,
                style,
                selector,
                isFixed
            });
            return assign(step, newStep);
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
        if (tour.type === 'error:target_not_found' || tour.action === 'next' && this.props.intro) {
            this.joyride.reset(true);
        }
        this.props.actions.onUpdate(tour, this.props.steps);
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

                <div id="intro-tutorial" style={{
                    top: this.props.introPosition
                }}/>

            </div>

        );
    }
});

const Tutorial = connect((state) => {
    return {
        toggle: state.controls && state.controls.tutorial && state.controls.tutorial.enabled,
        intro: state.tutorial && state.tutorial.intro,
        steps: state.tutorial && state.tutorial.steps,
        run: state.tutorial && state.tutorial.run,
        autoStart: state.tutorial && state.tutorial.start,
        showStepsProgress: state.tutorial && state.tutorial.progress,
        showSkipButton: state.tutorial && state.tutorial.skip,
        nextLabel: state.tutorial && state.tutorial.nextLabel
    };
}, (dispatch) => {
    return {
        actions: bindActionCreators({
            onSetup: setupTutorial,
            onStart: startTutorial,
            onUpdate: updateTutorial,
            onToggle: disableTutorial,
            onReset: resetTutorial
        }, dispatch)
    };
})(TutorialComponent);

module.exports = {
    TutorialPlugin: assign(Tutorial, {
        BurgerMenu: {
            name: 'tutorial',
            position: 1000,
            text: <I18N.Message msgId="tutorial.title"/>,
            icon: <Glyphicon glyph="book"/>,
            action: toggleControl.bind(null, 'tutorial', null),
            priority: 2,
            doNotHide: true
        }
    }),
    reducers: {
        tutorial: require('../reducers/tutorial')
    }
};
