import React, {useEffect} from 'react';
import {Text, View} from 'react-native';
import {useInitializeStripeTerminal} from './hooks/useInitializeStripeTerminal';
import {useStripeTerminal} from '@stripe/stripe-terminal-react-native';

const TapToPay = () => {
  useInitializeStripeTerminal();

  return (
    <View>
      <Text>rfcvrfvd</Text>
    </View>
  );
};

export default TapToPay;
