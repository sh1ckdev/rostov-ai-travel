import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { observer } from "mobx-react-lite";
import { authStore } from "../stores/authStore";
import { useRouter } from "expo-router";
import AuthRedirectGuard from "../components/AuthRedirectGuard";
import { Image } from "expo-image";

const LoginScreen = observer(() => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Ошибка", "Пожалуйста, заполните все поля");
      return;
    }
    
    await authStore.login(username, password);
    if (authStore.isAuth) {
      router.replace("/(tabs)");
    }
  };

  const navigateToRegister = () => {
    router.push("/register");
  };

  return (
    <AuthRedirectGuard>
      <View className="flex-1 bg-white">
        <View className="flex-1 justify-center px-8">
          <View className="bg-white rounded-2xl ">
            <View className="items-center mb-8">
            <Image 
  source={require("../assets/images/android-icon-foreground.png")} 
  style={{ width: 100, height: 100, marginBottom: 8 }} 
/>
            <Text className="text-3xl font-bold text-gray-900 mb-2">Rostov AI Travel</Text>
              <Text className="text-gray-600 text-center">Войди в свой аккаунт</Text>
            </View>

            <View className="space-y-6">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Имя пользователя</Text>
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-4 text-lg bg-gray-50 focus:border-blue-500 focus:bg-white"
                  placeholder="Введите имя пользователя"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Пароль</Text>
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-4 text-lg bg-gray-50 focus:border-blue-500 focus:bg-white"
                  placeholder="Введите пароль"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              {authStore.message ? (
                <View className="bg-red-50 border border-red-200 rounded-xl p-4 my-2">
                  <Text className="text-red-600 text-center">{authStore.message}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                onPress={handleLogin}
                disabled={authStore.isLoading}
                className={`rounded-xl py-4 px-6 mt-6 ${authStore.isLoading ? 'bg-gray-400' : 'bg-blue-600'}`}
              >
                {authStore.isLoading ? (
                  <View className="flex-row items-center justify-center">
                    <ActivityIndicator color="white" size="small" />
                    <Text className="text-white ml-2 text-lg font-semibold">Вход...</Text>
                  </View>
                ) : (
                  <Text className="text-white text-center text-lg font-semibold">Войти</Text>
                )}
              </TouchableOpacity>

              <View className="flex-row justify-center items-center mt-6">
                <Text className="text-gray-600">Нет аккаунта? </Text>
                <TouchableOpacity onPress={navigateToRegister}>
                  <Text className="text-blue-600 font-semibold">Зарегистрироваться</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </AuthRedirectGuard>
  );
});

export default LoginScreen;
