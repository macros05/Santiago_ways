import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '@components/Header';
import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { Avatar } from '@components/Avatar';
import { Text } from '@design/text';
import { colors, layout, spacing } from '@design/tokens';
import { api, ApiError } from '@lib/api';
import { useAuth, type AuthUser } from '@stores/auth';
import { toast } from '@stores/toast';

export default function EditProfile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);

  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [avatar, setAvatar] = useState(user?.avatar ?? '');
  const [nationality, setNationality] = useState(user?.nationality ?? '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const trimmedName = name.trim();
    if (trimmedName.length < 1 || trimmedName.length > 80) {
      toast.error('El nombre debe tener entre 1 y 80 caracteres.');
      return;
    }
    if (bio.length > 280) {
      toast.error('La biografía no puede superar 280 caracteres.');
      return;
    }
    const trimmedAvatar = avatar.trim();
    if (trimmedAvatar && !/^https?:\/\//i.test(trimmedAvatar)) {
      toast.error('La URL del avatar debe comenzar por http(s)://');
      return;
    }
    const upperNationality = nationality.trim().toUpperCase();
    if (upperNationality && !/^[A-Z]{2}$/.test(upperNationality)) {
      toast.error('La nacionalidad debe ser un código ISO de 2 letras.');
      return;
    }

    const body: Record<string, string> = { name: trimmedName };
    if (bio !== (user?.bio ?? '')) body.bio = bio;
    if (trimmedAvatar && trimmedAvatar !== user?.avatar) body.avatar = trimmedAvatar;
    if (upperNationality && upperNationality !== user?.nationality) {
      body.nationality = upperNationality;
    }

    setSaving(true);
    try {
      const updated = await api<AuthUser>('/users/me', { method: 'PATCH', body });
      setUser({ ...(user ?? updated), ...updated });
      toast.success('Perfil actualizado.');
      router.back();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'No pudimos guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.stone950 }}
    >
      <Header title="Editar perfil" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + layout.headerHeight + spacing['4'],
          paddingHorizontal: spacing['5'],
          paddingBottom: insets.bottom + spacing['10'],
          gap: spacing['5'],
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: 'center', gap: spacing['2'] }}>
          <Avatar source={avatar || user?.avatar} name={name || user?.name} size="xl" />
          <Text variant="caption" color={colors.stone400} align="center">
            Pega una URL para cambiar tu avatar.
          </Text>
        </View>

        <View style={{ gap: spacing['4'] }}>
          <Input label="Nombre" value={name} onChangeText={setName} maxLength={80} />
          <Input
            label="Biografía"
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            maxLength={280}
            helperText={`${bio.length}/280`}
          />
          <Input
            label="URL de avatar"
            value={avatar}
            onChangeText={setAvatar}
            autoCapitalize="none"
            keyboardType="url"
          />
          <Input
            label="Nacionalidad (ISO)"
            value={nationality}
            onChangeText={(v) => setNationality(v.toUpperCase().slice(0, 2))}
            autoCapitalize="characters"
            maxLength={2}
            helperText="Ej. ES, FR, DE, JP"
          />
        </View>

        <Button label="Guardar cambios" fullWidth loading={saving} onPress={save} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
