import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { useStore } from '../stores/StoreContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const RegisterScreen = observer(({ navigation }) => {
  const { authStore } = useStore();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      Alert.alert('Ошибка', 'Введите имя');
      return false;
    }
    if (!formData.lastName.trim()) {
      Alert.alert('Ошибка', 'Введите фамилию');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Ошибка', 'Введите email');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Ошибка', 'Введите номер телефона');
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert('Ошибка', 'Пароль должен содержать минимум 6 символов');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Ошибка', 'Пароли не совпадают');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      await authStore.register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim()
      });
      // Навигация произойдет автоматически благодаря observer
    } catch (error) {
      Alert.alert('Ошибка регистрации', error.message);
    }
  };

  const InputField = ({ icon, placeholder, value, onChangeText, secureTextEntry, showPassword, onTogglePassword, keyboardType = 'default' }) => (
    <View style={styles.inputContainer}>
      <Ionicons name={icon} size={20} color="#666" style={styles.inputIcon} />
      <TextInput
        style={styles.textInput}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
        autoCorrect={false}
      />
      {onTogglePassword && (
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={onTogglePassword}
        >
          <Ionicons 
            name={showPassword ? "eye-outline" : "eye-off-outline"} 
            size={20} 
            color="#666" 
          />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
        >
          <View style={styles.logoContainer}>
            <Ionicons name="airplane" size={50} color="#fff" />
            <Text style={styles.appName}>Регистрация</Text>
            <Text style={styles.appSlogan}>Создайте аккаунт для начала путешествия</Text>
          </View>
        </LinearGradient>

        <View style={styles.formContainer}>
          <InputField
            icon="person-outline"
            placeholder="Имя"
            value={formData.firstName}
            onChangeText={(value) => updateFormData('firstName', value)}
          />

          <InputField
            icon="person-outline"
            placeholder="Фамилия"
            value={formData.lastName}
            onChangeText={(value) => updateFormData('lastName', value)}
          />

          <InputField
            icon="mail-outline"
            placeholder="Email"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            keyboardType="email-address"
          />

          <InputField
            icon="call-outline"
            placeholder="Номер телефона"
            value={formData.phone}
            onChangeText={(value) => updateFormData('phone', value)}
            keyboardType="phone-pad"
          />

          <InputField
            icon="lock-closed-outline"
            placeholder="Пароль"
            value={formData.password}
            onChangeText={(value) => updateFormData('password', value)}
            secureTextEntry={!showPassword}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />

          <InputField
            icon="lock-closed-outline"
            placeholder="Подтвердите пароль"
            value={formData.confirmPassword}
            onChangeText={(value) => updateFormData('confirmPassword', value)}
            secureTextEntry={!showConfirmPassword}
            showPassword={showConfirmPassword}
            onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
          />

          <TouchableOpacity
            style={[styles.registerButton, authStore.isLoading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={authStore.isLoading}
          >
            <Text style={styles.registerButtonText}>
              {authStore.isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>или</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>
              Уже есть аккаунт? Войти
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    marginBottom: 5,
  },
  appSlogan: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 5,
  },
  registerButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  registerButtonDisabled: {
    backgroundColor: '#ccc',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#666',
    fontSize: 14,
  },
  loginButton: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  loginButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RegisterScreen;
