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
    if (name.trim().length < 1 || !email.includes('@') || password.length < 8 || username.length < 3) {
      toast.error('Revisa los campos. La contraseña debe tener 8+ caracteres.');
      return;
    }
    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        username: username.trim(),
        nationality,
      });
      router.replace('/(auth)/profile-setup');
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Error en el registro.';
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
          Crear cuenta
        </Text>
        <Text variant="body" color={colors.stone400} style={{ marginTop: spacing['3'] }}>
          Únete a la comunidad de peregrinos.
        </Text>

        <View style={{ gap: spacing['4'], marginTop: spacing['8'] }}>
          <Input label="Nombre" value={name} onChangeText={setName} autoCapitalize="words" />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input
            label="Usuario"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            helperText="Letras, números y _ — entre 3 y 24 caracteres."
          />
          <Input label="Contraseña" value={password} onChangeText={setPassword} secure helperText="Mínimo 8 caracteres." />
          <Input
            label="Nacionalidad (ISO)"
            value={nationality}
            onChangeText={(v) => setNationality(v.toUpperCase().slice(0, 2))}
            autoCapitalize="characters"
            helperText="Ej. ES, FR, DE, JP"
          />
        </View>

        <Button
          label="Continuar"
          onPress={handleSubmit}
          loading={loading}
          fullWidth
          style={{ marginTop: spacing['8'] }}
        />

        <View style={styles.bottom}>
          <Text variant="small" color={colors.stone400}>¿Ya tienes cuenta? </Text>
          <Pressable onPress={() => router.replace('/(auth)/login')}>
            <Text variant="bodyMedium" color={colors.amber400}>Inicia sesión</Text>
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
