// @flow

import EventRecorder from '../src/event-recorder'

const recorder = new EventRecorder

test('record + includes', () => {
  recorder.record('foo', { foo: 1 })
  expect(recorder.includes('foo', { foo: 1 })).toBeTruthy()
  expect(recorder.includes('bar', { foo: 1 })).toBeFalsy()
  expect(recorder.includes('foo', { foo: 1, bar: 2 })).toBeFalsy()
  expect(recorder.includes('foo', { foo: 1 }, 1)).toBeFalsy()
})

test('record + eventually includes', async () => {
  setTimeout(() => {
    recorder.record('foo', { foo: 2 })
  }, 2 * 1000)
  expect(recorder.includes('foo', { foo: 2 })).toBeFalsy()
  expect(await recorder.eventuallyIncludes('foo', { foo: 2 })).toBeTruthy()
})
