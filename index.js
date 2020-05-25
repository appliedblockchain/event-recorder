// @flow

const isMatch = require('lodash/isMatch')
const isFunction = require('lodash/isFunction')
const Debug = require('debug')

/*::

type Record = { at: number, event: any }
type Source = Object | Object => boolean

*/

const debug = new Debug('event-recorder')

function isOk(object /*: Object */, source /*: Source */) /*: boolean */ {
  return isFunction(source) ? source(object) : isMatch(object, source)
}

class EventRecorder {

  /*:: map: Map<string, Record[]> */

  constructor() {
    this.map = new Map
  }

  record(name /*: string */, event /*: any */) /*: void */ {
    debug('record', { name, event })
    if (!this.map.has(name)) {
      this.map.set(name, [])
    }
    const records = ((this.map.get(name) /*: any */) /*: Record[] */)
    records.push({ at: Date.now(), event })
  }

  // Returns first matching event or null.
  first(name /*: string */, source /*: Source */, gteIndex /*:: ?: number */ = 0) /*: any */ {
    const records = this.map.get(name)
    if (!records) {
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

  async eventuallyFirst(name /*: string */, source /*: Source */, gteIndex /*:: ?: number */ = 0) /*: Promise<any> */ {
    debug('eventuallyFirst', { name, source, gteIndex })
    const timeout = Date.now() + (60 * 1000)
    const probeEvery = 0.1 * 1000
    let i = gteIndex
    let result = null
    while (Date.now() <= timeout) {
      if ((result = this.first(name, source, i))) {
        break
      }
      i = (this.map.get(name) || []).length
      await new Promise(resolve => setTimeout(resolve, probeEvery))
    }
    return result
  }

  includes(name /*: string */, source /*: Source */, gteIndex /*:: ?: number */ = 0) /*: boolean */ {
    return !!this.first(name, source, gteIndex)
  }

  async eventuallyIncludes(name /*: string */, source /*: Source */, gteIndex /*:: ?: number */ = 0) /*: Promise<boolean> */ {
    return !!(await this.eventuallyFirst(name, source, gteIndex))
  }

}

module.exports = EventRecorder
