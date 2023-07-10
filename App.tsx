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
import axios from 'axios';
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
        PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          {
            title: 'BLUETOOTH_CONNECT Permission',
            message: 'Stripe Terminal needs access to your BLUETOOTH_CONNECT',
            buttonPositive: 'Accept',
          },
        );
        PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          {
            title: 'BLUETOOTH_CONNECT Permission',
            message: 'Stripe Terminal needs access to your BLUETOOTH_CONNECT',
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
  async function fetchTokenProvider() {
    const res = await axios
      .get('https://testapi.mealzo.co.uk/api/v1/ConnectionToken')
      .then(response => {
        return response.data;
      })
      .catch(err => {
        return err.response;
      });

    return res;
  }

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
