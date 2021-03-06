// @flow
import React from 'react';
import LottieView from 'lottie-react-native';
import RNRestart from 'react-native-restart';
import { I18nManager } from 'react-native';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { changeLanguage } from '../Actions';
import { withFirebase } from '../Firebase';

type Props = {
  navigation: Object,
  firebase: Object,
  i18n: Object,
  configs: Object,
  changeLanguage: typeof changeLanguage,
};
type State = {
  noConnection: boolean,
  user: Object | null,
  loading: boolean,
};
class Login extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      noConnection: false,
      user: null,
      loading: true,
    };
    this.auth();
  }

  auth = () => {
    const { firebase, navigation, i18n, configs, changeLanguage } = this.props;
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        firebase.getUser().then(({ language }) => {
          if (configs.language !== language || i18n.language !== language) {
            changeLanguage(language);
            i18n.changeLanguage(language).then(() => {
              I18nManager.forceRTL(language === 'ar');
              I18nManager.allowRTL(language === 'ar');
              if (
                (language === 'ar' && !I18nManager.isRTL) ||
                (language === 'en' && I18nManager.isRTL)
              ) {
                setTimeout(() => {
                  RNRestart.Restart();
                }, 0);
              }
            });
          }
        });
      } else {
        const {
          i18n: { language },
        } = this.props;
        if (
          (language === 'ar' && !I18nManager.isRTL) ||
          (language === 'en' && I18nManager.isRTL)
        ) {
          I18nManager.forceRTL(language === 'ar');
          I18nManager.allowRTL(language === 'ar');
          setTimeout(() => {
            RNRestart.Restart();
          }, 0);
        }
      }
      navigation.navigate(user ? 'SignedIn' : 'SignedOut');
    });
  };

  render() {
    return (
      <LottieView
        source={require('../Animations').connecting}
        autoPlay
        loop
        style={{
          backgroundColor: '#4F4F4F',
        }}
      />
    );
  }
}

const mapStateToProps = ({ configs }) => ({ configs });
const mapDispatchToProps = { changeLanguage };

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation()(withFirebase(Login)));
