const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {ProgressBar} = require('react-bootstrap');
const Spinner = require('react-spinkit');

class TaskProgress extends React.Component {
    static propTypes = {
        progress: PropTypes.number,
        update: PropTypes.func,
        total: PropTypes.number,
        timeout: PropTypes.number,
        state: PropTypes.string
    };

    static defaultProps = {
        timeout: 1000,
        update: () => {},
        progress: 0
    };

    componentDidMount() {
        this.interval = setInterval(this.update.bind(this), this.props.timeout);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        if (this.props.total) {
            let percent = 100 * this.props.progress / this.props.total;
            percent = percent.toFixed(2);
            return (
                <ProgressBar bsStyle="warning" key="progressbar" striped now={percent} label={`${percent}%`}/>
            );
        }
        return <Spinner noFadeIn overrideSpinnerClassName="spinner" spinnerName="circle"/>;
    }

    update = () => {
        if (this.props.state === "RUNNING") {
            this.props.update();
        }
    };
}

module.exports = TaskProgress;
