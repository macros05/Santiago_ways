import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
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
import { uploadImage } from '@lib/uploads';
import { t } from '@lib/i18n';
import { isLockedRoute, useRoutes } from '@hooks/usePilgrimage';
import { Skeleton } from '@components/Skeleton';

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
  const routesQ = useRoutes();

  const mounted = useRef(true);
  useEffect(() => () => { mounted.current = false; }, []);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      toast.error(t('profileSetup.photoPermission'));
      return;
    }
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
      toast.error(t('profileSetup.chooseRoute'));
      return;
    }
    setLoading(true);
    try {
      let remoteAvatar: string | null = null;
      if (avatar && avatar.startsWith('file:')) {
        try {
          remoteAvatar = await uploadImage(avatar, 'avatars');
        } catch {
          if (mounted.current) toast.error(t('profileSetup.uploadFailed'));
        }
      } else if (avatar) {
        remoteAvatar = avatar;
      }

      const patch: Record<string, string> = {};
      if (bio) patch.bio = bio;
      if (remoteAvatar) patch.avatar = remoteAvatar;
      if (Object.keys(patch).length > 0) {
        await api('/users/me', { method: 'PATCH', body: patch });
      }

      await api('/pilgrimages', {
        method: 'POST',
        body: { routeSlug, startDate: new Date().toISOString() },
      });
      if (!mounted.current) return;
      if (user) setUser({ ...user, avatar: remoteAvatar ?? user.avatar });
      router.replace('/(tabs)/explore');
    } catch {
      if (mounted.current) toast.error(t('profileSetup.pilgrimageFailed'));
    } finally {
      if (mounted.current) setLoading(false);
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
              {t('profileSetup.photoTitle')}
            </Text>
            <Text variant="body" color={colors.stone400} align="center" style={{ marginTop: spacing['3'] }}>
              {t('profileSetup.photoSubtitle')}
            </Text>
            <Pressable onPress={pickImage} style={{ marginTop: spacing['10'] }}>
              <Avatar source={avatar} name={user?.name} size="xl" />
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={16} color={colors.stone950} />
              </View>
            </Pressable>
            <Button
              label={t('common.continue')}
              onPress={() => setStep(2)}
              fullWidth
              style={{ marginTop: spacing['12'] }}
            />
            <Button label={t('profileSetup.skip')} variant="ghost" onPress={() => setStep(2)} fullWidth />
          </View>
        ) : null}

        {step === 2 ? (
          <View style={{ marginTop: spacing['8'] }}>
            <Text variant="display" color={colors.cream}>{t('profileSetup.bioTitle')}</Text>
            <Text variant="body" color={colors.stone400} style={{ marginTop: spacing['3'] }}>
              {t('profileSetup.bioSubtitle')}
            </Text>
            <Input
              label={t('profileSetup.bioPlaceholder')}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              maxLength={280}
              containerStyle={{ marginTop: spacing['8'] }}
            />
            <Button label={t('common.continue')} onPress={() => setStep(3)} fullWidth style={{ marginTop: spacing['8'] }} />
          </View>
        ) : null}

        {step === 3 ? (
          <View style={{ marginTop: spacing['8'] }}>
            <Text variant="display" color={colors.cream}>{t('profileSetup.routeTitle')}</Text>
            <Text variant="body" color={colors.stone400} style={{ marginTop: spacing['3'] }}>
              {t('profileSetup.routeSubtitle')}
            </Text>
            <View style={{ gap: spacing['3'], marginTop: spacing['8'] }}>
              {routesQ.isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} height={70} borderRadius={radius.lg} />
                  ))
                : (routesQ.data ?? []).map((r) => {
                    const locked = isLockedRoute(r);
                    const totalKm = locked ? r.preview.totalKm : r.totalKm;
                    const startCity = locked ? r.preview.startCity : r.startCity;
                    const stagesCount = locked ? null : r._count?.stages;
                    const selectable = !locked;
                    return (
                      <Pressable
                        key={r.slug}
                        onPress={() => (selectable ? setRouteSlug(r.slug) : router.push('/plans'))}
                      >
                        <Card
                          elevation={routeSlug === r.slug ? 'floating' : 'flat'}
                          style={{
                            borderColor: routeSlug === r.slug ? colors.amber400 : colors.stone700,
                            borderWidth: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: spacing['3'],
                            opacity: locked ? 0.7 : 1,
                          }}
                        >
                          <View
                            style={{
                              width: 8,
                              height: 44,
                              borderRadius: 4,
                              backgroundColor: r.color,
                            }}
                          />
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['2'] }}>
                              <Text variant="bodyBold" color={colors.cream}>{r.name}</Text>
                              {locked ? (
                                <Ionicons name="lock-closed" size={12} color={colors.amber400} />
                              ) : null}
                            </View>
                            <Text variant="small" color={colors.stone400} style={{ marginTop: 2 }}>
                              {totalKm.toFixed(0)} km
                              {stagesCount !== null ? ` · ${stagesCount} etapas` : ''}
                              {' · '}{startCity}
                            </Text>
                            {locked ? (
                              <Text variant="caption" color={colors.amber400} style={{ marginTop: 2 }}>
                                {t('profileSetup.requiresBuenCamino')}
                              </Text>
                            ) : null}
                          </View>
                          {routeSlug === r.slug && selectable ? (
                            <View
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: 11,
                                backgroundColor: colors.amber400,
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Ionicons name="checkmark" size={14} color={colors.stone950} />
                            </View>
                          ) : null}
                        </Card>
                      </Pressable>
                    );
                  })}
            </View>
            <Button
              label={t('profileSetup.startCamino')}
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
