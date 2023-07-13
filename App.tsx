import {PropsWithChildren, useCallback, useEffect, useState} from 'react';
import axios from 'axios';
import {Alert, PermissionsAndroid, Text, View} from 'react-native';
import React from 'react';

import {
  StripeTerminalProvider,
  requestNeededAndroidPermissions,
  useStripeTerminal,
} from '@stripe/stripe-terminal-react-native';
import {Platform} from 'react-native';

export const useInitializeStripeTerminal = () => {
  const {initialize} = useStripeTerminal();
  const isAuth = true;

  const initializeAndroid = async () => {
    const granted = await requestNeededAndroidPermissions({
      accessFineLocation: {
        title: 'Location Permission',
        message: 'Stripe Terminal needs access to your location',
        buttonPositive: 'Accept',
      },
    });
    if (granted) {
      initialize();
    } else {
      Alert.alert(
        'Location and BT services are required in order to connect to a reader.',
      );
    }
  };

  useEffect(() => {
    if (isAuth) {
      if (Platform.OS === 'android') {
        initializeAndroid();
      } else {
        initialize();
      }
    }
  }, [isAuth]);
};
interface IUser {
  company: {
    stripeLocationId: string;
    stripeAccountId: string;
  };
}
export const useTapToPay = () => {
  const user: IUser = {
    company: {
      stripeLocationId: '5',
      stripeAccountId: '5',
    },
  };
  async function collectReaderPayment(amount: any) {
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
  async function captureReaderPayment(paymentIntentId: any) {
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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    discoverReaders,
    connectedReader,
    discoveredReaders,
    connectLocalMobileReader,
    cancelDiscovering,
    collectPaymentMethod,
    processPayment,
    retrievePaymentIntent,
    isInitialized,
  } = useStripeTerminal({
    onFinishDiscoveringReaders: error => {
      if (error?.message) {
        setError(error.message);
        setLoading(false);
      }
    },
    onDidChangeConnectionStatus: () => {
      setLoading(false);
    },
  });

  const discoverLocalMobile = useCallback(async () => {
    if (isInitialized && !connectedReader) {
      setError(null);
      setLoading(true);

      await cancelDiscovering();

      await discoverReaders({
        discoveryMethod: 'localMobile',
        simulated: true,
      });
    }
  }, [discoverReaders, isInitialized, connectedReader]);

  useEffect(() => {
    discoverLocalMobile();
  }, [discoverReaders]);

  const connectReader = async () => {
    await connectLocalMobileReader({
      reader: discoveredReaders[0],
      locationId: user?.company?.stripeLocationId || '',
      onBehalfOf: user?.company?.stripeAccountId || '',
    });
  };

  useEffect(() => {
    if (discoveredReaders[0]) {
      connectReader();
    }
  }, [discoveredReaders]);

  const handleTapToPay = async (requestData: {
    description: string;
    name: string;
    type: string;
    email: string;
    phone: string;
    amount: number;
  }) => {
    try {
      if (!user?.company?.stripeAccountId)
        throw new Error('No stripe account id');

      const requestDto = {
        stockNumber: requestData.description,
        customerName: requestData.name || 'test',
        ...(requestData.type === 'email'
          ? {
              customerEmail: requestData.email,
            }
          : {
              customerPhone: requestData.phone,
            }),
      };

      const {clientSecret} = await collectReaderPayment({
        amount: requestData.amount,
        ...requestDto,
      });

      const paymentIntentResponse = await retrievePaymentIntent(clientSecret);

      if (paymentIntentResponse.error || !paymentIntentResponse.paymentIntent)
        throw new Error(
          paymentIntentResponse.error?.message ||
            'Failed to retrieve payment intent',
        );

      // Exception thrown executing this:
      const paymentMethodResponse = await collectPaymentMethod({
        paymentIntentId: paymentIntentResponse.paymentIntent.id,
      });

      if (paymentMethodResponse.error || !paymentMethodResponse.paymentIntent)
        throw new Error(
          paymentMethodResponse.error?.message ||
            'Failed to collect payment method',
        );

      const processPaymentResponse = await processPayment(
        paymentMethodResponse.paymentIntent.id,
      );

      if (processPaymentResponse.error || !processPaymentResponse.paymentIntent)
        throw new Error(
          processPaymentResponse.error?.message || 'Failed to process payment',
        );

      await captureReaderPayment({
        paymentIntentId: processPaymentResponse.paymentIntent.id,
        ...requestDto,
      });

      Alert.alert('Your payment has succeeded!');

      return true;
    } catch (error: any) {
      Alert.alert(error?.message || 'Failed to process payment');
    }
  };

  return {
    handleTapToPay,
    loading,
    error,
  };
};

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): JSX.Element {
  const {initialize} = useStripeTerminal();

  useEffect(() => {
    initialize();
  }, []);

  return (
    <View
      style={{justifyContent: 'center', padding: 5, backgroundColor: 'green'}}>
      <Text style={{textAlign: 'center'}}>{title}</Text>
      {children}
    </View>
  );
}

function App(): JSX.Element {
  // useEffect(() => {
  //   async function init() {
  //     try {
  //       const granted = await PermissionsAndroid.request(
  //         PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  //         {
  //           title: 'Location Permission',
  //           message: 'Stripe Terminal needs access to your location',
  //           buttonPositive: 'Accept',
  //         },
  //       );
  //       PermissionsAndroid.request(
  //         PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
  //         {
  //           title: 'BLUETOOTH_CONNECT Permission',
  //           message: 'Stripe Terminal needs access to your BLUETOOTH_CONNECT',
  //           buttonPositive: 'Accept',
  //         },
  //       );
  //       PermissionsAndroid.request(
  //         PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
  //         {
  //           title: 'BLUETOOTH_CONNECT Permission',
  //           message: 'Stripe Terminal needs access to your BLUETOOTH_CONNECT',
  //           buttonPositive: 'Accept',
  //         },
  //       );
  //       if (granted === PermissionsAndroid.RESULTS.GRANTED) {
  //         console.log('You can use the Location');
  //       } else {
  //         console.error(
  //           'Location services are required in order to connect to a reader.',
  //         );
  //       }
  //     } catch {}
  //   }
  //   init();
  // }, []);
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
  useInitializeStripeTerminal();

  const {handleTapToPay, error, loading} = useTapToPay();
  useEffect(() => {
    handleTapToPay({
      description: 'string',
      name: 'string',
      type: 'string',
      email: 'string',
      phone: 'string',
      amount: 0,
    });
  }, []);
  return (
    <StripeTerminalProvider
      logLevel="verbose"
      tokenProvider={fetchTokenProvider}>
      <Section title="app">
        <View>
          <Text>Payment with nfc</Text>
        </View>
      </Section>
    </StripeTerminalProvider>
  );
}
export default App;
