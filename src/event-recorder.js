// @flow

import { isMatch, isNil, isFunction } from 'lodash'
import Debug from 'debug'

const debug = new Debug('event-recorder')

type Record = { at: number, event: any }

type Source = Object | Object => boolean

function isOk(object: Object, source: Source): boolean {
  return isFunction(source) ? source(object) : isMatch(object, source)
}

export default class EventRecorder {

  map: Map<string, Record[]>

  constructor() {
    this.map = new Map
  }

  record(name: string, event: any): void {
    debug('record', { name, event })
    if (!this.map.has(name)) {
      this.map.set(name, [])
    }
    const records = ((this.map.get(name): any): Record[])
    records.push({ at: Date.now(), event })
  }

  includes(name: string, source: Source, gteIndex: number = 0): boolean {
    const records = this.map.get(name)
    if (isNil(records)) {
      return false
    }
    for (let i = records.length - 1; i >= gteIndex; i--) {
      const record = records[i]
      if (isOk(record.event, source)) {
        return true
      }
    }
    return false
  }

  async eventuallyIncludes(name: string, source: Source): Promise<boolean> {
    const timeout = Date.now() + 60 * 1000
    const probeEvery = 0.1 * 1000
    let i = 0
    let result = false
    while (Date.now() <= timeout) {
      if (this.includes(name, source, i)) {
        result = true
        break
      }
      i = (this.map.get(name) || []).length
      await new Promise(resolve => setTimeout(resolve, probeEvery))
    }
    return result
  }

}
