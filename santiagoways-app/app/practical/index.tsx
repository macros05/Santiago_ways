import { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@components/Header';
import { Card } from '@components/Card';
import { Button } from '@components/Button';
import { Text } from '@design/text';
import { colors, radius, spacing } from '@design/tokens';
import { api } from '@lib/api';
import {
  PHRASE_CATEGORIES,
  PHRASE_LANG_LABEL,
  PACKING_CHECKLIST,
  recommendDailyKm,
  type PhraseLang,
  type FitnessLevel,
  type Experience,
} from '@lib/phrases';
import { t } from '@lib/i18n';
import { usePrefs } from '@stores/prefs';

type Tab = 'phrases' | 'emergencies' | 'packing' | 'prep';
const TABS: Tab[] = ['phrases', 'emergencies', 'packing', 'prep'];

export default function PracticalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('phrases');

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <Header title={t('practical.title')} onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 72,
          paddingBottom: insets.bottom + 32,
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing['5'], gap: spacing['2'] }}
        >
          {TABS.map((tk) => (
            <Pressable
              key={tk}
              onPress={() => setTab(tk)}
              style={[
                styles.tab,
                {
                  backgroundColor: tab === tk ? colors.amber400 : colors.stone900,
                  borderColor: tab === tk ? colors.amber400 : colors.stone700,
                },
              ]}
            >
              <Text variant="caption" color={tab === tk ? colors.stone950 : colors.cream}>
                {t(`practical.${tk}Title`)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={{ paddingHorizontal: spacing['5'], marginTop: spacing['6'] }}>
          {tab === 'phrases' ? <Phrases /> : null}
          {tab === 'emergencies' ? <Emergencies /> : null}
          {tab === 'packing' ? <Packing /> : null}
          {tab === 'prep' ? <Preparation /> : null}
        </View>
      </ScrollView>
    </View>
  );
}

function Phrases() {
  const userLocale = usePrefs((s) => s.locale);
  const [target, setTarget] = useState<PhraseLang>(userLocale === 'en' ? 'es' : 'en');
  const langs: PhraseLang[] = ['en', 'es', 'fr', 'de', 'pt', 'it'];

  return (
    <View style={{ gap: spacing['4'] }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: spacing['2'] }}>
          {langs.map((l) => (
            <Pressable
              key={l}
              onPress={() => setTarget(l)}
              style={[
                styles.tab,
                {
                  backgroundColor: target === l ? colors.amber400 : colors.stone900,
                  borderColor: target === l ? colors.amber400 : colors.stone700,
                },
              ]}
            >
              <Text variant="caption" color={target === l ? colors.stone950 : colors.cream}>
                {PHRASE_LANG_LABEL[l]}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {PHRASE_CATEGORIES.map((cat) => (
        <View key={cat.key} style={{ marginTop: spacing['4'] }}>
          <Text variant="bodyBold" color={colors.amber400}>
            {cat.title[userLocale === 'en' ? 'en' : 'es']}
          </Text>
          <View style={{ marginTop: spacing['2'], gap: spacing['2'] }}>
            {cat.phrases.map((p, i) => (
              <Card key={i} padding="3">
                <Text variant="body" color={colors.cream}>
                  {p[userLocale === 'en' ? 'en' : 'es']}
                </Text>
                <Text variant="caption" color={colors.stone400} style={{ marginTop: 2 }}>
                  → {p[target]}
                </Text>
              </Card>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

type Emergencies = {
  global: { emergency: string; police: string; civilGuard: string; medical: string };
  byRegion: Record<string, Record<string, string>>;
};

function Emergencies() {
  const q = useQuery({
    queryKey: ['practical', 'emergencies'],
    queryFn: () => api<Emergencies>('/practical/emergencies'),
    staleTime: 24 * 60 * 60_000,
  });
  const data = q.data;

  return (
    <View style={{ gap: spacing['4'] }}>
      <Card>
        <Text variant="bodyBold" color={colors.amber400}>
          {t('practical.generalEmergencies')}
        </Text>
        <View style={{ marginTop: spacing['3'], gap: spacing['2'] }}>
          {data ? (
            <>
              <PhoneRow label="Emergencias" number={data.global.emergency} />
              <PhoneRow label="Policía" number={data.global.police} />
              <PhoneRow label="Guardia Civil" number={data.global.civilGuard} />
              <PhoneRow label="Sanitario" number={data.global.medical} />
            </>
          ) : (
            <Text variant="caption" color={colors.stone400}>{t('common.loading')}</Text>
          )}
        </View>
      </Card>

      {data
        ? Object.entries(data.byRegion).map(([region, contacts]) => (
            <Card key={region}>
              <Text variant="bodyBold" color={colors.amber400}>
                {region.charAt(0).toUpperCase() + region.slice(1)}
              </Text>
              <View style={{ marginTop: spacing['3'], gap: spacing['2'] }}>
                {Object.entries(contacts).map(([k, v]) => (
                  <PhoneRow key={k} label={k} number={v} />
                ))}
              </View>
            </Card>
          ))
        : null}
    </View>
  );
}

function PhoneRow({ label, number }: { label: string; number: string }) {
  return (
    <Pressable
      onPress={() => Linking.openURL(`tel:${number.replace(/\s+/g, '')}`)}
      style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
    >
      <Text variant="body" color={colors.cream}>{label}</Text>
      <View style={{ flexDirection: 'row', gap: spacing['2'], alignItems: 'center' }}>
        <Text variant="bodyBold" color={colors.amber400}>{number}</Text>
        <Ionicons name="call" size={16} color={colors.amber400} />
      </View>
    </Pressable>
  );
}

const PACKING_KEY = 'sw_packing_v1';

function Packing() {
  const userLocale = usePrefs((s) => s.locale);
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    AsyncStorage.getItem(PACKING_KEY)
      .then((raw) => {
        if (raw) setDone(new Set(JSON.parse(raw) as string[]));
      })
      .catch(() => {});
  }, []);

  const toggle = (key: string) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      AsyncStorage.setItem(PACKING_KEY, JSON.stringify(Array.from(next))).catch(() => {});
      return next;
    });
  };

  const essentials = PACKING_CHECKLIST.filter((i) => i.essential);
  const optional = PACKING_CHECKLIST.filter((i) => !i.essential);
  const lang: 'es' | 'en' = userLocale === 'en' ? 'en' : 'es';

  return (
    <View style={{ gap: spacing['4'] }}>
      <Card>
        <Text variant="bodyBold" color={colors.amber400}>{t('practical.essentials')}</Text>
        <View style={{ marginTop: spacing['3'], gap: spacing['2'] }}>
          {essentials.map((it) => (
            <CheckRow key={it.key} label={it[lang]} done={done.has(it.key)} onToggle={() => toggle(it.key)} />
          ))}
        </View>
      </Card>
      <Card>
        <Text variant="bodyBold" color={colors.amber400}>{t('practical.optional')}</Text>
        <View style={{ marginTop: spacing['3'], gap: spacing['2'] }}>
          {optional.map((it) => (
            <CheckRow key={it.key} label={it[lang]} done={done.has(it.key)} onToggle={() => toggle(it.key)} />
          ))}
        </View>
      </Card>
    </View>
  );
}

function CheckRow({ label, done, onToggle }: { label: string; done: boolean; onToggle: () => void }) {
  return (
    <Pressable
      onPress={onToggle}
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['3'] }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          borderWidth: 2,
          borderColor: done ? colors.amber400 : colors.stone600,
          backgroundColor: done ? colors.amber400 : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {done ? <Ionicons name="checkmark" size={14} color={colors.stone950} /> : null}
      </View>
      <Text variant="body" color={done ? colors.stone400 : colors.cream} style={{ flex: 1 }}>
        {label}
      </Text>
    </Pressable>
  );
}

function Preparation() {
  const [fitness, setFitness] = useState<FitnessLevel>('intermediate');
  const [exp, setExp] = useState<Experience>('first');
  const rec = recommendDailyKm(fitness, exp);

  return (
    <View style={{ gap: spacing['5'] }}>
      <Card>
        <Text variant="bodyBold" color={colors.amber400}>
          {t('practical.fitnessQuestion')}
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing['2'], marginTop: spacing['3'] }}>
          {(['beginner', 'intermediate', 'advanced'] as FitnessLevel[]).map((l) => (
            <Pressable
              key={l}
              onPress={() => setFitness(l)}
              style={[
                styles.tab,
                {
                  flex: 1,
                  alignItems: 'center',
                  backgroundColor: fitness === l ? colors.amber400 : colors.stone900,
                  borderColor: fitness === l ? colors.amber400 : colors.stone700,
                },
              ]}
            >
              <Text variant="caption" color={fitness === l ? colors.stone950 : colors.cream}>
                {t(`practical.fitness${l.charAt(0).toUpperCase() + l.slice(1)}`)}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card>
        <Text variant="bodyBold" color={colors.amber400}>
          {t('practical.experienceQuestion')}
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing['2'], marginTop: spacing['3'] }}>
          {(['first', 'some', 'veteran'] as Experience[]).map((e) => (
            <Pressable
              key={e}
              onPress={() => setExp(e)}
              style={[
                styles.tab,
                {
                  flex: 1,
                  alignItems: 'center',
                  backgroundColor: exp === e ? colors.amber400 : colors.stone900,
                  borderColor: exp === e ? colors.amber400 : colors.stone700,
                },
              ]}
            >
              <Text variant="caption" color={exp === e ? colors.stone950 : colors.cream}>
                {t(`practical.exp${e.charAt(0).toUpperCase() + e.slice(1)}`)}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card>
        <Text variant="caption" color={colors.stone400}>{t('practical.recommendedDaily')}</Text>
        <Text variant="display" color={colors.cream} style={{ marginTop: 4 }}>
          {rec.min}–{rec.max} km/día
        </Text>
        <Text variant="small" color={colors.stone400} style={{ marginTop: spacing['2'] }}>
          Empieza por debajo del rango y sube según te sientas. Descansa al menos un día por semana.
        </Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  tab: {
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['2'],
    borderRadius: radius.full,
    borderWidth: 1,
  },
});
