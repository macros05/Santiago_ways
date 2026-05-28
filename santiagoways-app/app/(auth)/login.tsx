import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@components/Button';
import { Input } from '@components/Input';
import { AuroraBackground } from '@components/AuroraBackground';
import { Text } from '@design/text';
import { colors, spacing } from '@design/tokens';
import { useAuth } from '@stores/auth';
import { toast } from '@stores/toast';
import { ApiError } from '@lib/api';
import { useGoogleAuth } from '@hooks/useGoogleAuth';
import { useAppleAuth } from '@hooks/useAppleAuth';
import { t } from '@lib/i18n';

export default function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const signIn = useAuth((s) => s.signIn);
  const google = useGoogleAuth();
  const apple = useAppleAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail) || password.length < 8) {
      toast.error(t('auth.invalidLogin'));
      return;
    }
    setLoading(true);
    try {
      await signIn(trimmedEmail.toLowerCase(), password);
      router.replace('/(tabs)/explore');
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : t('auth.loginFailed');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.ink }}
    >
      <AuroraBackground bloom={0.72} />
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + spacing['12'] }]}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color={colors.cream} />
        </Pressable>

        <Text variant="display" color={colors.cream} style={{ marginTop: spacing['8'] }}>
          {t('auth.welcomeBack')}
        </Text>
        <Text variant="body" color={colors.stone400} style={{ marginTop: spacing['3'] }}>
          {t('auth.loginSubtitle')}
        </Text>

        <View style={{ gap: spacing['4'], marginTop: spacing['10'] }}>
          <Input
            label={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <Input
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            secure
            autoComplete="password"
          />
        </View>

        <Pressable onPress={() => router.push('/(auth)/forgot-password')} style={{ marginTop: spacing['4'] }}>
          <Text variant="small" color={colors.amber400}>
            {t('auth.forgotPassword')}
          </Text>
        </Pressable>

        <Button
          label={t('auth.login')}
          onPress={handleSubmit}
          loading={loading}
          fullWidth
          style={{ marginTop: spacing['8'] }}
        />

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text variant="small" color={colors.stone500}>{t('auth.orContinueWith')}</Text>
          <View style={styles.dividerLine} />
        </View>

        <Button
          label={t('auth.signInGoogle')}
          variant="secondary"
          fullWidth
          disabled={!google.ready}
          iconLeft={<Ionicons name="logo-google" size={18} color={colors.cream} />}
          onPress={() => google.promptAsync()}
        />
        {apple.available ? (
          <Button
            label={t('auth.signInApple')}
            variant="secondary"
            fullWidth
            disabled={apple.busy}
            loading={apple.busy}
            style={{ marginTop: spacing['3'] }}
            iconLeft={<Ionicons name="logo-apple" size={18} color={colors.cream} />}
            onPress={() => apple.signIn()}
          />
        ) : null}

        <View style={styles.bottom}>
          <Text variant="small" color={colors.stone400}>{t('auth.noAccount')} </Text>
          <Pressable onPress={() => router.replace('/(auth)/register')}>
            <Text variant="bodyMedium" color={colors.amber400}>{t('auth.register')}</Text>
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
    gap: 0,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    marginVertical: spacing['6'],
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.glassBorder,
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing['8'],
  },
});
