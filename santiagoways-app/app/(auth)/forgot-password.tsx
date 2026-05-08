import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@components/Button';
import { Input } from '@components/Input';
import { Text } from '@design/text';
import { colors, spacing } from '@design/tokens';
import { toast } from '@stores/toast';
import { api } from '@lib/api';
import { t } from '@lib/i18n';

export default function ForgotPassword() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error(t('auth.invalidEmail'));
      return;
    }
    setSubmitting(true);
    try {
      await api('/auth/forgot-password', {
        method: 'POST',
        body: { email: trimmed },
        auth: false,
      });
      setSent(true);
    } catch {
      // The endpoint always returns 200 on a happy path — only network
      // failures or rate limits land here.
      toast.error(t('auth.resetFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <View style={[styles.container, { paddingTop: insets.top + spacing['12'] }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color={colors.cream} />
        </Pressable>

        {sent ? (
          <View style={{ marginTop: spacing['16'], alignItems: 'center' }}>
            <View style={styles.iconWrap}>
              <Ionicons name="mail" size={36} color={colors.amber400} />
            </View>
            <Text variant="display" color={colors.cream} align="center" style={{ marginTop: spacing['6'] }}>
              {t('auth.resetSent')}
            </Text>
            <Text
              variant="body"
              color={colors.stone400}
              align="center"
              style={{ marginTop: spacing['3'], paddingHorizontal: spacing['6'] }}
            >
              {t('auth.resetSentBody', { email })}
            </Text>
            <Button
              label={t('auth.backToLogin')}
              variant="secondary"
              onPress={() => router.replace('/(auth)/login')}
              fullWidth
              style={{ marginTop: spacing['10'] }}
            />
          </View>
        ) : (
          <>
            <Text variant="display" color={colors.cream} style={{ marginTop: spacing['8'] }}>
              {t('auth.forgotPasswordTitle')}
            </Text>
            <Text variant="body" color={colors.stone400} style={{ marginTop: spacing['3'] }}>
              {t('auth.forgotPasswordSubtitle')}
            </Text>
            <Input
              label={t('auth.email')}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              containerStyle={{ marginTop: spacing['8'] }}
            />
            <Button
              label={t('auth.sendResetLink')}
              onPress={handleSubmit}
              loading={submitting}
              disabled={submitting}
              fullWidth
              style={{ marginTop: spacing['6'] }}
            />
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing['5'],
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.amberTintSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
