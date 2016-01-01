import React from "react"
import {render} from "react-dom"
import Kefir from "kefir"
import Model from "kefir-model"
import {Combinator} from "react-combinators/kefir"

const App = ({model}) => {
  const weight = model.lens("weight")
  const height = model.lens("height")
  const bmi = Kefir.combine([weight, height])
    .map(([w, h]) => Math.round(w / (h * h * 0.0001)))
    .toProperty()

  return (
    <Combinator>
      <div>
        <h1>BMI counter</h1>
        {/* must use wrapper object so that <Combinator> won't combine the observable in this component */}
        <Slider title="Height" model={{val: height}} min={100} max={240} />
        <Slider title="Weight" model={{val: weight}} min={40} max={150} />
        Your BMI is: <span className="bmi">{bmi}</span>
      </div>
    </Combinator>
  )
}

const Slider = ({title, min, max, model: {val}}) =>
  <Combinator>
    <div>
      {title}: {val} <br />
      <input type="range" min={min} max={max} value={val} onChange={e => val.set(e.target.value)} />
    </div>
  </Combinator>

const myModel = Model({height: 180, weight: 80})
render(<App model={myModel} />, document.getElementById("app"))
