import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '@components/Header';
import { Button } from '@components/Button';
import { Input } from '@components/Input';
import { Text } from '@design/text';
import { colors, radius, spacing } from '@design/tokens';
import { api, ApiError } from '@lib/api';
import { uploadImages } from '@lib/uploads';
import { toast } from '@stores/toast';
import { t } from '@lib/i18n';

export default function NewPost() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();

  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [uploading, setUploading] = useState(false);

  const createPost = useMutation({
    mutationFn: async () => {
      setUploading(true);
      try {
        const remoteUrls = images.length > 0 ? await uploadImages(images, 'posts') : [];
        return api('/posts', {
          method: 'POST',
          body: {
            content,
            images: remoteUrls,
            locationName: location || undefined,
          },
        });
      } finally {
        setUploading(false);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] });
      toast.success(t('community.published'));
      router.back();
    },
    onError: (e) => {
      const msg = e instanceof ApiError ? e.message : t('community.publishFailed');
      toast.error(msg);
    },
  });

  const pickImages = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      toast.error(t('community.photoPermission'));
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5,
      quality: 0.7,
    });
    if (!res.canceled) {
      setImages(res.assets.slice(0, 5).map((a) => a.uri));
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: colors.ink }}>
      <Header
        onBack={() => router.back()}
        title={t('community.newPostTitle')}
        rightAction={
          <Pressable
            disabled={!content.trim() || createPost.isPending}
            onPress={() => createPost.mutate()}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('community.publish')}
          >
            <Text variant="bodyBold" color={!content.trim() ? colors.stone500 : colors.amber400}>
              {t('community.publish')}
            </Text>
          </Pressable>
        }
      />
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 56 + spacing['4'], paddingHorizontal: spacing['5'], paddingBottom: spacing['16'] }}
        keyboardShouldPersistTaps="handled"
      >
        <Input
          label={t('community.placeholder')}
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={6}
          maxLength={500}
        />
        <Text variant="caption" color={colors.stone500} style={{ alignSelf: 'flex-end', marginTop: 4 }}>
          {content.length} / 500
        </Text>

        <View style={{ marginTop: spacing['5'] }}>
          <Pressable
            onPress={pickImages}
            style={styles.imageBox}
            accessibilityRole="button"
            accessibilityLabel={t('community.addPhotos')}
          >
            <Ionicons name="image-outline" size={28} color={colors.amber400} />
            <Text variant="bodyMedium" color={colors.cream} style={{ marginTop: 6 }}>
              {t('community.addPhotos')}
            </Text>
            <Text variant="caption" color={colors.stone400}>
              {t('community.addPhotosHint')}
            </Text>
          </Pressable>
          {images.length > 0 ? (
            <ScrollView horizontal style={{ marginTop: spacing['3'] }} contentContainerStyle={{ gap: spacing['3'] }}>
              {images.map((uri) => (
                <Image key={uri} source={{ uri }} style={styles.thumb} contentFit="cover" />
              ))}
            </ScrollView>
          ) : null}
        </View>

        <Input
          label={t('community.location')}
          value={location}
          onChangeText={setLocation}
          containerStyle={{ marginTop: spacing['5'] }}
        />

        <Button
          label={uploading ? t('community.publishing') : t('community.publish')}
          fullWidth
          loading={createPost.isPending}
          disabled={!content.trim() || createPost.isPending}
          style={{ marginTop: spacing['8'] }}
          onPress={() => createPost.mutate()}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  imageBox: {
    height: 110,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.stone700,
    borderStyle: 'dashed',
    backgroundColor: colors.stone900,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumb: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
  },
});
