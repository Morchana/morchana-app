import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { MyBackground } from '../../components/MyBackground'
import { COLORS, FONT_BOLD, FONT_FAMILY, FONT_SIZES } from '../../styles'
import Feather from 'react-native-vector-icons/Feather'
import { healthStatus } from '../../api'
import I18n from '../../../i18n/i18n'
import AsyncStorage from '@react-native-community/async-storage'
import { Input, Button } from 'react-native-elements'

type ConnectionStatus = 'CONNECTED' | 'DISCONNECT' | 'NEVER_CONNECT'

export const Health = () => {
  const [status, setStatus] = useState<ConnectionStatus>('NEVER_CONNECT')
  const [macAddress, setMacAddress] = useState<string>('')
  const [loadMacAddress, setLoadMacAddress] = useState<boolean>(true)
  const [values, setValues] = useState<{
    bodyTemp?: number
    bloodPressure?: string
    heartRate?: number
  } | null>(null)
  const statusTitle = useMemo(() => {
    switch (status) {
      case 'CONNECTED':
        return 'เชื่อมต่อกับอุปกรณ์แล้ว'
      case 'DISCONNECT':
        return 'ขาดการเชื่อมต่อ'
      default:
        return 'ยังไม่เคยเชื่อมต่อ'
    }
  }, [status])

  useEffect(() => {
    AsyncStorage.getItem('macAddress').then((id) => {
      if (id) {
        setMacAddress(id)
      }
      setLoadMacAddress(false)
    })
  }, [])

  useEffect(() => {
    if (macAddress) {
      healthStatus(macAddress).then(
        ({ device_status, active, ...response }) => {
          if (device_status) {
            setStatus('CONNECTED')
          } else if (!device_status && active) {
            setStatus('DISCONNECT')
          }
          setValues({
            bodyTemp: response.body_temp,
            bloodPressure: response.blood_pressure,
            heartRate: response.heart_rate,
          })
        },
      )
    } else {
      setValues(null)
    }
  }, [macAddress])

  const onSaveMacAddress = (data: string) => {
    AsyncStorage.setItem('macAddress', data)
      .then(() => {
        return AsyncStorage.getItem('macAddress')
      })
      .then((mac) => {
        setMacAddress(mac!)
      })
  }

  const getNeverConnect = (): JSX.Element => {
    return (
      <View style={styles.boxDataContentNeverConnect}>
        <Text style={styles.boxDataContentNeverConnectTitle}>
          คุณยังไม่ได้เชื่อมต่อแอปพลิเคชันกับอุปกรณ์
        </Text>
        <Text style={styles.boxDataContentNeverConnectLabel}>
          กรุณากลับไปที่อุปกรณ์และกดเชื่อมต่อ
        </Text>
      </View>
    )
  }

  const getBlockStatus = (props: {
    isLast?: boolean
    isUnitNewLine?: boolean
    label: string
    unit: string
    value: number | string
  }): JSX.Element => {
    let customStyle = {}
    if (!props.isLast) {
      customStyle = {
        ...customStyle,
        borderBottomWidth: 0.5,
        borderBottomColor: '#C6CAD0',
      }
    }
    const style = StyleSheet.flatten([styles.boxStatus, customStyle])
    let customValueUnitStyle = {}
    if (props.isUnitNewLine) {
      customValueUnitStyle = {
        transform: [{ translateY: -15 }],
        fontSize: FONT_SIZES[400],
      }
    }
    const valueStyle = props.isUnitNewLine ? null : styles.boxStatusValue
    const valueUnitStyle = StyleSheet.flatten([
      styles.boxStatusTextValueUnit,
      customValueUnitStyle,
    ])
    return (
      <View style={style}>
        <Text style={styles.boxStatusTextLabel}>{props.label}</Text>
        <View style={valueStyle}>
          <Text style={styles.boxStatusTextValue}>{props.value}</Text>
          <Text style={valueUnitStyle}>{props.unit}</Text>
        </View>
      </View>
    )
  }

  const getStatus = (): JSX.Element => {
    return (
      <View style={styles.boxDataContentConnect}>
        {getBlockStatus({
          label: I18n.t('body_temperature'),
          unit: '°C',
          value: values?.bodyTemp || 0,
        })}
        {getBlockStatus({
          label: I18n.t('blood_pressure'),
          unit: 'มม.ปรอท',
          value: values?.bloodPressure || 0,
          isUnitNewLine: true,
        })}
        {getBlockStatus({
          label: I18n.t('heart_rate'),
          unit: 'ครั้ง/นาที',
          value: values?.heartRate || 0,
          isUnitNewLine: true,
          isLast: true,
        })}
      </View>
    )
  }

  return (
    <MyBackground variant="light">
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.PRIMARY_LIGHT}
        />
        <ScrollView contentInsetAdjustmentBehavior="automatic">
          <View style={styles.container}>
            <Text style={styles.textTitle}>{I18n.t('health_information')}</Text>
            <Text style={styles.textTitleLabel}>
              {I18n.t('display_health_data_from_connected_devices')}
            </Text>
            {!loadMacAddress && (
              <MacAddressInput
                macAddress={macAddress}
                onPress={onSaveMacAddress}
              />
            )}
            {values && (
              <View style={styles.boxData}>
                <View
                  style={{
                    ...styles.boxDataHeader,
                    backgroundColor:
                      status === 'CONNECTED' ? '#00AE26' : '#C8C8C8',
                  }}
                >
                  <Feather name="watch" color="#FFFFFF" size={16} />
                  <Text style={styles.boxDataHeaderTitle}>{statusTitle}</Text>
                </View>
                <View style={styles.boxDataContent}>
                  {status === 'NEVER_CONNECT' ? getNeverConnect() : getStatus()}
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </MyBackground>
  )
}

const MacAddressInput = (props: {
  macAddress: string
  onPress: (_: string) => void
}) => {
  const ref = useRef<any>()
  const [macAddress, setMacAddress] = useState<string>(props.macAddress || '')
  const [isEdit, setIsEdit] = useState<boolean>(false)

  useEffect(() => {
    if (!props.macAddress) {
      setIsEdit(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onChange = (value: string) => {
    setMacAddress(value.toUpperCase())
  }
  const onPress = () => {
    if (macAddress) {
      if (props.onPress) {
        props.onPress(macAddress)
        setIsEdit(false)
      }
    } else {
      ref.current.shake()
    }
  }
  const onOpenEdit = () => {
    setIsEdit(true)
  }
  const onCancel = () => {
    setIsEdit(false)
    setMacAddress(props.macAddress)
  }
  return (
    <View style={isEdit ? null : styles.boxMacAddress}>
      <View>
        <Input
          ref={ref}
          labelStyle={isEdit ? null : styles.labelMacAddress}
          inputStyle={isEdit ? null : styles.inputMacAddress}
          inputContainerStyle={isEdit ? null : styles.inputContainerMacAddress}
          label={'MAC address'}
          value={macAddress}
          onChangeText={onChange}
          placeholder={'Please input mac address'}
          disabled={!isEdit}
        />
        {isEdit && (
          <View style={styles.boxMacAddressButtonList}>
            <Button
              titleStyle={styles.boxMacAddressButton}
              title={I18n.t('save')}
              type={'clear'}
              onPress={onPress}
            />
            {!!props.macAddress && (
              <Button
                titleStyle={styles.boxMacAddressButton}
                title={I18n.t('cancel')}
                type={'clear'}
                onPress={onCancel}
              />
            )}
          </View>
        )}
      </View>
      {!isEdit && (
        <Button
          type="clear"
          icon={
            <Feather name="edit" size={15} color="black" onPress={onOpenEdit} />
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginRight: 20,
    marginLeft: 20,
    marginBottom: 20,
    backgroundColor: COLORS.WHITE,
  },
  textTitle: {
    marginTop: 40,
    marginBottom: 5,
    color: '#000000',
    fontSize: FONT_SIZES[700],
    fontFamily: FONT_BOLD,
  },
  textTitleLabel: {
    marginBottom: 10,
    color: '#000000',
    fontSize: FONT_SIZES[400],
    fontFamily: FONT_FAMILY,
  },
  boxData: {
    marginTop: 10,
    minHeight: 200,
  },
  boxDataHeader: {
    height: 40,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxDataHeaderTitle: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES[500],
    fontFamily: FONT_FAMILY,
    marginLeft: 5,
  },
  boxDataContent: {
    backgroundColor: '#f9f9f9',
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
  },
  boxDataContentNeverConnect: {
    display: 'flex',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
  },
  boxDataContentNeverConnectTitle: {
    fontSize: 20,
    textAlign: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  },
  boxDataContentNeverConnectLabel: {
    fontSize: 15,
    marginTop: 5,
    marginBottom: 5,
  },
  boxDataContentConnect: {
    backgroundColor: '#f9f9f9',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  boxStatus: {
    display: 'flex',
    flexDirection: 'row',
    height: 80,
    paddingLeft: 10,
    paddingRight: 10,
    justifyContent: 'space-between',
  },
  boxStatusValue: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-end',
  },
  boxStatusTextValue: {
    color: '#000000',
    fontSize: FONT_SIZES[900],
    fontFamily: FONT_FAMILY,
    textAlign: 'right',
  },
  boxStatusTextValueUnit: {
    color: '#000000',
    fontSize: FONT_SIZES[600],
    fontFamily: FONT_FAMILY,
    textAlign: 'right',
    letterSpacing: 1,
  },
  boxStatusTextLabel: {
    color: '#000000',
    fontSize: FONT_SIZES[500],
    fontFamily: FONT_FAMILY,
    paddingTop: 10,
  },
  boxMacAddress: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  boxMacAddressButtonList: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  boxMacAddressButton: {
    textTransform: 'capitalize',
  },
  labelMacAddress: {
    fontSize: FONT_SIZES[400],
    fontFamily: FONT_FAMILY,
  },
  inputMacAddress: {
    fontSize: FONT_SIZES[400],
    fontFamily: FONT_FAMILY,
  },
  inputContainerMacAddress: {
    height: 15,
    borderBottomWidth: 0,
  },
})
