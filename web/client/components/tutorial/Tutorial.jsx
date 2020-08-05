/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const PropTypes = require('prop-types');
const React = require('react');
const Joyride = require('react-joyride').default;
const I18N = require('../I18N/I18N');
const assign = require('object-assign');
const {head} = require('lodash');
const Portal = require('../misc/Portal');

require('react-joyride/lib/react-joyride-compiled.css');
require('./style/tutorial.css');

const defaultIntroStyle = {
    backgroundColor: 'transparent',
    color: '#fff',
    mainColor: '#fff',
    textAlign: 'center',
    header: {
        padding: 5,
        fontFamily: 'Georgia, serif',
        fontSize: '2.8em'
    },
    main: {
        fontSize: '1.0em',
        padding: 5
    },
    footer: {
        padding: 10
    },
    button: {
        color: '#fff'
    },
    close: {
        display: 'none'
    },
    skip: {
        color: '#fff'
    }
};

class Tutorial extends React.Component {
    static propTypes = {
        actions: PropTypes.object,
        allowClicksThruHole: PropTypes.bool,
        autoStart: PropTypes.bool,
        defaultStep: PropTypes.object,
        disableOverlay: PropTypes.bool,
        holePadding: PropTypes.number,
        intro: PropTypes.bool,
        introPosition: PropTypes.number,
        introStyle: PropTypes.object,
        keyboardNavigation: PropTypes.bool,
        preset: PropTypes.string,
        presetList: PropTypes.object,
        run: PropTypes.bool,
        resizeDebounce: PropTypes.bool,
        resizeDebounceDelay: PropTypes.number,
        scrollIntoViewOptions: PropTypes.bool,
        scrollOffset: PropTypes.number,
        scrollToFirstStep: PropTypes.bool,
        scrollToSteps: PropTypes.bool,
        showBackButton: PropTypes.bool,
        showCheckbox: PropTypes.bool,
        showOverlay: PropTypes.bool,
        showSkipButton: PropTypes.bool,
        showStepsProgress: PropTypes.bool,
        status: PropTypes.string,
        steps: PropTypes.array,
        stepIndex: PropTypes.number,
        toggle: PropTypes.bool,
        tooltipOffset: PropTypes.number,
        tourAction: PropTypes.string
    };

    static defaultProps = {
        toggle: false,
        status: 'run',
        preset: 'default_tutorial',
        presetList: {},
        introPosition: (window.innerHeight - 348) / 2,
        showCheckbox: true,
        defaultStep: {
            title: '',
            text: '',
            position: 'bottom',
            type: 'click'
        },
        introStyle: defaultIntroStyle,
        tourAction: 'next',
        stepIndex: 0,
        steps: [],
        run: true,
        autoStart: true,
        keyboardNavigation: true,
        resizeDebounce: false,
        resizeDebounceDelay: 200,
        holePadding: 0,
        scrollOffset: 20,
        scrollToSteps: true,
        scrollToFirstStep: true,
        showBackButton: true,
        showOverlay: true,
        allowClicksThruHole: true,
        showSkipButton: true,
        showStepsProgress: false,
        tooltipOffset: 10,
        disableOverlay: false,
        actions: {
            onSetup: () => {},
            onStart: () => {},
            onUpdate: () => {},
            onDisable: () => {},
            onReset: () => {},
            onClose: () => {}
        },
        scrollIntoViewOptions: {
            block: "end"
        }
    };

    state = {
        checkAction: {}
    }

    componentDidMount() {
        let defaultSteps = this.props.presetList[this.props.preset] || [];
        let checkbox = this.props.showCheckbox ? <div id="tutorial-intro-checkbox-container"><input type="checkbox" id="tutorial-intro-checkbox" className="tutorial-tooltip-intro-checkbox" onChange={this.props.actions.onDisable}/><span><I18N.Message msgId={"tutorial.checkbox"}/></span></div> : <div id="tutorial-intro-checkbox-container"/>;
        this.props.actions.onSetup('default', defaultSteps, this.props.introStyle, checkbox, this.props.defaultStep, assign({}, this.props.presetList, {default_tutorial: defaultSteps}));
    }

    UNSAFE_componentWillUpdate(newProps, newState) {
        if (this.props.steps.length > 0) {
            if (!this.props.toggle && newProps.toggle) {
                this.props.actions.onStart();
                this.setState({checkAction: {}});
            } else if (!this.state.checkAction[newProps.stepIndex] &&
                (this.props.status === 'run' && newProps.status === 'error'
            || this.props.status === 'error' && newProps.status === 'error')) {

                const newStep = newProps.steps && head(newProps.steps.filter((step, id) => id === newProps.stepIndex));
                const isActionStep = newStep && newStep.action && !this.state.checkAction[newProps.stepIndex] ? newProps.stepIndex : null;
                const index = isActionStep || this.checkFirstValidStep(newProps.stepIndex, newProps.tourAction);
                this.restartTour(index, {[index]: true});

            } else if (this.props.status === 'run' && newProps.status === 'close') {
                this.closeTour();
                this.setState({checkAction: {}});
            }
            if (this.state.checkAction && newState.checkAction && !this.state.checkAction[newProps.stepIndex] && newState.checkAction[newProps.stepIndex]) {
                // retry to find a valid step when it has action
                const newStep = head(newProps.steps.filter((step, id) => id === newProps.stepIndex));
                const isValid = newStep && newStep.selector && document.querySelector(newStep.selector) ? true : false;
                if (!isValid) {
                    const firstValidStep = this.checkFirstValidStep(newProps.stepIndex, newProps.tourAction);
                    this.restartTour(firstValidStep, {});
                }
            }
        }
    }

    componentWillUnmount() {
        this.props.actions.onClose();
        this.props.actions.onReset();
    }

    onTour = (tour) => {
        if (this.props.steps.length > 0 && tour && tour.type) {
            document.querySelector(tour?.step?.selector)?.scrollIntoView(this.props.scrollIntoViewOptions);
            const type = tour.type.split(':');
            if (type[0] !== 'tooltip' && type[1] === 'before'
            || tour.action === 'start'
            || type[1] === 'target_not_found'
            || tour.type === 'finished') {
                this.props.actions.onUpdate(tour, this.props.steps);

            }
        }
    };

    render() {
        let joy;
        if (this.props.steps.length > 0) {
            joy =
                (<Joyride
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
                        next: <I18N.Message msgId={'tutorial.next'}/>,
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
                    disableOverlay={this.props.disableOverlay}
                    type={'continuous'}
                    debug={false}
                    callback={this.onTour}
                />)
            ;
        } else {
            joy = <div className="tutorial-joyride-placeholder" />;
        }
        return (
            <Portal>
                <div>
                    {joy}
                    <div id="intro-tutorial" className="tutorial-presentation-position" style={{top: this.props.introPosition}}></div>
                </div>
            </Portal>

        );
    }

    checkFirstValidStep(index, action) {
        let steps = [].concat(this.props.steps);

        if (action === 'back') {
            steps = steps.slice(0, index);
            steps.sort((a, b) => b.index - a.index);
        } else {
            steps = steps.slice(index + 1, this.props.steps.length);
            steps.sort((a, b) => a.index - b.index);
        }

        steps = steps.filter((step) => {
            return document.querySelector(step.selector);
        }).map((step) => {
            return step.index;
        });

        return steps && steps.length > 0 ? steps[0] : -1;
    }

    closeTour() {
        const index = document.querySelector(this.props.steps[0].selector) ? 0 : this.checkFirstValidStep(0, 'next');

        if (index === -1) {
            this.props.actions.onReset();
        } else {
            this.joyride.setState({
                index,
                shouldRedraw: true
            });
        }

        this.props.actions.onClose();
    }

    restartTour(index, checkAction) {
        if (index === -1) {
            this.closeTour();
        } else {
            this.joyride.setState({
                index,
                isRunning: true,
                shouldRedraw: true,
                shouldRenderTooltip: true
            });
            this.props.actions.onStart();
            this.setState({checkAction});
        }
    }
}

module.exports = Tutorial;
