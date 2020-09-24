import { getBeacon } from '../api'

interface BeaconDetail {
  uuid: string
  major: number
  minor: number
}

interface CacheDetail {
  anonymousId: string
  lastUpdate: number
}

interface BeaconCache {
  [detail: string]: CacheDetail
}

class BeaconLookup {
  cache: BeaconCache

  constructor() {
    this.cache = {} as BeaconCache
  }

  private beaconToString({ uuid, major, minor }: BeaconDetail): string {
    return `${uuid}-${major}-${minor}`
  }

  public async findBeaconAnonymousId(
    uuid: string,
    major: number,
    minor: number,
  ): Promise<string | null> {
    const beacon = { uuid, major, minor } as BeaconDetail
    const beaconStr = this.beaconToString(beacon)
    const now = Date.now()

    if (beaconStr in this.cache) {
      // data exists in cache
      const { anonymousId, lastUpdate } = this.cache[beaconStr]
      if (now - lastUpdate < 24 * 60 * 1000) {
        // just only one query per day
        return anonymousId
      }
    }

    try {
      const response = await getBeacon(uuid, major, minor)
      const { anonymousId } = await response.json()
      // save data in the cache
      this.cache[beaconStr] = {
        anonymousId,
        lastUpdate: now,
      }
      return anonymousId
    } catch (e) {
      // cannot find the data
      return null
    }
  }
}

export const beaconLookup = new BeaconLookup()
