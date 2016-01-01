import Kefir from "kefir"
import test from "tape"
import {expectSeq} from "./testUtil"
import Model from "../src/model"


test("Kefir Model", suite => {
  suite.test("is a normal observable that emits values that are set", t => {
    const m = Model("tsers")
    m.map(s => s.toUpperCase()).onValue(expectSeq(t, ["TSERS", "TSERS?", "TSERS!"]))
    m.set("tsers?")
    m.set("tsers!")
  })
  suite.test("does not emit its initial value if it wasn't given during model creation", t => {
    const m = Model()
    m.onValue(expectSeq(t, ["tsers"]))
    m.set("tsers")
  })
  suite.test("is lazy", t => {
    const vals = Kefir.sequentially(5, [1, 2])
    const m = Model()
    m.plug(vals)
    setTimeout(() => {
      m.onValue(expectSeq(t, [1, 2]))
    }, 100)
  })
  suite.test("access it's previous state with .modify", t => {
    const m = Model("tsers")
    m.onValue(expectSeq(t, ["tsers", "tsers!"]))
    m.modify(s => s + "!")
  })
  suite.test("keeps it's current state, even if not subscribed yet", t => {
    const m = Model(1)
    t.equal(m.get(), 1)
    m.set(2)
    t.equal(m.get(), 2)
    m.onValue(val => {
      t.equal(val, 2)
      t.equal(m.get(), 2)
      t.end()
    })
  })
  suite.test("skips duplicate values", t => {
    const m = Model(1)
    m.onValue(expectSeq(t, [1, 2]))
    m.set(2)
    m.set(2)
    m.set(2)
  })
  suite.test("allows getting and settings values from nested paths", t => {
    const m = Model({foo: {bar: "tsers"}})
    t.equal(m.getIn("foo.bar"), "tsers")
    m.setIn("foo.msg", "...")
    t.deepEqual(m.get(), {foo: {msg: "...", bar: "tsers"}})
    t.end()
  })
})

