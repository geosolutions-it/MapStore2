# Writing Epics

Most of the asynchronous operations we are doing in MapStore2 are implemented using epics. This guide gives the developer the base concepts about epics and provides the best practices to write and add your epics to a MapStore2 project.

## Base Concepts

**Epics** are the core element of the [redux](https://github.com/reduxjs/redux) middleware called [redux-observable](https://redux-observable.js.org/). **redux-observable** is based on **RxJS**.

**RxJS** is a library for reactive programming using **Observables**, to make it easier to compose asynchronous or callback-based code.

**stream** The concept of stream is *"sequence of data made available over time."*.

```text
--a---b-c---d---X---|->

a, b, c, d are emitted values
X is an error
| is the 'completed' signal
---> is the timeline

```

**Observable** is the core entity of RxJS and, more generically, of the whole reactive programming paradigm. Basically is an entity that emit events and can be subscribed, so then the subscribers can intercept the events emitted. It this the entity that implements the concept of **stream** (so *stream* and *Observable* are almost used as synonym).

Subscribing observables can be hard, so the RxJs provides also a lot of **operators** that help to manipulate and combine observables (so, *streams*).
here an example of how operators allow to manipulate event streams to count clicks:

```text
clickStream:    ---c----c--c----c------c--> <-- Stream of clicks
                vvvvv map(c becomes 1) vvvv <-- opeartor that trasforms each event into a `1`
                ---1----1--1----1------1--> <-- new stream returned by the operator
                vvvvvvvvv scan(+) vvvvvvvvv <-- opeartor that does the sum
counterStream:  ---1----2--3----4------5--> <-- click count stream returned by the operator
```

The final stream can be finally subscribed to update, for instance, a counter on the UI.

### Versions

At the time of writing this documentation MapStore2 are using RxJS 5.1.1 and redux-observable 0.13.0.
Some changes are coming in RxJs and so in redux-observable from versions 1.0.0 (redux-observable) and 6 (RxJs). In particular the from RxJs6 the whole library became more *functional programming* oriented, and so an instance of an `Observable` (so a stream) has not any method anymore, using method like `pipe` instead of dot-style concateation:

```javascript
// typical epic in  1.0.0 - pipe
const pingEpic = action$ => action$.pipe(
    filter(action => action.type === 'PING'),
    mapTo({ type: 'PONG' })
);
// typical epic in 0.13.0 - dot concatenation
const pingEpic = action$ => action$
    .ofType('PING'),
    .mapTo({ type: 'PONG' })
;
```

So make you sure to check the documentation about the current versions of these libraries.

## What is an epic

An **epic** is basically nothing more that:

 *a function that returns a stream of redux actions to emit.*

A simple epic in mapstore can be this:

```javascript
const fetchUserEpic = (action$, store) => action$
    .ofType(MAP_CONFIG_LOADED)
    .filter(() => isMapLoadConfigurationEnabled(store.getState()))
    .map({
        type: NOTIFICATION,
        message: "Map Loaded"
    });
);
```

The epic function has 2 arguments:

- `action$`: the stream of of redux action. Every time an action is triggered redux, it is emitted as an event on the `action$` stream.
- `store`. A *small version* of redux store, that contains essentially only one important method called `getState()`. This method returns the current redux state object.

This function **must return** a new stream that emits the action we want to send back to redux. The **redux-observable** middleware subscribes the epics returned streams so the action will be automatically triggered on redux when they are emitted by the stream.

> **NOTE**: **redux-observable** middleware is already added to the MapStore2's StandardStore and StandardApp, so a developer should only take care of creating his own epics and add them to MapStore.

Typically the stream returned by an epic is always listening for new actions and sends other actions:

> ** actions in, actions out **.

Let's analyze the epic reported as first example:

It returns a stream ( arrow function (`=>`) implicit return) created manipulating the `action$` stream. It first filters out all the unwanted actions catching only the `MAP_CONFIG_LOADED` action types, then another filter checks the state to verify some condition (typically a `selector` can be used to check the state).

> **NOTE**: **redux-observable** adds an operator to rxjs called `ofType` that simply filters the action of certain types, passed as argument, but it is not a part of standard RxJS operators

At the end, the events that pass the 2 filters, pass by the `map` operator. The map operator simply returns the (action) object:

```javascript
{
    type: NOTIFICATION,
    message: "Map Loaded"
}
```

This object will be emitted on the returning stream and so the action will be triggered in redux.

Of course instead of emitting the plain object, you can use an action creator, like this:

```javascript
const notifyMapLoaded = (action$, store) => action$
    .ofType(MAP_CONFIG_LOADED)
    .filter(() => isMapLoadConfigurationEnabled(store.getState()))
    .map(info({
        message: "Map Loaded"
    }))
);
```

## Doing async

Typical async operation involve operators like:

- [switchMap](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-switchMap)
- [mergeMap](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-mergeMap)
- many others

The base concept of all these solutions is to project to the main stream the result of some other observable.

```javascript
const countDown = action$ => action$
    .ofType(START_COUNTDOWN)
    .switchMap( ({seconds}) =>
        Rx.Observable.interval(1000)
            .map( (value) => updateTime(seconds - value))
            .takeUntil(Rx.Observable.timer(seconds * 1000))
    );
```

Example:

```text
---{seconds: 5}------------------------> action in
vv switchMap vvvvvvvvvvvvvvvvvvvvvvvvvv
--------------{5}--{4}--{3}--{2}--{1}--> action out
```

In this epic, every time `START_COUNTDOWN` action is performed, The `switchMap` operator's argument function will be executed. The argument function of `switchMap` must return an Observable. Every value emitted on this stream will be projected on the main flow.

So on first `START_COUNTDOWN` the timer starts (`Rx.Observable.interval(1000)`). The timer will emit an incremental value (0, 1, 2, ...) every 1000 milliseconds. This value is used to trigger another action to emit on redux (using an action creator called `updateTime`, for instance).

At the end the stream will be closed after the n seconds because of the takeUntil:
`.takeUntil(Rx.Observable.timer(seconds * 1000))` unsubscribes the observable when the stream passed as function emits a value.

`switchMap` operator unsubscribes its observable ( so stops getting events from it ) even if another event comes on the main stream (so in this case another `START_COUNTDOWN` action).
```text
---{seconds: 5}------{seconds: 5}----------------------->   action in
vvvvvvvvvvvvvvvvv switchMap vvvvvvvvvvvvvvvvvvvvvvvvvvvv
--------------{5}-{4}----------{5}--{4}--{3}--{2}--{1}-->   action out
```

If you don't want to stop listening you may need to use, instead, `mergeMap`.

Imagine to have to modify the epic above to manage many countdown, identified by an `id`. In this case a START_COUNDOWN event should not stop the ones already started. You can do it using mergeMap.

```javascript
const countDown = action$ => action$
    .ofType(START_COUNTDOWN)
    // mergeMap do not stops the flows already created.
    .mergeMap( ({seconds, id}) => // the id of the new countdown is in the action
        Rx.Observable.interval(1000)
            // emit an action that updates the coundown for the specific id
            .map( (value) => updateTime(seconds - value, id))
            .takeUntil(Rx.Observable.timer(seconds * 1000))
    );
```
In this case the streams will look like this:

```text
---{sec: 5,id: A}----{sec: 5, id: B}----------------------------->   action in
vvvvvvvvvvvvvvvvvvvvvvvvvv switchMap vvvvvvvvvvvvvvvvvvvvvvvvvv
...............A....A....A....A...B...A...B....B....B....B........    id
--------------{5}--{4}--{3}--{2}-{5}-{1}-{4}--{3}--{2}--{1}------->   value

```

## Doing AJAX

Ajax calls in MapStore should all pass by `libs/ajax.js`. This is an `axios` instance that add the support for using proxies or CORS.

Axios is a library that uses es6 Promises to do ajax calls. Luckily RxJs allow to use Promises instead of streams in most of the cases. In the other cases, there are some a specific creational operators called `fromPromise` or `defer` you can use to wrap your Promise into a stream.

> NOTE: is perfectly normal to consider the concept of Promise as a special case of a stream, that emit one value, then closes.


So,everytime you have to do an ajax call, you will need to use axios:

Example with `defer`:

```javascript

const axios = require('../libs/ajax');
const fetchDataEpic = (action$, store) => action$
    .ofType(FETCH_DATA)
    .switchMap(
        Rx.Observable.defer(() => axios.get("MY_DATA")) // defer gets a function
            map(response => dataFetched(response.data))
    );
```

Example with `fromPromise`

```javascript

const axios = require('../libs/ajax');
const fetchDataEpic = (action$, store) => action$
    .ofType(FETCH_DATA)
    .switchMap(
        Rx.Observable.fromPromise(axios.get("MY_DATA"))
            map(response => dataFetched(response.data))
    );
```
