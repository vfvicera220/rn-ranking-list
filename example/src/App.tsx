import { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { RankingList } from 'rn-ranking-list';

type Player = {
  id: string;
  name: string;
  score: number;
};

// ---------------------------------------------------------------------------
// Large-list helpers
// ---------------------------------------------------------------------------

function generatePlayers(count: number): Player[] {
  const NAMES = [
    'Alex',
    'Sam',
    'Jamie',
    'Taylor',
    'Morgan',
    'Jordan',
    'Casey',
    'Riley',
    'Avery',
    'Quinn',
    'Logan',
    'Cameron',
    'Drew',
    'Skyler',
    'Harper',
    'Parker',
    'Rowan',
    'Phoenix',
    'Sawyer',
    'Kendall',
  ];
  return Array.from({ length: count }, (_, i) => ({
    id: `p-${i + 1}`,
    name: `${NAMES[i % NAMES.length]}${Math.floor(i / NAMES.length) || ''}`,
    score: Math.max(100, 5000 - i * 9),
  }));
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

const LARGE_LIST_SIZE = 500;
const basePlayers = generatePlayers(LARGE_LIST_SIZE);

// ---------------------------------------------------------------------------
// Small-list demo data (original)
// ---------------------------------------------------------------------------

const newRankings: Player[] = [
  { id: 'u-1', name: 'Alex', score: 1480 },
  { id: 'u-2', name: 'Sam', score: 1420 },
  { id: 'u-3', name: 'Jamie', score: 1360 },
  { id: 'u-4', name: 'Taylor', score: 1280 },
  { id: 'u-5', name: 'Morgan', score: 1220 },
  { id: 'u-6', name: 'Jordan', score: 1180 },
  { id: 'u-7', name: 'Casey', score: 1150 },
  { id: 'u-8', name: 'Riley', score: 1120 },
  { id: 'u-9', name: 'Avery', score: 1090 },
  { id: 'u-10', name: 'Quinn', score: 1060 },
  { id: 'u-11', name: 'Logan', score: 1030 },
  { id: 'u-12', name: 'Cameron', score: 1000 },
  { id: 'u-13', name: 'Drew', score: 970 },
  { id: 'u-14', name: 'Skyler', score: 940 },
  { id: 'u-15', name: 'Harper', score: 910 },
  { id: 'u-16', name: 'Parker', score: 880 },
  { id: 'u-17', name: 'Rowan', score: 850 },
  { id: 'u-18', name: 'Phoenix', score: 820 },
  { id: 'u-19', name: 'Sawyer', score: 790 },
  { id: 'u-20', name: 'Kendall', score: 760 },
  { id: 'u-21', name: 'Taylor21', score: 1280 },
  { id: 'u-22', name: 'Jamie', score: 1360 },
  { id: 'u-23', name: 'Morgan', score: 1220 },
  { id: 'u-24', name: 'Jordan', score: 1180 },
  { id: 'u-25', name: 'Casey', score: 1150 },
  { id: 'u-26', name: 'Riley', score: 1120 },
  { id: 'u-27', name: 'Avery', score: 1090 },
];

const oldRankings: Player[] = [
  { id: 'u-1', name: 'Alex', score: 1480 },
  { id: 'u-2', name: 'Sam', score: 1420 },
  { id: 'u-3', name: 'Jamie', score: 1360 },
  { id: 'u-5', name: 'Morgan', score: 1220 },
  { id: 'u-6', name: 'Jordan', score: 1180 },
  { id: 'u-7', name: 'Casey', score: 1150 },
  { id: 'u-8', name: 'Riley', score: 1120 },
  { id: 'u-9', name: 'Avery', score: 1090 },
  { id: 'u-10', name: 'Quinn', score: 1060 },
  { id: 'u-11', name: 'Logan', score: 1030 },
  { id: 'u-12', name: 'Cameron', score: 1000 },
  { id: 'u-13', name: 'Drew', score: 970 },
  { id: 'u-14', name: 'Skyler', score: 940 },
  { id: 'u-15', name: 'Harper', score: 910 },
  { id: 'u-16', name: 'Parker', score: 880 },
  { id: 'u-17', name: 'Rowan', score: 850 },
  { id: 'u-18', name: 'Phoenix', score: 820 },
  { id: 'u-19', name: 'Sawyer', score: 790 },
  { id: 'u-20', name: 'Kendall', score: 760 },
  { id: 'u-21', name: 'Taylor21', score: 1280 },
  { id: 'u-22', name: 'Jamie', score: 1360 },
  { id: 'u-23', name: 'Morgan', score: 1220 },
  { id: 'u-24', name: 'Jordan', score: 1180 },
  { id: 'u-25', name: 'Casey', score: 1150 },
  { id: 'u-26', name: 'Riley', score: 1120 },
  { id: 'u-27', name: 'Avery', score: 1090 },
  { id: 'u-4', name: 'Taylor', score: 1280 },
];

// ---------------------------------------------------------------------------
// Shared row card
// ---------------------------------------------------------------------------

function RankRow({
  item,
  movement,
  oldPosition,
  newPosition,
}: {
  item: Player;
  movement: number;
  oldPosition: number;
  newPosition: number;
}) {
  return (
    <View style={styles.rowCard}>
      <View>
        <Text style={styles.rowName}>{item.name}</Text>
        <Text style={styles.rowMeta}>{`Score: ${item.score}`}</Text>
      </View>
      <View style={styles.rankMetaWrap}>
        <Text
          style={styles.rankText}
        >{`#${oldPosition} → #${newPosition}`}</Text>
        <Text
          style={[
            styles.delta,
            movement > 0 ? styles.up : movement < 0 ? styles.down : styles.same,
          ]}
        >
          {movement > 0 ? `+${movement}` : movement < 0 ? `${movement}` : '–'}
        </Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Screen types
// ---------------------------------------------------------------------------

type Screen = 'home' | 'large-list';

// ---------------------------------------------------------------------------
// Large list screen
// ---------------------------------------------------------------------------

function LargeListScreen({ onBack }: { onBack: () => void }) {
  const [rankingA] = useState(() => basePlayers);
  const [rankingB] = useState(() => shuffleArray(basePlayers));
  const [isStateB, setIsStateB] = useState(false);

  const oldRanking = isStateB ? rankingA : rankingB;
  const newRanking = isStateB ? rankingB : rankingA;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Large List ({LARGE_LIST_SIZE} items)</Text>
        <Text style={styles.subtitle}>
          Virtualization keeps only visible rows mounted at any time.
        </Text>

        <RankingList
          oldRanking={oldRanking}
          newRanking={newRanking}
          style={styles.list}
          rowHeight={64}
          getId={(item) => item.id}
          renderItem={(params) => <RankRow {...params} />}
        />

        <Pressable style={styles.button} onPress={() => setIsStateB((v) => !v)}>
          <Text style={styles.buttonText}>Shuffle Rankings</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Home screen
// ---------------------------------------------------------------------------

function HomeScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const [isStateB, setIsStateB] = useState(false);

  const oldRanking = isStateB ? oldRankings : newRankings;
  const newRanking = isStateB ? newRankings : oldRankings;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Live Ranking Prototype</Text>
        <Text style={styles.subtitle}>
          Tap the button to animate players between old and new positions.
        </Text>

        <RankingList
          scrollToId="u-4"
          oldRanking={oldRanking}
          newRanking={newRanking}
          style={styles.list}
          rowHeight={68}
          getId={(item) => item.id}
          renderItem={(params) => <RankRow {...params} />}
        />

        <Pressable style={styles.button} onPress={() => setIsStateB((v) => !v)}>
          <Text style={styles.buttonText}>Simulate Rank Update</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => onNavigate('large-list')}
        >
          <Text style={styles.buttonText}>Large List Demo →</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');

  if (screen === 'large-list') {
    return <LargeListScreen onBack={() => setScreen('home')} />;
  }

  return <HomeScreen onNavigate={setScreen} />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  list: {
    flex: 1,
    minHeight: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 20,
    color: '#4B5563',
    lineHeight: 20,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D0D7DE',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  rowName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  rowMeta: {
    marginTop: 2,
    fontSize: 12,
    color: '#6B7280',
  },
  rankMetaWrap: {
    alignItems: 'flex-end',
  },
  rankText: {
    fontSize: 12,
    color: '#4B5563',
  },
  delta: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '700',
  },
  up: {
    color: '#047857',
  },
  down: {
    color: '#B91C1C',
  },
  same: {
    color: '#6B7280',
  },
  button: {
    marginTop: 12,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    paddingVertical: 12,
  },
  buttonSecondary: {
    backgroundColor: '#1D4ED8',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  backButton: {
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 15,
    color: '#1D4ED8',
    fontWeight: '600',
  },
});
