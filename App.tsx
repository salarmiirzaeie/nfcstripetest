import {PropsWithChildren, useCallback, useEffect, useState} from 'react';
import axios from 'axios';
import {
  Alert,
  PermissionsAndroid,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';

import {
  StripeTerminalProvider,
  requestNeededAndroidPermissions,
  useStripeTerminal,
} from '@stripe/stripe-terminal-react-native';
import {Platform} from 'react-native';
import TapToPay from './android/TapToPay';
import {useInitializeStripeTerminal} from './android/hooks/useInitializeStripeTerminal';
import {useTapToPay} from './android/hooks/useTapToPay';

function App(): JSX.Element {
  // useInitializeStripeTerminal();

  async function fetchTokenProvider() {
    console.log('inside');

    const res = await axios.get(
      'https://testapi.mealzo.co.uk/api/v1/ConnectionToken',
    );

    console.log('inside2');
    console.log('res.data', res.data);

    return res.data;
  }

  const {error, handleTapToPay, loading} = useTapToPay();
  return (
    <StripeTerminalProvider
      logLevel="verbose"
      tokenProvider={fetchTokenProvider}>
      <TapToPay />
      <TouchableOpacity
        style={{backgroundColor: 'red', padding: 20}}
        onPress={() => {
          console.log('object');
          handleTapToPay({
            description: 'string',
            name: 'string',
            type: 'string',
            email: 'string',
            phone: 'string',
            amount: 5,
          });
        }}>
        <Text>dccdaaaaaaaaaaaaaaaaaaa</Text>
      </TouchableOpacity>
    </StripeTerminalProvider>
  );
}
export default App;
