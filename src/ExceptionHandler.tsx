import * as React from 'react'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import { Button, StyleSheet, View, Text } from 'react-native'
import * as Sentry from '@sentry/react-native'
import {
  JSExceptionHandler,
  setJSExceptionHandler,
  setNativeExceptionHandler,
} from 'react-native-exception-handler'

interface Props {
  children: React.ReactNode
}

setNativeExceptionHandler((error) => {
  Sentry.captureMessage(`NativeExceptionHandler: ${JSON.stringify(error)}`)
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'center',
    alignContent: 'center',
    paddingHorizontal: 12,
  },
})

const myErrorHandler = (error: Error, info: { componentStack: string }) => {
  console.log('1')
  Sentry.captureMessage(`myErrorHandler: ${JSON.stringify(error)} => ${info}`)
}

const ErrorFallback = ({ resetErrorBoundary }: FallbackProps): JSX.Element => {
  return (
    <View style={styles.container}>
      <Text>Something went wrong</Text>
      <Button title="try Again" onPress={resetErrorBoundary} />
    </View>
  )
}

export const ErrorHandler: React.FC<Props> = (props: Props) => {
  React.useEffect(() => {
    const errorHandler = (error: any, isFatal: boolean): void => {
      console.log('2')
      if (isFatal) {
        Sentry.captureMessage(`JSExceptionHandler: ${JSON.stringify(error)}`)
      }
    }
    setJSExceptionHandler(errorHandler as JSExceptionHandler, true)
  }, [])

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onError={myErrorHandler}>
      {props.children}
    </ErrorBoundary>
  )
}
