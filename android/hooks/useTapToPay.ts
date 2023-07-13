import {useStripeTerminal} from '@stripe/stripe-terminal-react-native';
import axios from 'axios';
import {useCallback, useEffect, useState} from 'react';
import {Alert} from 'react-native';

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
