import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import Tree from '../Tree';
import expect from 'expect';


describe('Session Tree', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });

    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('Render Trees from props with default checked: true for all', () => {
        const handlers = { onTreeUpdate: () => {} };

        ReactDOM.render(
            <Tree
                data={[{
                    id: 'everything',
                    checked: true,
                    children: [{
                        id: "layers",
                        checked: true,
                        children: [{
                            id: "annotations",
                            checked: true
                        },
                        {
                            id: "measurements",
                            checked: true
                        }]
                    },
                    {
                        id: "Toc",
                        checked: true
                    }]
                }]}
                onTreeUpdate={handlers.onTreeUpdate}
            />,
            document.getElementById("container")
        );

        // Check that all checkboxes are rendered and checked by default
        expect(document.getElementById("node-checkbox-everything").checked).toBe(true);
        expect(document.getElementById("node-checkbox-layers").checked).toBe(true);
        expect(document.getElementById("node-checkbox-annotations").checked).toBe(true);
        expect(document.getElementById("node-checkbox-measurements").checked).toBe(true);
        expect(document.getElementById("node-checkbox-Toc").checked).toBe(true);
    });

    it('If parent is checked, children should be checked', () => {

        ReactDOM.render(
            <Tree
                data={[{
                    id: 'everything',
                    children: [{
                        id: "layers",
                        children: [{
                            id: "annotations"
                        },
                        {
                            id: "measurements"
                        }]
                    },
                    {
                        id: "Toc"
                    }]
                }]}
            />,
            document.getElementById("container")
        );

        // Initially, check child checkboxes for 'layers'
        expect(document.getElementById("node-checkbox-layers").checked).toBe(false);

        // Initially, check parent checkbox for 'everything'
        TestUtils.Simulate.change(document.getElementById("node-checkbox-everything"), { target: { checked: true } });

        // Check that all child checkboxes are checked
        expect(document.getElementById("node-checkbox-layers").checked).toBe(true);
        expect(document.getElementById("node-checkbox-annotations").checked).toBe(true);
        expect(document.getElementById("node-checkbox-measurements").checked).toBe(true);
        expect(document.getElementById("node-checkbox-Toc").checked).toBe(true);
    });

    it('If a child is checked, parent should be indeterminate', () => {


        ReactDOM.render(
            <Tree
                data={[{
                    id: 'everything',
                    checked: true,
                    children: [{
                        id: "layers",
                        children: [{
                            id: "annotations",
                            checked: true
                        },
                        {
                            id: "measurements",
                            checked: true
                        }]
                    },
                    {
                        id: "Toc",
                        checked: true
                    }]
                }]}
            />,
            document.getElementById("container")
        );

        // Initially, 'everything' parent checkbox is checked, 'annotations' child checkbox is checked
        TestUtils.Simulate.change(document.getElementById("node-checkbox-annotations"), { target: { checked: false } });

        // Check that the 'everything' parent checkbox is indeterminate
        const everythingCheckbox = document.getElementById("node-checkbox-everything");
        expect(everythingCheckbox.indeterminate).toBe(true);
    });

    it('If parent is unchecked, children should be unchecked', () => {

        ReactDOM.render(
            <Tree
                data={[{
                    id: 'everything',
                    checked: true,
                    children: [{
                        id: "layers",
                        children: [{
                            id: "annotations",
                            checked: true
                        },
                        {
                            id: "measurements",
                            checked: true
                        }]
                    },
                    {
                        id: "Toc",
                        checked: true
                    }]
                }]}
            />,
            document.getElementById("container"));

        TestUtils.Simulate.change(document.getElementById("node-checkbox-everything"), { target: { checked: false } });

        // Ensure all child checkboxes are unchecked
        expect(document.getElementById("node-checkbox-layers").checked).toBe(false);
        expect(document.getElementById("node-checkbox-annotations").checked).toBe(false);
        expect(document.getElementById("node-checkbox-measurements").checked).toBe(false);
        expect(document.getElementById("node-checkbox-Toc").checked).toBe(false);
    });

    it('If all children are checked, parent should be checked', () => {


        ReactDOM.render(
            <Tree
                data={[{
                    id: 'everything',
                    checked: true,
                    children: [{
                        id: "layers",
                        children: [{
                            id: "annotations",
                            checked: false
                        },
                        {
                            id: "measurements",
                            checked: false
                        }]
                    },
                    {
                        id: "Toc",
                        checked: true
                    }]
                }]}
            />,
            document.getElementById("container"));


        // Initially check all child checkboxes
        TestUtils.Simulate.change(document.getElementById("node-checkbox-annotations"), { target: { checked: true } });
        TestUtils.Simulate.change(document.getElementById("node-checkbox-measurements"), { target: { checked: true } });

        // Check that the 'layers' parent checkbox is checked
        expect(document.getElementById("node-checkbox-layers").checked).toBe(true);
        expect(document.getElementById("node-checkbox-everything").checked).toBe(true);
    });

    it('On Tree Update check callback', () => {
        const onTreeUpdate = () => {

        };
        const handlers = {
            onTreeUpdate
        };
        const spyOnTreeUpdate = expect.spyOn(handlers, 'onTreeUpdate');
        ReactDOM.render(<Tree data={[{
            id: 'everything',
            children: [{
                id: "layers",
                children: [{
                    id: "annotations"
                },
                {
                    id: "measurements"
                }
                ]
            },
            {
                id: "Toc"
            }
            ]
        }]} onTreeUpdate={handlers.onTreeUpdate} />, document.getElementById("container"));

        TestUtils.Simulate.change(document.getElementById(`node-checkbox-layers`), {target: {checked: true}});
        expect(document.getElementById("node-checkbox-layers").checked).toBe(true);
        expect(spyOnTreeUpdate).toHaveBeenCalled();
        expect(spyOnTreeUpdate.calls[0].arguments[0]).toExist();

    });


});
