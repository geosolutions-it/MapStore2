/**
  * Copyright 2018, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

const React = require('react');
const ReactDOM = require('react-dom');
const {createSink} = require('recompose');
const expect = require('expect');
const accessRuleParser = require('../accessRuleParser');

describe('accessRuleParser enhancer', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('rendering with defaults', (done) => {
        const Sink = accessRuleParser("hasAllAccess")(createSink(props => {
            expect(props).toExist();
            expect(props.hasAllAccess).toBe(true);
            done();
        }));
        ReactDOM.render(<Sink accessInfo={{ mapInfo: { canEdit: true, canDelete: false } }} hasAllAccess />, document.getElementById("container"));
    });
    it('single rule', (done) => {
        const Sink = accessRuleParser("hasAllAccess")(createSink( props => {
            expect(props).toExist();
            expect(props.hasAllAccess).toBe(true);
            done();
        }));
        ReactDOM.render(<Sink accessInfo={{ mapInfo: {canEdit: true, canDelete: false}}} hasAllAccess="mapInfo.canEdit" />, document.getElementById("container"));
    });
    it('single rule with equal return true', (done) => {
        const Sink = accessRuleParser("hasAllAccess")(createSink( props => {
            expect(props).toExist();
            expect(props.hasAllAccess).toBe(true);
            done();
        }));
        ReactDOM.render(<Sink accessInfo={{ user: {role: "ADMIN"}, mapInfo: {canEdit: true, canDelete: false}}} hasAllAccess="user.role==ADMIN" />, document.getElementById("container"));
    });
    it('single rule with equal return false', (done) => {
        const Sink = accessRuleParser("hasAllAccess")(createSink( props => {
            expect(props).toExist();
            expect(props.hasAllAccess).toBe(false);
            done();
        }));
        ReactDOM.render(<Sink accessInfo={{ user: {role: "USER"}, mapInfo: {canEdit: true, canDelete: false}}} hasAllAccess="user.role==ADMIN" />, document.getElementById("container"));
    });
    it('single rule with differ return true', (done) => {
        const Sink = accessRuleParser("hasAllAccess")(createSink( props => {
            expect(props).toExist();
            expect(props.hasAllAccess).toBe(true);
            done();
        }));
        ReactDOM.render(<Sink accessInfo={{ user: {role: "USER"}, mapInfo: {canEdit: true, canDelete: false}}} hasAllAccess="user.role!=ADMIN" />, document.getElementById("container"));
    });
    it('single rule with differ return false', (done) => {
        const Sink = accessRuleParser("hasAllAccess")(createSink( props => {
            expect(props).toExist();
            expect(props.hasAllAccess).toBe(false);
            done();
        }));
        ReactDOM.render(<Sink accessInfo={{ user: {role: "ADMIN"}, mapInfo: {canEdit: true, canDelete: false}}} hasAllAccess="user.role!=ADMIN" />, document.getElementById("container"));
    });
    it('array of rules', (done) => {
        const Sink = accessRuleParser("hasAllAccess")(createSink(props => {
            expect(props).toExist();
            expect(props.hasAllAccess).toBeFalsy();
            done();
        }));
        ReactDOM.render(<Sink accessInfo={{ mapInfo: { canEdit: true, canDelete: false } }} hasAllAccess={["mapInfo.canEdit", "mapInfo.canDelete"]} />, document.getElementById("container"));
    });
    it('array of rules with __OR__', (done) => {
        const Sink = accessRuleParser("hasAllAccess")(createSink(props => {
            expect(props).toExist();
            expect(props.hasAllAccess).toBe(true);
            done();
        }));
        ReactDOM.render(<Sink accessInfo={{ mapInfo: { canEdit: true, canDelete: false } }} hasAllAccess={["__OR__", "mapInfo.canEdit", "mapInfo.canDelete"]} />, document.getElementById("container"));
    });
    it('single negative rule', (done) => {
        const Sink = accessRuleParser("hasAllAccess")(createSink(props => {
            expect(props).toExist();
            expect(props.hasAllAccess).toBe(false);
            done();
        }));
        ReactDOM.render(<Sink accessInfo={{ mapInfo: { canEdit: true, canDelete: false } }} hasAllAccess="!mapInfo.canEdit" />, document.getElementById("container"));
    });
    it('single negative rule with equal return true (so false)', (done) => {
        const Sink = accessRuleParser("hasAllAccess")(createSink(props => {
            expect(props).toExist();
            expect(props.hasAllAccess).toBe(false);
            done();
        }));
        ReactDOM.render(<Sink accessInfo={{ user: { role: "ADMIN" }, mapInfo: { canEdit: true, canDelete: false } }} hasAllAccess="!user.role==ADMIN" />, document.getElementById("container"));
    });
    it('single negative rule with equal return false (so true)', (done) => {
        const Sink = accessRuleParser("hasAllAccess")(createSink(props => {
            expect(props).toExist();
            expect(props.hasAllAccess).toBe(true);
            done();
        }));
        ReactDOM.render(<Sink accessInfo={{ user: { role: "USER" }, mapInfo: { canEdit: true, canDelete: false } }} hasAllAccess="!user.role==ADMIN" />, document.getElementById("container"));
    });
    it('single negative rule with differ return true (so false)', (done) => {
        const Sink = accessRuleParser("hasAllAccess")(createSink(props => {
            expect(props).toExist();
            expect(props.hasAllAccess).toBe(false);
            done();
        }));
        ReactDOM.render(<Sink accessInfo={{ user: { role: "USER" }, mapInfo: { canEdit: true, canDelete: false } }} hasAllAccess="!user.role!=ADMIN" />, document.getElementById("container"));
    });
    it('single negative rule with differ return false (so true)', (done) => {
        const Sink = accessRuleParser("hasAllAccess")(createSink(props => {
            expect(props).toExist();
            expect(props.hasAllAccess).toBe(true);
            done();
        }));
        ReactDOM.render(<Sink accessInfo={{ user: { role: "ADMIN" }, mapInfo: { canEdit: true, canDelete: false } }} hasAllAccess="!user.role!=ADMIN" />, document.getElementById("container"));
    });
    it('array of rules', (done) => {
        const Sink = accessRuleParser("hasAllAccess")(createSink(props => {
            expect(props).toExist();
            expect(props.hasAllAccess).toBeFalsy();
            done();
        }));
        ReactDOM.render(<Sink accessInfo={{ mapInfo: { canEdit: true, canDelete: false } }} hasAllAccess={["mapInfo.canEdit", "mapInfo.canDelete"]} />, document.getElementById("container"));
    });
    it('array of rules with __OR__', (done) => {
        const Sink = accessRuleParser("hasAllAccess")(createSink(props => {
            expect(props).toExist();
            const { accessInfo } = props;
            const { mapInfo } = accessInfo;
            const {canEdit, canDelete} = mapInfo;
            expect(props.hasAllAccess).toBe(!!(canEdit || canDelete) );
            done();
        }));
        const rules = ["__OR__", "mapInfo.canEdit", "mapInfo.canDelete"];
        ReactDOM.render(<Sink accessInfo={{ mapInfo: { canEdit: false, canDelete: false } }} hasAllAccess={rules} />, document.getElementById("container"));
        ReactDOM.render(<Sink accessInfo={{ mapInfo: { canEdit: true, canDelete: false } }} hasAllAccess={rules} />, document.getElementById("container"));
        ReactDOM.render(<Sink accessInfo={{ mapInfo: { canEdit: false, canDelete: true } }} hasAllAccess={rules} />, document.getElementById("container"));
        ReactDOM.render(<Sink accessInfo={{ mapInfo: { canEdit: true, canDelete: true } }} hasAllAccess={rules} />, document.getElementById("container"));

    });
    it('asObject option', (done) => {
        const Sink = accessRuleParser("hasAllAccess", {asObject: true})(createSink(props => {
            expect(props).toExist();
            expect(props.hasAllAccess.test).toBe(true);
            done();
        }));
        ReactDOM.render(<Sink accessInfo={{ mapInfo: { canEdit: true, canDelete: false } }} hasAllAccess={{test: true}} />, document.getElementById("container"));
    });
    it('asObject with single rule', (done) => {
        const Sink = accessRuleParser("hasAllAccess", { asObject: true })(createSink(props => {
            expect(props).toExist();
            expect(props.hasAllAccess.test).toBe(true);
            done();
        }));
        ReactDOM.render(<Sink accessInfo={{ mapInfo: { canEdit: true, canDelete: false } }} hasAllAccess={{ test: "mapInfo.canEdit"}} />, document.getElementById("container"));
    });
    it('asObject with array of rules', (done) => {
        const Sink = accessRuleParser("hasAllAccess", { asObject: true })(createSink(props => {
            expect(props).toExist();
            expect(props.hasAllAccess.test).toBe(false);
            done();
        }));
        ReactDOM.render(<Sink accessInfo={{ mapInfo: { canEdit: true, canDelete: false } }} hasAllAccess={{
            test: ["mapInfo.canEdit", "mapInfo.canDelete"]
        }} />, document.getElementById("container"));
    });
    it('asObject with array of rules nested (XOR)', (done) => {
        const Sink = accessRuleParser("hasAllAccess", { asObject: true })(createSink(props => {
            expect(props).toExist();
            const {accessInfo, hasAllAccess} = props;
            const {mapInfo} = accessInfo;
            expect(hasAllAccess.test).toBe(!!(!mapInfo.canEdit && mapInfo.canDelete || mapInfo.canEdit && !mapInfo.canDelete ));
            done();
        }));
        ReactDOM.render(<Sink accessInfo={{ mapInfo: { canEdit: false, canDelete: false } }} hasAllAccess={{
            test: ["__OR__", ["!mapInfo.canEdit", "mapInfo.canDelete"], ["mapInfo.canEdit", "!mapInfo.canDelete"]]
        }} />, document.getElementById("container"));
        ReactDOM.render(<Sink accessInfo={{ mapInfo: { canEdit: true, canDelete: false } }} hasAllAccess={{
            test: ["__OR__", ["!mapInfo.canEdit", "mapInfo.canDelete"], ["mapInfo.canEdit", "!mapInfo.canDelete"]]
        }} />, document.getElementById("container"));
        ReactDOM.render(<Sink accessInfo={{ mapInfo: { canEdit: false, canDelete: true } }} hasAllAccess={{
            test: ["__OR__", ["!mapInfo.canEdit", "mapInfo.canDelete"], ["mapInfo.canEdit", "!mapInfo.canDelete"]]
        }} />, document.getElementById("container"));
        ReactDOM.render(<Sink accessInfo={{ mapInfo: { canEdit: true, canDelete: true } }} hasAllAccess={{
            test: ["__OR__", ["!mapInfo.canEdit", "mapInfo.canDelete"], ["mapInfo.canEdit", "!mapInfo.canDelete"]]
        }} />, document.getElementById("container"));
    });
    it('asObject, with multiple entries, different kinds of rules and sequential renderings', (done) => {
        const permissionRules = {
            read: ["mapInfo.canRead"],
            edit: ["mapInfo.canEdit"],
            save: ["user.role==USER"],
            clone: ["mapInfo.canRead"],
            remove: ["__OR__", "user.role==ADMIN", "mapInfo.canDelete"],
            format: ["user.role==ADMIN"],
            testEqualSyntax1: ["user.role=ADMIN"],
            testEqualSyntax2: ["user.role==ADMIN"],
            testEqualSyntax3: ["user.role==ADMIN"],
            testDiffSyntax1: ["user.role!=ADMIN"],
            testDiffSyntax2: ["user.role!==ADMIN"]
        };
        const Sink = accessRuleParser("permission", { asObject: true })(createSink(({permission, accessInfo}) => {
            expect(!!permission.read).toBe(!!accessInfo.mapInfo.canRead);
            expect(!!permission.edit).toBe(!!accessInfo.mapInfo.canEdit);
            expect(!!permission.save).toBe(!!((accessInfo && accessInfo.user && accessInfo.user.role) === "USER"));
            expect(!!permission.clone).toBe(!!accessInfo.mapInfo.canRead);
            expect(!!permission.remove).toBe(!!(((accessInfo && accessInfo.user && accessInfo.user.role) === "ADMIN") || accessInfo.mapInfo.canDelete));
            expect(!!permission.format).toBe(!!((accessInfo && accessInfo.user && accessInfo.user.role) === "ADMIN"));
            expect(!!permission.testEqualSyntax1).toBe(!!((accessInfo && accessInfo.user && accessInfo.user.role) === "ADMIN"));
            expect(!!permission.testEqualSyntax2).toBe(!!((accessInfo && accessInfo.user && accessInfo.user.role) === "ADMIN"));
            expect(!!permission.testEqualSyntax3).toBe(!!((accessInfo && accessInfo.user && accessInfo.user.role) === "ADMIN"));
            expect(!!permission.testDiffSyntax1).toBe(!!((accessInfo && accessInfo.user && accessInfo.user.role) !== "ADMIN"));
            expect(!!permission.testDiffSyntax2).toBe(!!((accessInfo && accessInfo.user && accessInfo.user.role) !== "ADMIN"));

            done();
        }));
        ReactDOM.render(<Sink accessInfo={{ mapInfo: { canRead: true, canEdit: false, canDelete: false }}} permission={permissionRules} />, document.getElementById("container"));
        ReactDOM.render(<Sink accessInfo={{ mapInfo: { canRead: true, canEdit: false, canDelete: false }}} permission={permissionRules} />, document.getElementById("container"));
        ReactDOM.render(<Sink accessInfo={{ user: {role: "USER"}, mapInfo: { canRead: true, canEdit: true, canDelete: true }}} permission={permissionRules} />, document.getElementById("container"));
        ReactDOM.render(<Sink accessInfo={{ user: {role: "ADMIN"}, mapInfo: { canRead: true, canEdit: true, canDelete: true }}} permission={permissionRules} />, document.getElementById("container"));

    });
});
