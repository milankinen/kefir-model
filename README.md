# Kefir Model

Reactive model for **[Kefir](https://github.com/rpominov/kefir)**.

[![Build Status](https://img.shields.io/travis/milankinen/kefir-model.svg?style=flat-square)](https://travis-ci.org/milankinen/kefir-model)
[![NPM Version](https://img.shields.io/npm/v/kefir-model.svg?style=flat-square)](https://www.npmjs.com/package/kefir-model)

## Motivation

Because reactive programming should be easy and boilerplate free.

## API

### Creating model

A new model can be created by passing an optional initial state. Model
state can be any JavaScript value. If initial state is given, then it
is emitted when the model is subscribed first time.

```javascript
import Model from "kefir-model"
const myModel = Model({ author: "Matti" })
```


### Using model

Model is a normal Kefir observable that can be derived by using Observable's
higher order functions. In addition, model has the following method that
can be used to monitor and/or modify the model's state.

#### `.get()`

Returns model's current state

#### `.getIn(path)`

Returns model's current partial state from the given path. Path can be either 
a string with dot notation (e.g. `foo.bar`) or an array of path parts.

#### `.set(newState)`

Sets new state to the model

#### `.setIn(path, newState)`

Sets a partial state to the model in the given path. Path can be either
a string with dot notation (e.g. `foo.bar`) or an array of path parts.

#### `.modify(currentState => newState)`

Takes a function that receives the current model state and returns
(synchronously) the new state to the model.

#### `.plug(Observable<newState>)`

Like in `Kefir.pool` but also modifies the model state (each time when
the given observable emits a new value, it'll be assigned as model's
new state).

#### `.plugModify(Observable<currentState => newState>)`

`.plug` and `.modify` combined.

#### `.lens(path)`

Creates a reactive lens that is linked to model's property (or 
sub-property). Path can be either a string with dot notation (e.g. `foo.bar`) 
or an array of path parts.

Lenses can be also created to non-existing properties.


### Lenses

Lenses in `kefir-model` are just models (with exactly same API as described
above) that are linked to their parent model: if you modify the lensed model,
the modification will propagate to the parent model and vice versa.

Lenses are optimized so that they don't emit values **if** the "lensed property" 
has not changed. 

Lenses are a powerful tool that can be used to divide your application's state
into smaller pieces. Ideally you application has only one "top level" model
that is divided into smaller pieces by using lenses.


## License

MIT


