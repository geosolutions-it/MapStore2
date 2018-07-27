
const Toolbar = require('../misc/toolbar/Toolbar');
const React = require('react');
const {compose, withState, branch, renderComponent, withProps} = require('recompose');
const SwitchPanel = require('../misc/switch/SwitchPanel');

const collapsible = compose(
    withState("collapsed", "setCollapsed", true),
        withProps(({ setCollapsed }) => ({
            buttons: [{
                glyph: 'minus',
                onClick: () => setCollapsed(true)
            }]
    })),
    branch(
        ({collapsed}) => collapsed,
        renderComponent(({setCollapsed}) => (<Toolbar buttons={[{
                glyph: 'time',
                onClick: () => setCollapsed(false)
            }]} />))
        )
);
module.exports = collapsible(({
   setCollapsed
}) => (<SwitchPanel expanded onSwitch={() => setCollapsed(true)}>
            <div style={{margin: 10}}>
                <h1>Current time</h1>
                <h2>{(new Date()).toDateString()}</h2>
            </div>
            <div style={{margin: 10}}>
            <Toolbar buttons={[
                {
                    glyph: "step-backward"
                }, {
                    glyph: "play"
                }, {
                    glyph: "pause"
                }, {
                    glyph: "stop"
                }, {
                    glyph: "step-forward"
                }
            ]
        } />
        </div>
        </SwitchPanel>));
