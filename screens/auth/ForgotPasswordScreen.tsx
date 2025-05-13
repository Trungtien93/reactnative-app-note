import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons'; // Thêm biểu tượng

type Props = NativeStackScreenProps<any>;

const translations = {
  vi: {
    email: 'Email',
    reset: 'Gửi email đặt lại mật khẩu',
    login: 'Quay lại đăng nhập',
    invalidEmail: 'Email không hợp lệ',
    required: 'Bắt buộc',
    success: 'Email đặt lại mật khẩu đã được gửi!',
    darkMode: 'Chế độ tối',
    language: 'Ngôn ngữ',
  },
  en: {
    email: 'Email',
    reset: 'Send password reset email',
    login: 'Back to Login',
    invalidEmail: 'Invalid email',
    required: 'Required',
    success: 'Password reset email sent!',
    darkMode: 'Dark Mode',
    language: 'Language',
  },
};

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');
  const [feedback, setFeedback] = useState('');
  const [errorState, setErrorState] = useState('');

  const t = translations[language];

  const ForgotSchema = Yup.object().shape({
    email: Yup.string().email(t.invalidEmail).required(t.required),
  });

  const handleReset = async (values: { email: string }) => {
    try {
      await sendPasswordResetEmail(auth, values.email);
      setFeedback(t.success);
      setErrorState('');
    } catch (error: any) {
      setErrorState(error.message);
      setFeedback('');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Chuyển đổi ngôn ngữ */}
      <View style={styles.toggleRow}>
        <Text style={[styles.toggleLabel, { color: theme.text }]}>{t.language}</Text>
        <Switch
          value={language === 'en'}
          onValueChange={() => setLanguage(language === 'en' ? 'vi' : 'en')}
        />
      </View>

      {/* Chuyển đổi chế độ tối */}
      <View style={styles.toggleRow}>
        <Text style={[styles.toggleLabel, { color: theme.text }]}>{t.darkMode}</Text>
        <Switch value={isDarkMode} onValueChange={toggleTheme} />
      </View>

      {/* Tiêu đề */}
      <Text style={[styles.title, { color: theme.text }]}>{t.reset}</Text>

      {/* Form */}
      <Formik
        initialValues={{ email: '' }}
        validationSchema={ForgotSchema}
        onSubmit={handleReset}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View>
            {/* Trường nhập email */}
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={theme.placeholder} style={styles.icon} />
              <TextInput
                placeholder={t.email}
                placeholderTextColor={theme.placeholder}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.inputBg,
                    color: theme.inputText,
                    borderColor: theme.border,
                  },
                ]}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
              />
            </View>
            {touched.email && errors.email && (
              <Text style={styles.error}>{errors.email}</Text>
            )}
            {errorState !== '' && <Text style={styles.error}>{errorState}</Text>}
            {feedback !== '' && <Text style={styles.success}>{feedback}</Text>}

            {/* Nút gửi */}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.button }]}
              onPress={() => handleSubmit()}
            >
              <Text style={[styles.buttonText, { color: theme.buttonText }]}>{t.reset}</Text>
            </TouchableOpacity>

            {/* Liên kết quay lại đăng nhập */}
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.link, { color: theme.text }]}>{t.login}</Text>
            </TouchableOpacity>
          </View>
        )}
      </Formik>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleLabel: {
    fontWeight: '600',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  error: {
    color: 'red',
    marginBottom: 10,
    marginLeft: 4,
  },
  success: {
    color: 'green',
    marginBottom: 10,
    marginLeft: 4,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 10,
  },
});

export default ForgotPasswordScreen;