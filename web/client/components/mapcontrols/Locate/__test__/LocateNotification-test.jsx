/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var expect = require('expect');

var React = require('react/addons');
var LocateNotification = require('../LocateNotification');

describe("test the Locate Notification", () => {
    afterEach((done) => {
        React.unmountComponentAtNode(document.body);
        document.body.innerHTML = '';
        setTimeout(done);
    });

    it('test default properties', () => {
        const N = (<LocateNotification
                        isActive={ true }
                        message={"Error"}
                        action="Dismiss" />);

        const tb = React.render(N, document.body);
        expect(tb).toExist();
        const tbNode = React.findDOMNode(tb);
        expect(tbNode.className.indexOf('notification-bar') >= 0).toBe(true);
    });
});
