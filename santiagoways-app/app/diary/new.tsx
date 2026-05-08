import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '@components/Header';
import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { Card } from '@components/Card';
import { Text } from '@design/text';
import { colors, radius, spacing } from '@design/tokens';
import { useCreateDiaryEntry } from '@hooks/useDiary';
import { uploadImage } from '@lib/uploads';
import { toast } from '@stores/toast';
import { Analytics } from '@lib/analytics';
import { t } from '@lib/i18n';

const MOODS = [
  { key: 'happy', icon: '😊', label: 'moodHappy' },
  { key: 'tired', icon: '😴', label: 'moodTired' },
  { key: 'inspired', icon: '✨', label: 'moodInspired' },
  { key: 'grateful', icon: '🙏', label: 'moodGrateful' },
  { key: 'challenged', icon: '🔥', label: 'moodChallenged' },
] as const;

type Mood = (typeof MOODS)[number]['key'];

export default function NewDiaryEntry() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ stageId?: string; pilgrimageId?: string }>();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [mood, setMood] = useState<Mood | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const createMut = useCreateDiaryEntry();

  const pickImages = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      toast.error(t('community.photoPermission'));
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 10 - images.length,
      quality: 0.8,
    });
    if (res.canceled || !res.assets) return;
    setImages((prev) => [...prev, ...res.assets.map((a) => a.uri)].slice(0, 10));
  };

  const save = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Faltan título o contenido.');
      return;
    }
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const uri of images) {
        if (uri.startsWith('http')) {
          uploaded.push(uri);
        } else {
          try {
            uploaded.push(await uploadImage(uri, 'diary'));
          } catch {
            // skip failed upload — keep going
          }
        }
      }
      await createMut.mutateAsync({
        title: title.trim(),
        body: body.trim(),
        images: uploaded,
        mood: mood ?? undefined,
        stageId: params.stageId,
        pilgrimageId: params.pilgrimageId,
      });
      Analytics.diaryEntryCreated(params.stageId);
      toast.success(t('diary.saved'));
      router.back();
    } catch {
      toast.error('No pudimos guardar la entrada.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: colors.stone950 }}>
        <Header title={t('diary.newEntry')} onBack={() => router.back()} />
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + 72,
            paddingHorizontal: spacing['5'],
            paddingBottom: insets.bottom + 32,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Input
            label={t('diary.titleField')}
            value={title}
            onChangeText={setTitle}
            maxLength={120}
          />
          <Input
            label={t('diary.bodyField')}
            value={body}
            onChangeText={setBody}
            multiline
            numberOfLines={6}
            maxLength={8000}
            containerStyle={{ marginTop: spacing['4'] }}
          />

          <Text variant="caption" color={colors.stone400} style={{ marginTop: spacing['6'] }}>
            {t('diary.mood')}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing['3'] }}>
            <View style={{ flexDirection: 'row', gap: spacing['2'] }}>
              {MOODS.map((m) => (
                <Pressable
                  key={m.key}
                  onPress={() => setMood((prev) => (prev === m.key ? null : m.key))}
                  style={[
                    styles.mood,
                    {
                      backgroundColor: mood === m.key ? colors.amber400 : colors.stone900,
                      borderColor: mood === m.key ? colors.amber400 : colors.stone700,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 18 }}>{m.icon}</Text>
                  <Text variant="caption" color={mood === m.key ? colors.stone950 : colors.cream}>
                    {t(`diary.${m.label}`)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <Card padding="3" style={{ marginTop: spacing['6'] }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="bodyBold" color={colors.cream}>
                Fotos ({images.length}/10)
              </Text>
              <Pressable onPress={pickImages} disabled={images.length >= 10}>
                <Ionicons name="add-circle-outline" size={24} color={colors.amber400} />
              </Pressable>
            </View>
            {images.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: spacing['3'] }}
              >
                <View style={{ flexDirection: 'row', gap: spacing['2'] }}>
                  {images.map((uri, i) => (
                    <View key={uri + i} style={styles.thumbWrap}>
                      <Image source={{ uri }} style={styles.thumb} contentFit="cover" />
                      <Pressable
                        onPress={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                        style={styles.thumbClose}
                      >
                        <Ionicons name="close" size={14} color={colors.cream} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              </ScrollView>
            ) : null}
          </Card>

          <Button
            label={t('common.save')}
            onPress={save}
            loading={uploading || createMut.isPending}
            fullWidth
            style={{ marginTop: spacing['8'] }}
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mood: {
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['2'],
    borderRadius: radius.full,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  thumbWrap: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  thumbClose: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
