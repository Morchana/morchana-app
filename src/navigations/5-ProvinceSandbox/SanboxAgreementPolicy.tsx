import React from 'react'
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { normalize, Button } from 'react-native-elements'
import { useNavigation } from 'react-navigation-hooks'
import { FormHeader } from '../../components/Form/FormHeader'
import { applicationState } from '../../state/app-state'
import {
  COLORS,
  FONT_BOLD,
  FONT_FAMILY,
  FONT_MED,
  FONT_SIZES,
} from '../../styles'
import I18n from '../../../i18n/i18n'
import { PrimaryButton } from '../../components/Button'
import { getAgreementText } from '../const'

type Props = {
  appStateKey: 'phuketAgreementAccepted' // | 'chiangmaiAgreementAccepted'
  consentMessage: string
  navigationKey: string
  provinceLabel: string
}

export const PhuketSanboxAgreementPolicy: React.FC = () => {
  return (
    <SandboxAgreementPolicy
      consentMessage={getAgreementText()}
      appStateKey="phuketAgreementAccepted"
      navigationKey="PhuketAuth"
      provinceLabel={'phuket_sandbox_setting2'}
    />
  )
}

const SandboxAgreementPolicy: React.FC<Props> = ({
  consentMessage,
  appStateKey,
  navigationKey,
  provinceLabel,
}) => {
  const navigation = useNavigation()

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={'white'} barStyle="light-content" />
      <FormHeader>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{I18n.t('term_and_conditions')}</Text>
            <Text style={styles.provinceLabel}>{I18n.t(provinceLabel)}</Text>
          </View>
          <Text style={styles.subtitle}>{I18n.t('before_usage')}</Text>
          <Text style={styles.subtitle}>{I18n.t('please_accept_terms')}</Text>
        </View>
      </FormHeader>
      <View style={styles.content}>
        <ScrollView contentContainerStyle={styles.contentScrollView}>
          <View style={styles.p24}>
            <Text style={styles.agreement}>{consentMessage} </Text>
          </View>
        </ScrollView>
      </View>
      <View style={styles.footer}>
        <PrimaryButton
          title={I18n.t('accept')}
          style={styles.w100}
          containerStyle={styles.buttonContent}
          onPress={() => {
            applicationState.setData(appStateKey, true)
            navigation.navigate(navigationKey)
          }}
        />
        <Button
          type="outline"
          title={I18n.t('deny')}
          style={styles.w100}
          titleStyle={styles.buttonTitle2}
          containerStyle={styles.buttonContent2}
          onPress={() => {
            navigation.pop()
          }}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  contentScrollView: {
    flexGrow: 1,
    paddingVertical: 16,
  },
  w100: {
    width: '100%',
  },
  p24: { paddingHorizontal: 24 },
  buttonContent: {
    width: '100%',
    marginTop: normalize(16),
  },
  buttonContent2: { width: '100%', marginTop: 8 },
  buttonTitle2: {
    fontFamily: FONT_MED,
    fontSize: FONT_SIZES[600],
    lineHeight: 30,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: 16,
    marginHorizontal: 24,
  },

  title: {
    fontFamily: FONT_BOLD,
    fontSize: FONT_SIZES[700],
    alignItems: 'center',
    color: COLORS.BLACK_1,
    textAlign: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  provinceLabel: {
    color: '#E05436',
    fontFamily: FONT_BOLD,
    fontSize: FONT_SIZES[700],
    paddingLeft: 2,
  },
  subtitle: {
    fontFamily: FONT_FAMILY,
    fontSize: FONT_SIZES[500],
    lineHeight: 24,
    alignItems: 'center',
    color: COLORS.SECONDARY_DIM,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.LIGHT_BLUE,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: COLORS.BORDER_LIGHT_BLUE,
  },
  agreement: {
    fontSize: FONT_SIZES[400],
    lineHeight: 24,
    color: COLORS.GRAY_4,
    marginBottom: 16,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: normalize(20),
    marginBottom: 8,
  },
})
