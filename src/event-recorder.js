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

  // Returns first matching event or null.
  first(name: string, source: Source, gteIndex: number = 0): any {
    const records = this.map.get(name)
    if (isNil(records)) {
      return null
    }
    for (let i = records.length - 1; i >= gteIndex; i--) {
      const record = records[i]
      if (isOk(record.event, source)) {
        return record.event
      }
    }
    return null
  }

  async eventuallyFirst(name: string, source: Source, gteIndex: number = 0): Promise<any> {
    const timeout = Date.now() + 60 * 1000
    const probeEvery = 0.1 * 1000
    let i = gteIndex
    let result = null
    while (Date.now() <= timeout) {
      if (!isNil(result = this.first(name, source, i))) {
        break
      }
      i = (this.map.get(name) || []).length
      await new Promise(resolve => setTimeout(resolve, probeEvery))
    }
    return result
  }

  includes(name: string, source: Source, gteIndex: number = 0): boolean {
    return !isNil(this.first(name, source, gteIndex))
  }

  async eventuallyIncludes(name: string, source: Source, gteIndex: number = 0): Promise<boolean> {
    return !isNil(await this.eventuallyFirst(name, source, gteIndex))
  }

}
