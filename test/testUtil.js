

export const expectSeq = (t, expectedSeq, endAfterSeq = true) => {
  expectedSeq = expectedSeq.slice()
  if (expectedSeq.length === 0 && endAfterSeq) {
    setTimeout(() => t.end(), 10)
  }

  return val => {
    if (expectedSeq.length === 0) {
      t.fail("Didn't expect any values anymore but got: " + val)
    }
    const expected = expectedSeq.shift()
    t.deepEqual(val, expected)
    if (expectedSeq.length === 0 && endAfterSeq) {
      setTimeout(() => t.end(), 10)
    }
  }
}
