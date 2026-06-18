import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Image, Modal, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { styles_app, Colors } from '../styles/App.styles';
import { styles } from '../styles/ProfileMenu.styles';
import { useAuth } from '../context/AuthContext';
import { getLocalAvatar, saveLocalAvatar } from '../utils/avatarStorage';
import ChangePasswordModal from './ChangePasswordModal';

interface Props {
  onLogout: () => void;
}

export default function ProfileMenu({ onLogout }: Props) {
  const { user } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      getLocalAvatar(user.id).then(setAvatarUri);
    }
  }, [user?.id, user?.avatar_url]);

  const initials = user?.full_name
    ?.split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('') ?? '?';

  const pickImage = async () => {
    setMenuVisible(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para subir una foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]?.uri && user?.id) {
      await saveLocalAvatar(user.id, result.assets[0].uri);
      setAvatarUri(result.assets[0].uri);
    }
  };

  return (
    <>
      <TouchableOpacity style={styles.avatarCircle} onPress={() => setMenuVisible(true)} activeOpacity={0.8}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
        ) : user?.avatar_url ? (
          <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarInitials}>{initials}</Text>
        )}
      </TouchableOpacity>

      <Modal visible={menuVisible} animationType="fade" transparent>
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={pickImage}>
              <Text style={styles.menuItemText}>📷  Cambiar foto de perfil</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => { setMenuVisible(false); setPasswordVisible(true); }}
            >
              <Text style={styles.menuItemText}>🔒  Cambiar contraseña</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemDanger]}
              onPress={() => {
                setMenuVisible(false);
                Alert.alert('Cerrar sesión', '¿Deseas salir de tu cuenta?', [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Salir', style: 'destructive', onPress: onLogout },
                ]);
              }}
            >
              <Text style={[styles.menuItemText, { color: Colors.error }]}>↩  Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <ChangePasswordModal
        visible={passwordVisible}
        onClose={() => setPasswordVisible(false)}
      />
    </>
  );
}
