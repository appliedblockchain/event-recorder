// @flow

import EventRecorder from '../src/event-recorder'
import { get } from 'lodash'

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

test('record + partial match', async () => {
  setTimeout(() => {
    recorder.record('foo', { foo: 2, bar: 3 })
  }, 2 * 1000)
  expect(recorder.includes('foo', { bar: 3 })).toBeFalsy()
  expect(await recorder.eventuallyIncludes('foo', { bar: 3 })).toBeTruthy()
  expect(recorder.includes('foo', { bar: 3 })).toBeTruthy()
  expect(recorder.includes('foo', { bar: 2 })).toBeFalsy()
})

test('record + check with function', async () => {
  setTimeout(() => {
    recorder.record('foo', { nested: { foo: 2, bar: 3 } })
  }, 2 * 1000)
  expect(recorder.includes('foo', event => get(event, 'nested.bar') === 3)).toBeFalsy()
  expect(await recorder.eventuallyIncludes('foo', event => get(event, 'nested.bar') === 3)).toBeTruthy()
  expect(recorder.includes('foo', event => get(event, 'nested.bar') === 3)).toBeTruthy()
  expect(recorder.includes('foo', event => get(event, 'nested.bar') === 2)).toBeFalsy()
})

test('first + eventually first', async () => {
  setTimeout(() => {
    recorder.record('foo', { foo: 'xyz', bar: 'xyz' })
  }, 2 * 1000)
  expect(recorder.first('foo', { foo: 'xyz' })).toBeNull()
  expect(await recorder.eventuallyFirst('foo', { foo: 'xyz' })).toEqual({ foo: 'xyz', bar: 'xyz' })
})
