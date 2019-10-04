# Writing Actions and Reducers

> ┻┳|  
> ┳┻| _  
> ┻┳| •.•) 💬 *"Hey, Checkout this awesome documentation for actions and reducers!"*  
> ┳┻|⊂ﾉ     
> ┻┳|  

## What are actions?
Quoting the redux [documentation](https://redux.js.org/basics/actions) they are:
> Actions are payloads of information that send data from your application to your store.

They are simply plain JavaScript objects
```
/* trigger the panning action of the map to a center point */
const center = [42.3, 36.5];
export const PAN_TO = 'MAP:PAN_TO';
{
    type: PAN_TO,
    center
}
```
They must have type property, typically a constant with a string value, but any other properties are optional

## Why we use them
We need them to trigger changes to the application's store via reducers.
To do that we use Action Creators

## Action Creators
They are simply function that returns actions objects
```
const defaultValue = [42.3, 36.5];
/*
 * by convention, use an initial name (the action filename)
 * in order to describe better the action type, in this case MAP
 * separated by a colon : and the action constant name
*/
export const PAN_TO = 'MAP:PAN_TO';
export const panTo = (center = defaultValue) => ({
    type: PAN_TO,
    center
});
```
**Note:** Stick to es6 import/export module system and when possible provide a default value for the parameters

These action creators are used in the connected components or in [MapStore2 plugins](../plugins-howto/#connectedsamplejsx-2)
But actions by themselves are not enough we need Reducers that intercepts those actions and change the state accordingly.

**Note:** Remember to put all the actions .js files in the web/client/actions folder or in js/actions if you are working with custom plugins

## Reducers

Again quoting redux [documentation](https://redux.js.org/basics/reducers) they are:
> Reducers specify how the application's state changes in response to actions sent to the store.

Reducers are pure functions that take the previous state and an action and return a new state
> (previousState, action) => newState

let's see an example:
```
// @mapstore is an alias for dir_name/web/client (see webpack.config.js)
import {PAN_TO} from '@mapstore/actions/map';

export default function map(state, action) {
    switch (action.type) {
        case PAN_TO: {
            return {
                ...state,
                center: action.center
            };
        }
        default: return state;
    }
}
```
As you can see we are changing the center of the map that triggers the panning action of the mapping library

And that's it we have wrote an action and a reducers that make the map panning around.

**Note:** Remember to put all the reducers .js files in the web/client/reducers folder or in js/reducers if you are working with custom plugins

## Advanced usage and tips
Sometimes you need to change a value of an item which is stored inside an array or in a nested object.

Let's imagine we have this object in the store:
```
layer: {
    features: [object_1, object_2, ...object_n]
}
```

And we have created an action that holds the id of the object to change and some properties
```
export const UPDATE_LAYER_FEATURE = 'LAYER:UPDATE_LAYER_FEATURE'
export const updateFeature = (id, props = {}) => ({type: UPDATE_LAYER_FEATURE, id, props})
```

Then in the reducer we can have different implementations.
Here we show the one using **arrayUpdate** from @mapstore/utils/ImmutableUtils for updating objects in array
```
import {UPDATE_LAYER_FEATURE} from '@mapstore/actions/layer';
import {find} from 'lodash';
const defaultState = {
    features: [{ id: 1, type: "Feature", geometry: { type : "Point", coordinates: [1, 2]}}]
};

export default function layer(state = defaultState, action) {
    switch (action.type) {
        case UPDATE_LAYER_FEATURE: {
            // let's assume that action.props = {newProp: "newValue"}
            const feature = find(state.features, {id: action.id});
            // merging the old feature object with the new prop while replacing the existing element in the array
            const newFeature = {...feature, ...action.props};
            return arrayUpdate("features", newFeature, {id: action.id}, state);
            // after this you expect to find the new properties in the feature specified by the id
        }
        default: return state;
    }
}
```

# Testing
Tests in mapstore are stored in `__tests__` folder at the same level where actions/reducer are.
The file name is the same of the action/reducer with a '-test' suffix
```
actions/map.js
actions/__tests__/map-test.js
or
reducers/map.js
reducers/__tests__/map-test.js
```

We use [expect](https://github.com/mjackson/expect) as testing library, therefore we suggest to have a look there.

## How to test an action
Typically you want to test the type and the params return from the action creator

let's test the mapTo action:
```
// copyright section
import expect from 'expect';
import {panTo, PAN_TO} from '@mapstore/actions/map';
describe('Test correctness of the map actions', () => {
    it('testing panTo', () => {
        const center = [2, 3];
        const returnValue = panTo(center);
        expect(returnValue.type).toEqual(PAN_TO);
        expect(returnValue.center).toEqual(center);
    });
});

```
In order to speed up the unit test runner, you can:
- change the path in tests.webpack.js (custom/standard project) or build\tests.webpack.js (framework) to point to the folder parent of __tests__
for example `'/js/actions'` for custom/standard project or `'../web/client/actions'` for framework

- then run this command:
`npm run continuoustest`

This allows to run only the tests contained to the specified path.
**Note:** When all tests are successfully passing remember to restore it to its original value.

## How to test a reducer
Here things can become more complicated depending on your reducer but in general you want to test all cases
```
// copyright section
import expect from 'expect';
import {panTo} from '@mapstore/actions/map';
import map from '@js/reducers/map'; // the one created before not the one present in @mapstore/reducers
describe('Test correctness of the map reducers', () => {
    it('testing PAN_TO', () => {
        const center = [2, 3];
        const state = map({}, panTo(center));

        // here you have to check that state has changed accordingly
        expect(state.center).toEqual(center);
    });
});
```

Here for speedup testing you can again modify the tests.webpack.js (custom/standard project) or build\tests.webpack.js (framework)
in order to point to the reducers folder and then running
`npm run continuoustest`

## Actions and epics
Actions are not only used by redux to update the store (through the reducers),
but also for triggering side effects workflows managed by epics

For more details see [Writing epics](../writing-epics)
