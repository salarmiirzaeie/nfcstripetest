import {
  requestNeededAndroidPermissions,
  useStripeTerminal,
} from '@stripe/stripe-terminal-react-native';
import {useEffect} from 'react';
import {Alert, Platform} from 'react-native';

export const useInitializeStripeTerminal = () => {
  const {initialize, isInitialized} = useStripeTerminal();

  //   useEffect(() => {
  //     initialize();
  //   }, [initialize]);

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
      console.log('salam');

      const {reader, error} = await initialize();
      if (reader) {
        console.log('reader success');
      }
      if (error) {
        console.log(error.message);
      }
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
    console.log(isInitialized);
  }, []);
};
