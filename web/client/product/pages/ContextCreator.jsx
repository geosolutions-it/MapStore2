/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {get} from 'lodash';
import url from 'url';
const urlQuery = url.parse(window.location.href, true).query;

import {setCreationStep, clearContextCreator} from '../../actions/contextcreator';
import Page from '../../containers/Page';
import BorderLayout from '../../components/layout/BorderLayout';

class ContextCreator extends React.Component {
    static propTypes = {
        mode: PropTypes.string,
        match: PropTypes.object,
        setCreationStep: PropTypes.func,
        reset: PropTypes.func,
        plugins: PropTypes.object
    };

    static defaultProps = {
        name: "context-creator",
        mode: 'desktop',
        editResource: () => {},
        setCreationStep: () => {},
        reset: () => {}
    };

    UNSAFE_componentWillMount() {
        const stepId = get(this.props, "match.params.stepId");
        this.props.reset();
        this.props.setCreationStep(stepId);
    }
    componentDidUpdate(oldProps) {
        const stepId = get(this.props, "match.params.stepId");
        const oldStepId = get(oldProps, "match.params.stepId");
        if (oldStepId !== stepId) {
            this.props.setCreationStep(stepId);
        }
    }
    componentWillUnmount() {
        this.props.reset();
    }
    render() {
        return (<Page
            id="context-creator"
            component={BorderLayout}
            includeCommon={false}
            plugins={this.props.plugins}
            params={this.props.match.params}
        />);
    }
}

export default connect((state) => ({
    mode: urlQuery.mobile || state.browser && state.browser.mobile ? 'mobile' : 'desktop'
}),
{
    setCreationStep,
    reset: clearContextCreator
})(ContextCreator);
