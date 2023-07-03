/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';
import type {PropsWithChildren} from 'react';
import {
  StripeTerminalProvider,
  useStripeTerminal,
} from '@stripe/stripe-terminal-react-native';

import {StyleSheet, Text, useColorScheme, View} from 'react-native';
import {PermissionsAndroid} from 'react-native';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): JSX.Element {
  const {initialize} = useStripeTerminal();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <View style={{justifyContent: 'center', padding: 5}}>
      <Text style={{textAlign: 'center'}}>{title}</Text>
      {children}
    </View>
  );
}

function App(): JSX.Element {
  useEffect(() => {
    async function init() {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Stripe Terminal needs access to your location',
            buttonPositive: 'Accept',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('You can use the Location');
        } else {
          console.error(
            'Location services are required in order to connect to a reader.',
          );
        }
      } catch {}
    }
    init();
  }, []);

  const fetchTokenProvider = async () => {
    const response = await fetch(`{YOUR BACKEND URL}/connection_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const {secret} = await response.json();
    return secret;
  };
  return (
    <StripeTerminalProvider
      logLevel="verbose"
      tokenProvider={fetchTokenProvider}>
      <Section title="app">
        <View />
      </Section>
    </StripeTerminalProvider>
  );
}

export default App;
