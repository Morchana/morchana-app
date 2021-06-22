import BackgroundGeolocation, {
  Location,
} from 'react-native-background-geolocation'
import { getAnonymousHeaders } from '../api'
import { Platform } from 'react-native'
import { API_URL, SSL_PINNING_CERT_NAME, PHUKET_API_URL } from '../config'
import I18n from '../../i18n/i18n'
import DeviceInfo from 'react-native-device-info'
import AsyncStorage from '@react-native-community/async-storage'
import { isArray, isEmpty } from 'lodash'
import { fetch } from 'react-native-ssl-pinning'

const SECONDARY_SYNC_LOCATION_URL = PHUKET_API_URL

//This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
function calcCrow(lat1: number, lon1: number, lat2: number, lon2: number) {
  var R = 6371 // km
  var dLat = toRad(lat2 - lat1)
  var dLon = toRad(lon2 - lon1)
  var lat1 = toRad(lat1)
  var lat2 = toRad(lat2)

  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  var d = R * c
  return d
}

// Converts numeric degrees to radians
function toRad(value: number) {
  return (value * Math.PI) / 180
}

class BackgroundTracking {
  setup(startImmediately?: boolean) {
    if (startImmediately) {
      this.start()
    }
  }

  private registerGeoLocation() {
    const headers = getAnonymousHeaders()

    const MIN_DISTANCE = 25
    const AUTO_SYNC_THRESHOLD = 10
    const MAX_BATCH_SIZE = 30

    const LOCATION_KEY = 'location-list'

    BackgroundGeolocation.onLocation(async (location) => {
      var locations: Location[] = []
      try {
        const jsonStr = await AsyncStorage.getItem(LOCATION_KEY)
        if (jsonStr) locations = JSON.parse(jsonStr)
        if (!isArray(locations)) {
          locations = []
        }
      } catch (_) {}

      const oldLoc = locations[locations.length - 1]

      // not extra location then check min distance
      if (isEmpty(location.extras) && oldLoc) {
        const dist = calcCrow(
          oldLoc.coords.latitude,
          oldLoc.coords.longitude,
          location.coords.latitude,
          location.coords.longitude,
        )

        if (dist < MIN_DISTANCE / 1000) return
      }

      locations.push(location)

      AsyncStorage.setItem(LOCATION_KEY, JSON.stringify({ locations }))
    })

    BackgroundGeolocation.onHttp((res) => {
      if (res.status !== 200) return

      AsyncStorage.getItem(LOCATION_KEY)
        .then((locStr) => {
          if (!locStr) return

          fetch(SECONDARY_SYNC_LOCATION_URL + '/location', {
            sslPinning: {
              certs: [SSL_PINNING_CERT_NAME],
            },
            headers: headers,
            method: 'POST',
            body: locStr,
          })
        })
        .catch((e) => console.log('Send secondary locations failed.\n', e))
    })

    return BackgroundGeolocation.ready({
      // iOS
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      stationaryRadius: 50,

      // Android
      enableHeadless: false,
      allowIdenticalLocations: true,
      foregroundService: true,
      deferTime: 60 * 1000,

      // All
      locationUpdateInterval: 15 * 60 * 1000,
      distanceFilter: Platform.OS === 'android' ? 0 : MIN_DISTANCE,
      reset: true,
      logLevel: BackgroundGeolocation.LOG_LEVEL_OFF,
      debug: false,
      autoSync: true,
      httpTimeout: Platform.OS === 'ios' ? 5000 : undefined,
      stopOnTerminate: false,
      startOnBoot: true,
      batchSync: true,
      maxBatchSize: MAX_BATCH_SIZE,
      autoSyncThreshold: AUTO_SYNC_THRESHOLD,
      headers,
      url: API_URL + '/location',
      httpRootProperty: 'locations',
      locationsOrderDirection: 'ASC',
      locationAuthorizationAlert: {
        titleWhenNotEnabled: I18n.t('pls_set_loc_serv_as_always'),
        titleWhenOff: I18n.t('pls_set_loc_serv_as_always'),
        instructions: I18n.t(
          'help_notify_if_you_get_near_risky_person_or_area',
        ),
        cancelButton: 'Cancel',
        settingsButton: 'Settings',
      },
      notification: {
        title: I18n.t('morchana_tracking_is_on'),
        text: I18n.t('you_will_be_notified_when_closed_to_risky_ppl'),
      },
    })
  }

  start() {
    if (!this.canUseGeoLocation) {
      return Promise.resolve()
    }
    return this.registerGeoLocation().then((state) => {
      if (!state.enabled) {
        BackgroundGeolocation.start().catch(console.log)
      }
    })
  }

  stop() {
    if (!this.canUseGeoLocation) {
      return Promise.resolve()
    }
    BackgroundGeolocation.removeAllListeners()
    return BackgroundGeolocation.stop()
  }

  destroyLocations() {
    if (!this.canUseGeoLocation) {
      return Promise.resolve()
    }
    return BackgroundGeolocation.destroyLocations()
  }

  getLocation(extras: any = {}) {
    if (!this.canUseGeoLocation) {
      return Promise.resolve({ ...extras })
    }
    return this.registerGeoLocation().then(() => {
      return BackgroundGeolocation.getCurrentPosition({
        samples: 1,
        ...extras,
      })
    })
  }

  get canUseGeoLocation() {
    const hasGMS = DeviceInfo.hasGmsSync()
    return Platform.OS === 'ios' || hasGMS
  }
}

export const backgroundTracking = new BackgroundTracking()
