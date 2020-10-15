import React from 'react'
import {
  NativeModules,
  Dimensions,
  AppState,
  AppStateStatus,
} from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-community/async-storage'
import { createAppContainer } from 'react-navigation'
import Navigator from './navigations/Navigator'
import { View, Alert } from 'react-native'
import { NavigationContainerComponent } from 'react-navigation'
import { HUDProvider } from './HudView'
import SplashScreen from 'react-native-splash-screen'
import { COLORS } from './styles'
import codePush from 'react-native-code-push'
import { userPrivateData } from './state/userPrivateData'
import { backgroundTracking } from './services/background-tracking'
import { ContactTracerProvider } from './services/contact-tracing-provider'
import { applicationState } from './state/app-state'
import { ThemeProvider } from 'emotion-theming'
import { withSystemAvailable } from './services/available'
import { CODEPUSH_DEPLOYMENT_KEY } from './config'
import { compose } from './utils/compose'
import { pushNotification, NOTIFICATION_TYPES } from './services/notification'
import { refetchJWKs } from './utils/jwt'
import { refetchDDCPublicKey } from './utils/crypto'
import I18n from '../i18n/i18n'
import { ErrorHandler } from './ExceptionHandler'

const AppContainer = createAppContainer(Navigator)

class App extends React.Component {
  _navigator: NavigationContainerComponent | null
  state: {
    loaded: boolean
    activateCallback?: Function
  }
  appState: AppStateStatus
  constructor(props) {
    super(props)
    this._navigator = null
    this.state = {
      loaded: false,
    }
  }
  componentDidMount() {
    // Sentry.nativeCrash();
    this.load().catch((err) => {
      console.log('err', err)
      Alert.alert('Load app failed')
    })
  }
  purgeAll() {
    return Promise.all([
      AsyncStorage.clear(),
      backgroundTracking.destroyLocations(),
    ])
  }
  async load() {
    if (__DEV__) {
      // await this.purgeAll()
    }
    const locale = await AsyncStorage.getItem('locale')
    if (locale) {
      I18n.locale = locale
    } else {
      I18n.locale = 'th'
    }

    await Promise.all([
      applicationState.load(),
      userPrivateData.load(),
      refetchJWKs(),
    ])
    await backgroundTracking.setup(
      Boolean(applicationState.getData('isPassedOnboarding')),
    )

    await NativeModules.ContactTracerModule.setUserId(
      userPrivateData.getAnonymousId(),
    )
    AppState.addEventListener('change', this.handleAppStateChange)

    refetchDDCPublicKey()
    this.setState({ loaded: true }, () => {
      SplashScreen.hide()
    })
  }
  handleAppStateChange(state: AppStateStatus) {
    if (this.appState !== state) {
      if (state === 'active') {
        refetchJWKs()
      }
    }
    this.appState = state
  }
  getTheme() {
    return {
      scaling: Dimensions.get('window').height / 818,
    }
  }
  onNavigatorLoaded() {
    pushNotification.configure(this.onNotification)
  }
  onNotification = (notification) => {
    const notificationData = notification?.data?.data || notification?.data
    if (!notificationData?.type) {
      return
    }
    const navigation = (this._navigator as any)._navigation
    switch (notificationData.type) {
      case NOTIFICATION_TYPES.OPEN: {
        if (notificationData.routeName) {
          navigation.navigate(notificationData.routeName)
        } else if (notificationData.url) {
          // Linking.openURL(notificationData.url)
          navigation.navigate('Webview', {
            uri: notificationData.url,
            onClose: () => {
              navigation.pop()
            },
          })
        }
        break
      }
    }
  }

  render() {
    if (!this.state.loaded) {
      return null
    }
    const theme = this.getTheme()

    return (
      <ErrorHandler>
        <ThemeProvider theme={theme}>
          <ContactTracerProvider
            anonymousId={userPrivateData.getAnonymousId()}
            isPassedOnboarding={applicationState.getData('isPassedOnboarding')}
          >
            <SafeAreaProvider>
              <HUDProvider>
                <View style={{ flex: 1, backgroundColor: COLORS.PRIMARY_DARK }}>
                  <AppContainer
                    uriPrefix="morchana://"
                    ref={(navigator) => {
                      if (!this._navigator) {
                        this._navigator = navigator
                        this.onNavigatorLoaded()
                      }
                    }}
                  />
                </View>
              </HUDProvider>
            </SafeAreaProvider>
          </ContactTracerProvider>
        </ThemeProvider>
      </ErrorHandler>
    )
  }
}

export default compose(
  CODEPUSH_DEPLOYMENT_KEY
    ? codePush({
        // @ts-ignore
        installMode: codePush.InstallMode.IMMEDIATE,
        checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
        deploymentKey: CODEPUSH_DEPLOYMENT_KEY,
      })
    : (c) => c,
  withSystemAvailable,
)(App)
