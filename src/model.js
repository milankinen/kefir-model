import Kefir from "kefir"
import Immutable from "immutable"

const {fromJS} = Immutable

const toJS = (val) => {
  if (val instanceof Immutable.Iterable || val instanceof Immutable.Map) {
    return val.toJS()
  } else {
    return val
  }
}

const splitPath = path =>
  typeof path === "string" ? path.split(".") : path


export default (...args) => {
  let emitter = null

  const initialState = args[0]
  const state = new RootState(fromJS(initialState))
  const pool = Kefir.pool()
  const subscribe = em => {
    emitter = em
    if (args.length > 0) {
      // emit initial state only if set
      em.emit()
    }
    return () => emitter = null
  }
  const root =
    Kefir.stream(subscribe)
      .merge(pool)
      .map(() => state.get())
      .skipDuplicates()
      .toProperty()

  return Model(state, root, () => emitter && emitter.emit(), pool)
}

function Model(state, thisObs, emit, pool) {
  const subModels = {}
  const propCache = {}

  const getProp = key => {
    if (!propCache[key]) {
      propCache[key] =
        thisObs
          .map(m => m && m.get && m.get(key))
          .skipDuplicates()
          .toProperty()
    }
    return propCache[key]
  }

  const model = thisObs.map(toJS).toProperty()

  model.get = () => toJS(state.get())

  model.getIn = path => toJS(state.getIn(splitPath(path)))

  model.set = value => {
    state.set(fromJS(value))
    emit()
  }

  model.setIn = (path, value) => {
    state.setIn(splitPath(path), fromJS(value))
    emit()
  }

  model.modify = fn => {
    state.set(fromJS(fn(toJS(state.get()))))
    emit()
  }

  model.plug = obs => {
    pool.plug(obs.map(value => state.set(fromJS(value))))
  }

  model.plugModify = obs => {
    pool.plug(obs.map(fn => state.set(fromJS(fn(toJS(state.get()))))))
  }

  model.lens = path => {
    const [key, ...subKeys] = splitPath(path)
    if (!subModels[key]) {
      subModels[key] = Model(new PropState(state, key), getProp(key), emit, pool)
    }
    const subModel = subModels[key]
    return subKeys.length === 0 ? subModel : subModel.lens(subKeys)
  }

  return model
}


class RootState {
  constructor(value) {
    this.state = value
  }
  getRoot() {
    return this
  }
  getCtx() {
    return []
  }
  set(value) {
    this.state = value
  }
  setIn(path, value) {
    this.state = this.state.setIn(path, value)
  }
  get() {
    return this.state
  }
  getIn(path) {
    return this.state.getIn(path)
  }
}

class PropState {
  constructor(parent, prop) {
    this.root = parent.getRoot()
    this.ctx = [...parent.getCtx(), prop]
  }
  getRoot() {
    return this.root
  }
  getCtx() {
    return this.ctx
  }
  set(value) {
    this.root.setIn(this.ctx, value)
  }
  setIn(path, value) {
    this.root.setIn([...this.ctx, ...path], value)
  }
  get() {
    return this.root.getIn(this.ctx)
  }
  getIn(path) {
    return this.root.getIn([...this.ctx, ...path])
  }
}
