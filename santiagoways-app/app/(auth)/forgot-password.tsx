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

export default function ForgotPassword() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.includes('@')) {
      toast.error('Introduce un email válido.');
      return;
    }
    // TODO: wire backend forgot-password endpoint when emails are configured.
    setSent(true);
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
              Revisa tu email
            </Text>
            <Text
              variant="body"
              color={colors.stone400}
              align="center"
              style={{ marginTop: spacing['3'], paddingHorizontal: spacing['6'] }}
            >
              Te hemos enviado instrucciones para restablecer tu contraseña a {email}.
            </Text>
            <Button
              label="Volver al inicio"
              variant="secondary"
              onPress={() => router.replace('/(auth)/login')}
              fullWidth
              style={{ marginTop: spacing['10'] }}
            />
          </View>
        ) : (
          <>
            <Text variant="display" color={colors.cream} style={{ marginTop: spacing['8'] }}>
              Recuperar{'\n'}contraseña
            </Text>
            <Text variant="body" color={colors.stone400} style={{ marginTop: spacing['3'] }}>
              Te enviaremos un enlace para restablecerla.
            </Text>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              containerStyle={{ marginTop: spacing['8'] }}
            />
            <Button label="Enviar enlace" onPress={handleSubmit} fullWidth style={{ marginTop: spacing['6'] }} />
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
    backgroundColor: 'rgba(251,191,36,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
