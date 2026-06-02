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
import { t } from '@lib/i18n';
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
      toast.error(t('settingsProfile.nameLengthError'));
      return;
    }
    if (bio.length > 280) {
      toast.error(t('settingsProfile.bioLengthError'));
      return;
    }
    const trimmedAvatar = avatar.trim();
    if (trimmedAvatar && !/^https?:\/\//i.test(trimmedAvatar)) {
      toast.error(t('settingsProfile.avatarUrlError'));
      return;
    }
    const upperNationality = nationality.trim().toUpperCase();
    if (upperNationality && !/^[A-Z]{2}$/.test(upperNationality)) {
      toast.error(t('settingsProfile.nationalityError'));
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
      toast.success(t('settingsProfile.savedToast'));
      router.back();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : t('settingsProfile.saveError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.ink }}
    >
      <Header title={t('profile.editProfile')} onBack={() => router.back()} />
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
            {t('settingsProfile.avatarHint')}
          </Text>
        </View>

        <View style={{ gap: spacing['4'] }}>
          <Input label={t('settingsProfile.nameLabel')} value={name} onChangeText={setName} maxLength={80} />
          <Input
            label={t('settingsProfile.bioLabel')}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            maxLength={280}
            helperText={`${bio.length}/280`}
          />
          <Input
            label={t('settingsProfile.avatarLabel')}
            value={avatar}
            onChangeText={setAvatar}
            autoCapitalize="none"
            keyboardType="url"
          />
          <Input
            label={t('settingsProfile.nationalityLabel')}
            value={nationality}
            onChangeText={(v) => setNationality(v.toUpperCase().slice(0, 2))}
            autoCapitalize="characters"
            maxLength={2}
            helperText={t('settingsProfile.nationalityHelper')}
          />
        </View>

        <Button label={t('settingsProfile.saveChanges')} fullWidth loading={saving} onPress={save} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
