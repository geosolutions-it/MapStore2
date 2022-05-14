/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import React from 'react';
import ReactDOM from 'react-dom';
import RowViewer from '../RowViewer';
import { ANNOTATIONS } from '../../../../../../utils/AnnotationsUtils';
import { registerRowViewer } from '../../../../../../utils/MapInfoUtils';

describe('RowViewer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('should render with default', () => {
        ReactDOM.render(<RowViewer />, document.getElementById("container"));
        const viewerNode = document.querySelector('.ms-properties-viewer');
        expect(viewerNode).toBeTruthy();
    });
    it('should apply default option for annotation layer', () => {

        const TestComponent = ({
            include
        }) => {
            return <div id="annotation-include-option">{include.join()}</div>;
        };

        ReactDOM.render(
            <RowViewer
                layer={{ layerId: ANNOTATIONS }}
                component={TestComponent}
                feature={{ properties: {}, id: 'feature' }}
            />,
            document.getElementById("container"));

        const includeOptionNode = document.querySelector('#annotation-include-option');
        expect(includeOptionNode.innerHTML).toBe('title,description');
    });

    it('should render the registered row viewer', () => {

        const RegisteredComponent = () => {
            return <div id="registered-viewer"></div>;
        };

        registerRowViewer(ANNOTATIONS, RegisteredComponent);

        ReactDOM.render(
            <RowViewer
                layer={{ layerId: ANNOTATIONS }}
                feature={{ properties: {}, id: 'feature' }}
            />,
            document.getElementById("container"));

        const registeredViewerNode = document.querySelector('#registered-viewer');
        expect(registeredViewerNode).toBeTruthy();

        registerRowViewer(ANNOTATIONS, undefined);
    });
});
