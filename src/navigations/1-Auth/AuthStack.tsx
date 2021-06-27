import React from 'react'
import { createStackNavigator } from 'react-navigation'
import { AuthPhone } from './AuthPhone'
import { AuthOTP } from './AuthOTP'
import { OnboardPhone } from './OnboardPhone'
import { Alert, AsyncStorage } from 'react-native'
import { mobileParing, registerDeviceForPhuket } from '../../api'
import { useResetTo } from '../../utils/navigation'
import { applicationState } from '../../state/app-state'
import I18n from '../../../i18n/i18n'
/*
  handle deeplink
  morchana://app/:appId
*/

export const AuthStack = createStackNavigator(
  {
    OnboardPhone,
    AuthPhone,
    AuthOTP,
  },
  {
    headerMode: 'none',
    mode: 'modal',
  },
)

export const PhuketAuthStack = createStackNavigator(
  {
    PhuketAuthPhone: () => <AuthPhone navigationKey="PhuketAuthOPT" />,
    PhuketAuthOPT: () => {
      const resetTo = useResetTo()
      return (
        <AuthOTP
          submit={async (mobileNumber, otp) => {
            try {
              const bool = await mobileParing(mobileNumber, otp)
              console.log('mobileParing', bool)
              if (!bool) {
                Alert.alert(I18n.t('wrong_pwd'))
                return
              }

              const res = await registerDeviceForPhuket(mobileNumber)
              console.log('registerDeviceForPhuket', res)

              applicationState.setData('phuketRegistered', true)
              resetTo({ routeName: 'MainApp' })
            } catch (err) {
              console.log(err)
              Alert.alert(I18n.t('error'))
            }

            return true
          }}
          cancel={() => {
            resetTo({ routeName: 'MainApp' })
          }}
        />
      )
    },
  },
  {
    headerMode: 'none',
    mode: 'modal',
  },
)
