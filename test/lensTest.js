import test from "tape"
import {expectSeq} from "./testUtil"
import Model from "../src/model"


test("Model lenses", suite => {
  suite.test("get changes from their parent model", t => {
    const m = Model({msg: ""})
    const msg = m.lens("msg")
    msg.onValue(expectSeq(t, ["", "tsers"]))
    m.set({msg: "tsers"})
  })
  suite.test("don't get updated if parent changes other property", t => {
    const m = Model({foo: 1, bar: 2})
    const foo = m.lens("foo")
    foo.onValue(expectSeq(t, [1, 4]))
    m.setIn("bar", 3)
    m.setIn("foo", 4)
  })
  suite.test("propagates changes to parent model", t => {
    const m = Model({foo: 1, bar: 2})
    m.onValue(expectSeq(t, [{foo: 1, bar: 2}, {foo: 2, bar: 2}]))
    m.lens("foo").set(2)
  })
  suite.test("supports nested lenses", t => {
    const m = Model({foo: 1, nested: {bar: 2}})
    m.onValue(expectSeq(t, [{foo: 1, nested: {bar: 2}}, {foo: 1, nested: {bar: 1}}]))
    m.lens("nested.bar").set(1)
  })
})

