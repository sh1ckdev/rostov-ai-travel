import { View, Text, TouchableOpacity, Alert } from "react-native";
import { observer } from "mobx-react-lite";
import { authStore } from "../../stores/authStore";
import { useRouter } from "expo-router";
import { useEffect } from "react";

const ProfileScreen = observer(() => {
  const router = useRouter();

  useEffect(() => {
    if (!authStore.isAuth) {
      router.replace("/login");
    }
  }, [authStore.isAuth]);

  const handleLogout = () => {
    Alert.alert(
      "Выход",
      "Вы уверены, что хотите выйти?",
      [
        {
          text: "Отмена",
          style: "cancel"
        },
        {
          text: "Выйти",
          style: "destructive",
          onPress: async () => {
            await authStore.logout();
            router.replace("/login");
          }
        }
      ]
    );
  };

  if (!authStore.isAuth) {
    return null;
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white shadow-sm">
        <View className="px-6 py-8">
          <Text className="text-3xl font-bold text-gray-900 mb-2">Профиль</Text>
          <Text className="text-gray-600">Добро пожаловать в вашу учетную запись</Text>
        </View>
      </View>
      
      <View className="flex-1 px-6 py-8">
        <View className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Информация о пользователе</Text>
          
          <View className="space-y-4">
            <View className="border-b border-gray-200 pb-4">
              <Text className="text-sm font-medium text-gray-500 mb-1">Имя пользователя</Text>
              <Text className="text-lg text-gray-900">{authStore.user.username}</Text>
            </View>
            
            <View className="border-b border-gray-200 pb-4">
              <Text className="text-sm font-medium text-gray-500 mb-1">Email</Text>
              <Text className="text-lg text-gray-900">{authStore.user.email}</Text>
            </View>
            
            <View>
              <Text className="text-sm font-medium text-gray-500 mb-1">ID пользователя</Text>
              <Text className="text-lg text-gray-900">{authStore.user.id}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-500 rounded-xl py-4 px-6 shadow-sm"
        >
          <Text className="text-white text-center text-lg font-semibold">Выйти из аккаунта</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default ProfileScreen;
