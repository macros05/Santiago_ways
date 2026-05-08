import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@components/Button';
import { Input } from '@components/Input';
import { Text } from '@design/text';
import { colors, spacing } from '@design/tokens';
import { useAuth } from '@stores/auth';
import { toast } from '@stores/toast';
import { ApiError } from '@lib/api';
import { t } from '@lib/i18n';

export default function Register() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const register = useAuth((s) => s.register);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [nationality, setNationality] = useState('ES');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim();
    if (trimmedName.length < 1) {
      toast.error(t('auth.name'));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error(t('auth.invalidEmail'));
      return;
    }
    if (trimmedUsername.length < 3 || trimmedUsername.length > 24) {
      toast.error(t('auth.usernameLength'));
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      toast.error(t('auth.invalidUsername'));
      return;
    }
    if (password.length < 8) {
      toast.error(t('auth.passwordTooShort'));
      return;
    }
    if (!/^[A-Z]{2}$/.test(nationality)) {
      toast.error(t('auth.invalidNationality'));
      return;
    }
    setLoading(true);
    try {
      await register({
        name: trimmedName,
        email: trimmedEmail.toLowerCase(),
        password,
        username: trimmedUsername,
        nationality,
      });
      router.replace('/(auth)/profile-setup');
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : t('auth.registerFailed');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + spacing['12'] }]}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color={colors.cream} />
        </Pressable>

        <Text variant="display" color={colors.cream} style={{ marginTop: spacing['8'] }}>
          {t('auth.register')}
        </Text>
        <Text variant="body" color={colors.stone400} style={{ marginTop: spacing['3'] }}>
          {t('auth.registerSubtitle')}
        </Text>

        <View style={{ gap: spacing['4'], marginTop: spacing['8'] }}>
          <Input label={t('auth.name')} value={name} onChangeText={setName} autoCapitalize="words" />
          <Input
            label={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input
            label={t('auth.username')}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            maxLength={24}
            helperText={t('auth.usernameHint')}
          />
          <Input
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            secure
            helperText={t('auth.passwordHint')}
          />
          <Input
            label={t('auth.nationality')}
            value={nationality}
            onChangeText={(v) => setNationality(v.toUpperCase().slice(0, 2))}
            autoCapitalize="characters"
            helperText={t('auth.nationalityHint')}
          />
        </View>

        <Button
          label={t('common.continue')}
          onPress={handleSubmit}
          loading={loading}
          fullWidth
          style={{ marginTop: spacing['8'] }}
        />

        <View style={styles.bottom}>
          <Text variant="small" color={colors.stone400}>{t('auth.haveAccount')} </Text>
          <Pressable onPress={() => router.replace('/(auth)/login')}>
            <Text variant="bodyMedium" color={colors.amber400}>{t('auth.login')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing['5'],
    paddingBottom: spacing['10'],
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing['8'],
  },
});
