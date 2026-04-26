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
import { useGoogleAuth } from '@hooks/useGoogleAuth';

export default function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const signIn = useAuth((s) => s.signIn);
  const google = useGoogleAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.includes('@') || password.length < 1) {
      toast.error('Introduce email y contraseña.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
      router.replace('/(tabs)/explore');
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No pudimos iniciar sesión.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + spacing['12'] }]}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color={colors.cream} />
        </Pressable>

        <Text variant="display" color={colors.cream} style={{ marginTop: spacing['8'] }}>
          Bienvenido{'\n'}de vuelta
        </Text>
        <Text variant="body" color={colors.stone400} style={{ marginTop: spacing['3'] }}>
          Inicia sesión para continuar tu Camino.
        </Text>

        <View style={{ gap: spacing['4'], marginTop: spacing['10'] }}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <Input
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            secure
            autoComplete="password"
          />
        </View>

        <Pressable onPress={() => router.push('/(auth)/forgot-password')} style={{ marginTop: spacing['4'] }}>
          <Text variant="small" color={colors.amber400}>
            ¿Olvidaste tu contraseña?
          </Text>
        </Pressable>

        <Button
          label="Iniciar sesión"
          onPress={handleSubmit}
          loading={loading}
          fullWidth
          style={{ marginTop: spacing['8'] }}
        />

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text variant="small" color={colors.stone500}>o continúa con</Text>
          <View style={styles.dividerLine} />
        </View>

        <Button
          label="Continuar con Google"
          variant="secondary"
          fullWidth
          disabled={!google.ready}
          iconLeft={<Ionicons name="logo-google" size={18} color={colors.cream} />}
          onPress={() => google.promptAsync()}
        />
        <Button
          label="Continuar con Apple"
          variant="secondary"
          fullWidth
          style={{ marginTop: spacing['3'] }}
          iconLeft={<Ionicons name="logo-apple" size={18} color={colors.cream} />}
          onPress={() => toast.info('Apple Sign In pendiente de configuración.')}
        />

        <View style={styles.bottom}>
          <Text variant="small" color={colors.stone400}>¿Aún no tienes cuenta? </Text>
          <Pressable onPress={() => router.replace('/(auth)/register')}>
            <Text variant="bodyMedium" color={colors.amber400}>Crear cuenta</Text>
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
    height: 1,
    backgroundColor: colors.stone800,
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing['8'],
  },
});
