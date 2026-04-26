import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@components/Button';
import { Input } from '@components/Input';
import { Avatar } from '@components/Avatar';
import { Card } from '@components/Card';
import { Text } from '@design/text';
import { colors, radius, spacing } from '@design/tokens';
import { useAuth } from '@stores/auth';
import { toast } from '@stores/toast';
import { api } from '@lib/api';

export default function ProfileSetup() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [routeSlug, setRouteSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('Permiso requerido', 'Activa el acceso a fotos.');
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!res.canceled && res.assets[0]) {
      setAvatar(res.assets[0].uri);
      // TODO: upload to Cloudinary and PATCH /users/me with the secure URL.
    }
  };

  const finish = async () => {
    if (!routeSlug) {
      toast.error('Elige una ruta para empezar.');
      return;
    }
    setLoading(true);
    try {
      if (bio) await api('/users/me', { method: 'PATCH', body: { bio } });
      await api('/pilgrimages', {
        method: 'POST',
        body: { routeSlug, startDate: new Date().toISOString() },
      });
      if (user) setUser({ ...user, avatar });
      router.replace('/(tabs)/explore');
    } catch (e) {
      toast.error('No pudimos crear tu peregrinación.');
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
        <View style={styles.steps}>
          {[1, 2, 3].map((n) => (
            <View
              key={n}
              style={[
                styles.step,
                {
                  backgroundColor: n <= step ? colors.amber400 : colors.stone800,
                  flex: n === step ? 2 : 1,
                },
              ]}
            />
          ))}
        </View>

        {step === 1 ? (
          <View style={{ marginTop: spacing['8'], alignItems: 'center' }}>
            <Text variant="display" color={colors.cream} align="center">
              Tu foto
            </Text>
            <Text variant="body" color={colors.stone400} align="center" style={{ marginTop: spacing['3'] }}>
              Una imagen vale más que mil pasos.
            </Text>
            <Pressable onPress={pickImage} style={{ marginTop: spacing['10'] }}>
              <Avatar source={avatar} name={user?.name} size="xl" />
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={16} color={colors.stone950} />
              </View>
            </Pressable>
            <Button
              label="Continuar"
              onPress={() => setStep(2)}
              fullWidth
              style={{ marginTop: spacing['12'] }}
            />
            <Button label="Saltar" variant="ghost" onPress={() => setStep(2)} fullWidth />
          </View>
        ) : null}

        {step === 2 ? (
          <View style={{ marginTop: spacing['8'] }}>
            <Text variant="display" color={colors.cream}>Cuéntanos algo</Text>
            <Text variant="body" color={colors.stone400} style={{ marginTop: spacing['3'] }}>
              Una frase para presentarte ante la comunidad.
            </Text>
            <Input
              label="Bio"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              maxLength={280}
              containerStyle={{ marginTop: spacing['8'] }}
            />
            <Button label="Continuar" onPress={() => setStep(3)} fullWidth style={{ marginTop: spacing['8'] }} />
          </View>
        ) : null}

        {step === 3 ? (
          <View style={{ marginTop: spacing['8'] }}>
            <Text variant="display" color={colors.cream}>Tu ruta</Text>
            <Text variant="body" color={colors.stone400} style={{ marginTop: spacing['3'] }}>
              ¿Qué Camino vas a empezar?
            </Text>
            <View style={{ gap: spacing['3'], marginTop: spacing['8'] }}>
              {[
                { slug: 'camino-frances', name: 'Camino Francés', km: '779 km · 33 etapas' },
                { slug: 'camino-portugues', name: 'Camino Portugués', km: '240 km · 14 etapas' },
                { slug: 'camino-del-norte', name: 'Camino del Norte', km: '825 km · 33 etapas' },
              ].map((r) => (
                <Pressable key={r.slug} onPress={() => setRouteSlug(r.slug)}>
                  <Card
                    elevation={routeSlug === r.slug ? 'floating' : 'flat'}
                    style={{
                      borderColor: routeSlug === r.slug ? colors.amber400 : colors.stone700,
                      borderWidth: 1,
                    }}
                  >
                    <Text variant="bodyBold" color={colors.cream}>{r.name}</Text>
                    <Text variant="small" color={colors.stone400} style={{ marginTop: 2 }}>
                      {r.km}
                    </Text>
                  </Card>
                </Pressable>
              ))}
            </View>
            <Button
              label="Empezar mi Camino"
              onPress={finish}
              loading={loading}
              fullWidth
              style={{ marginTop: spacing['8'] }}
            />
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing['5'],
    paddingBottom: spacing['10'],
  },
  steps: {
    flexDirection: 'row',
    gap: spacing['1'],
    marginTop: spacing['4'],
  },
  step: {
    height: 4,
    borderRadius: radius.full,
  },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.amber400,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.stone950,
  },
});
