import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../context/ThemeContext';


type Props = NativeStackScreenProps<any>;

const translations = {
  vi: {
    email: 'Email',
    password: 'Mật khẩu',
    login: 'Đăng nhập',
    signup: 'Chưa có tài khoản? Đăng ký',
    forgot: 'Quên mật khẩu?',
    invalidEmail: 'Email không hợp lệ',
    required: 'Bắt buộc',
    darkMode: 'Chế độ tối',
    language: 'Ngôn ngữ',
  },
  en: {
    email: 'Email',
    password: 'Password',
    login: 'Login',
    signup: "Don't have an account? Sign up",
    forgot: 'Forgot password?',
    invalidEmail: 'Invalid email',
    required: 'Required',
    darkMode: 'Dark Mode',
    language: 'Language',
  },
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');
  const [errorState, setErrorState] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const fadeAnim = new Animated.Value(0);

  const t = translations[language];
  const theme = isDarkMode ? darkTheme : lightTheme;

  const LoginSchema = Yup.object().shape({
    email: Yup.string().email(t.invalidEmail).required(t.required),
    password: Yup.string().required(t.required),
  });

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
    } catch (error: any) {
      setErrorState(error.message);
    }
  };

  // Run fade-in animation
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 600,
    useNativeDriver: true,
  }).start();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Animated.View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow, opacity: fadeAnim }]}>
          <Text style={[styles.title, { color: theme.text }]}>{t.login}</Text>

          <ToggleSwitch
            label={t.language}
            value={language === 'en'}
            onValueChange={() => setLanguage(language === 'en' ? 'vi' : 'en')}
            theme={theme}
          />
          <ToggleSwitch
            label={t.darkMode}
            value={isDarkMode}
            onValueChange={toggleTheme}
            theme={theme}
          />

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={LoginSchema}
            onSubmit={handleLogin}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <View>
                <InputField
                  icon="mail"
                  placeholder={t.email}
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  error={touched.email && errors.email}
                  theme={theme}
                />

                <InputField
                  icon="lock-closed"
                  placeholder={t.password}
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  error={touched.password && errors.password}
                  secureTextEntry={!showPassword}
                  theme={theme}
                  rightIcon={
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons
                        name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                        size={22}
                        color={theme.placeholder}
                      />
                    </TouchableOpacity>
                  }
                />

                {errorState !== '' && <Text style={styles.error}>{errorState}</Text>}

                <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={() => handleSubmit()}>
                  <Text style={styles.buttonText}>{t.login}</Text>
                </TouchableOpacity>

                <View style={styles.linkContainer}>
                  <Text style={[styles.link, { color: theme.text }]} onPress={() => navigation.navigate('Signup')}>
                    {t.signup}
                  </Text>
                  <Text style={[styles.link, { color: theme.text }]} onPress={() => navigation.navigate('ForgotPassword')}>
                    {t.forgot}
                  </Text>
                </View>
              </View>
            )}
          </Formik>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const ToggleSwitch = ({ label, value, onValueChange, theme }: any) => (
  <View style={styles.toggleRow}>
    <Text style={[styles.toggleLabel, { color: theme.text }]}>{label}</Text>
    <Switch value={value} onValueChange={onValueChange} />
  </View>
);

const InputField = ({
  icon,
  placeholder,
  value,
  onChangeText,
  onBlur,
  error,
  secureTextEntry = false,
  theme,
  rightIcon,
}: any) => (
  <View style={{ marginBottom: 18 }}>
    <View style={[
      styles.inputWrapper,
      {
        borderColor: error ? 'red' : theme.border,
        backgroundColor: theme.inputBg,
      }
    ]}>
      <Ionicons name={icon} size={20} color={theme.placeholder} style={{ marginRight: 8 }} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={theme.placeholder}
        style={[styles.input, { color: theme.inputText }]}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        secureTextEntry={secureTextEntry}
      />
      {rightIcon}
    </View>
    {error && <Text style={styles.error}>{error}</Text>}
  </View>
);

const lightTheme = {
  background: '#eaf0f6',
  card: '#fff',
  text: '#111',
  inputBg: '#f2f2f2',
  inputText: '#000',
  placeholder: '#888',
  border: '#ccc',
  shadow: '#000',
  primary: '#007bff',
};

const darkTheme = {
  background: '#121212',
  card: '#1e1e1e',
  text: '#fff',
  inputBg: '#2a2a2a',
  inputText: '#fff',
  placeholder: '#aaa',
  border: '#444',
  shadow: '#000',
  primary: '#1e90ff',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    elevation: 4,
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  toggleLabel: {
    fontSize: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  error: {
    color: 'red',
    fontSize: 13,
    marginTop: 4,
    marginLeft: 6,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 12,
    marginBottom: 18,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  linkContainer: {
    alignItems: 'center',
  },
  link: {
    fontSize: 14,
    marginTop: 8,
  },
});

export default LoginScreen;
