// @flow
import * as React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { TextInput, Button } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { withTranslation } from 'react-i18next';
import { DropDown } from '../Components';
import { withFirebase } from '../Firebase';

const LoginSchema = Yup.object().shape({
  password: Yup.string().required('password-is-required'),
  email: Yup.string()
    .email('NO_MESSAGE')
    .required('email-is-required'),
});

type State = {
  isSubmitting: boolean,
};
type Props = {
  firebase: Object,
  navigation: Object,
  t: Function,
};
class Login extends React.Component<Props, State> {
  password: React.ElementRef<TextInput>;

  constructor(props: Object) {
    super(props);
    this.state = {
      isSubmitting: false,
    };
  }

  submit = (values: Object) => {
    const { firebase, t } = this.props;
    const changeIsSubmitting = isSubmitting => this.setState({ isSubmitting });
    changeIsSubmitting(true);
    LoginSchema.validate(values, {
      strict: true,
      stripUnknown: true,
    })
      .then(() => {
        firebase
          .signIn(values)
          .then(() => {})
          .catch(error => {
            DropDown.error(t(error));
            changeIsSubmitting(false);
          });
      })
      .catch(({ message }) => {
        if (message !== 'NO_MESSAGE') {
          DropDown.error(t(message));
        }
        changeIsSubmitting(false);
      });
  };

  render() {
    const { navigation, t } = this.props;
    const isLabel = Platform.OS === 'android' && t('lang-code') === 'en';
    return (
      <Formik
        initialValues={{
          email: '',
          password: '',
        }}
        onSubmit={this.submit}
        render={({ values, handleBlur, handleChange, handleSubmit }) => (
          <KeyboardAwareScrollView style={{ backgroundColor: '#F6F6F6' }}>
            <View style={styles.container}>
              <View style={styles.inputsContainer}>
                <TextInput
                  autoFocus
                  label={isLabel ? t('email') : ''}
                  placeholder={!isLabel ? t('email') : ''}
                  style={styles.input}
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  mode="outlined"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="next"
                  onSubmitEditing={() => this.password.focus()}
                />
                <TextInput
                  secureTextEntry
                  label={isLabel ? t('password') : ''}
                  placeholder={!isLabel ? t('password') : ''}
                  style={styles.input}
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  mode="outlined"
                  returnKeyType="done"
                  ref={o => (this.password = o)}
                  onSubmitEditing={handleSubmit}
                />
              </View>
              <View style={styles.buttonsContainer}>
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={styles.button}
                  disabled={this.state.isSubmitting}
                  loading={this.state.isSubmitting}>
                  {t('log-in')}
                </Button>
                <Button
                  mode="text"
                  style={styles.button}
                  onPress={() => navigation.navigate('Signup')}>
                  {t('dont-have-an-account')}
                </Button>
                <Button
                  mode="text"
                  style={styles.button}
                  onPress={() =>
                    navigation.navigate('ForgotPassword', {
                      email: values.email,
                    })
                  }>
                  {t('forgot-your-password')}
                </Button>
              </View>
            </View>
          </KeyboardAwareScrollView>
        )}
      />
    );
  }
}

const { height } = Dimensions.get('screen');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: height * 0.8,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  inputsContainer: {
    paddingVertical: 20,
  },
  input: {
    marginVertical: 8,
  },
  buttonsContainer: {
    paddingVertical: 4,
  },
  button: {
    paddingVertical: 5,
    marginHorizontal: 12,
    marginVertical: 8,
  },
});

export default withTranslation()(withFirebase(Login));
