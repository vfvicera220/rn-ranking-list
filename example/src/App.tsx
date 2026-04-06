import { memo, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { RankingList } from 'rn-ranking-list';

type Player = {
  id: string;
  name: string;
  score: number;
};

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const newRankings: Player[] = [
  { id: 'u-1', name: 'Alex', score: 1480 },
  { id: 'u-2', name: 'Sam', score: 1420 },
  { id: 'u-3', name: 'Jamie', score: 1360 },
  { id: 'u-4', name: 'You', score: 1280 },
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
  { id: 'u-28', name: 'Blake', score: 745 },
  { id: 'u-29', name: 'Dakota', score: 730 },
  { id: 'u-30', name: 'Elliott', score: 715 },
  { id: 'u-31', name: 'Finley', score: 700 },
  { id: 'u-32', name: 'Gray', score: 685 },
  { id: 'u-33', name: 'Haven', score: 670 },
  { id: 'u-34', name: 'Indigo', score: 655 },
  { id: 'u-35', name: 'Journey', score: 640 },
  { id: 'u-36', name: 'Kaden', score: 625 },
  { id: 'u-37', name: 'Lake', score: 610 },
  { id: 'u-38', name: 'Morgan', score: 595 },
  { id: 'u-39', name: 'Nevada', score: 580 },
  { id: 'u-40', name: 'Ocean', score: 565 },
  { id: 'u-41', name: 'Paris', score: 550 },
  { id: 'u-42', name: 'Quinn', score: 535 },
  { id: 'u-43', name: 'River', score: 520 },
  { id: 'u-44', name: 'Sky', score: 505 },
  { id: 'u-45', name: 'Taylor', score: 490 },
  { id: 'u-46', name: 'Utopia', score: 475 },
  { id: 'u-47', name: 'Vale', score: 460 },
  { id: 'u-48', name: 'Waylon', score: 445 },
  { id: 'u-49', name: 'Xander', score: 430 },
  { id: 'u-50', name: 'Yara', score: 415 },
  { id: 'u-51', name: 'Zephyr', score: 400 },
  { id: 'u-52', name: 'Adrian', score: 385 },
  { id: 'u-53', name: 'Bailey', score: 370 },
  { id: 'u-54', name: 'Casey', score: 355 },
  { id: 'u-55', name: 'Dominic', score: 340 },
  { id: 'u-56', name: 'Eden', score: 325 },
  { id: 'u-57', name: 'Flynn', score: 310 },
  { id: 'u-58', name: 'Gemini', score: 295 },
  { id: 'u-59', name: 'Holland', score: 280 },
  { id: 'u-60', name: 'Iris', score: 265 },
  { id: 'u-61', name: 'Jason', score: 250 },
  { id: 'u-62', name: 'Kelsey', score: 235 },
  { id: 'u-63', name: 'London', score: 220 },
  { id: 'u-64', name: 'Mason', score: 205 },
  { id: 'u-65', name: 'Noel', score: 190 },
  { id: 'u-66', name: 'Oakley', score: 175 },
  { id: 'u-67', name: 'Pierce', score: 160 },
  { id: 'u-68', name: 'Quinn', score: 145 },
  { id: 'u-69', name: 'Riley', score: 130 },
  { id: 'u-70', name: 'Scout', score: 115 },
  { id: 'u-71', name: 'Tatum', score: 100 },
  { id: 'u-72', name: 'Unity', score: 85 },
  { id: 'u-73', name: 'Victor', score: 70 },
  { id: 'u-74', name: 'Wesley', score: 55 },
  { id: 'u-75', name: 'Ximena', score: 40 },
  { id: 'u-76', name: 'Yuki', score: 25 },
  { id: 'u-77', name: 'Ziggy', score: 10 },
  { id: 'u-78', name: 'Alder', score: 750 },
  { id: 'u-79', name: 'Blaise', score: 735 },
  { id: 'u-80', name: 'Cedar', score: 720 },
  { id: 'u-81', name: 'Divine', score: 705 },
  { id: 'u-82', name: 'Elan', score: 690 },
  { id: 'u-83', name: 'Farren', score: 675 },
  { id: 'u-84', name: 'Glenn', score: 660 },
  { id: 'u-85', name: 'Harmony', score: 645 },
  { id: 'u-86', name: 'Isaiah', score: 630 },
  { id: 'u-87', name: 'Justice', score: 615 },
  { id: 'u-88', name: 'Karma', score: 600 },
  { id: 'u-89', name: 'Lennox', score: 585 },
  { id: 'u-90', name: 'Marlow', score: 570 },
  { id: 'u-91', name: 'Novak', score: 555 },
  { id: 'u-92', name: 'Ozzy', score: 540 },
  { id: 'u-93', name: 'Piper', score: 525 },
  { id: 'u-94', name: 'Raven', score: 510 },
  { id: 'u-95', name: 'Storm', score: 495 },
  { id: 'u-96', name: 'Trent', score: 480 },
  { id: 'u-97', name: 'Urban', score: 465 },
  { id: 'u-98', name: 'Valor', score: 450 },
  { id: 'u-99', name: 'Winter', score: 435 },
  { id: 'u-100', name: 'Zane', score: 420 },
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
  { id: 'u-28', name: 'Blake', score: 745 },
  { id: 'u-29', name: 'Dakota', score: 730 },
  { id: 'u-30', name: 'Elliott', score: 715 },
  { id: 'u-31', name: 'Finley', score: 700 },
  { id: 'u-32', name: 'Gray', score: 685 },
  { id: 'u-33', name: 'Haven', score: 670 },
  { id: 'u-34', name: 'Indigo', score: 655 },
  { id: 'u-35', name: 'Journey', score: 640 },
  { id: 'u-36', name: 'Kaden', score: 625 },
  { id: 'u-37', name: 'Lake', score: 610 },
  { id: 'u-38', name: 'Morgan', score: 595 },
  { id: 'u-39', name: 'Nevada', score: 580 },
  { id: 'u-40', name: 'Ocean', score: 565 },
  { id: 'u-41', name: 'Paris', score: 550 },
  { id: 'u-42', name: 'Quinn', score: 535 },
  { id: 'u-43', name: 'River', score: 520 },
  { id: 'u-44', name: 'Sky', score: 505 },
  { id: 'u-45', name: 'Taylor', score: 490 },
  { id: 'u-46', name: 'Utopia', score: 475 },
  { id: 'u-47', name: 'Vale', score: 460 },
  { id: 'u-48', name: 'Waylon', score: 445 },
  { id: 'u-49', name: 'Xander', score: 430 },
  { id: 'u-50', name: 'Yara', score: 415 },
  { id: 'u-51', name: 'Zephyr', score: 400 },
  { id: 'u-52', name: 'Adrian', score: 385 },
  { id: 'u-53', name: 'Bailey', score: 370 },
  { id: 'u-54', name: 'Casey', score: 355 },
  { id: 'u-55', name: 'Dominic', score: 340 },
  { id: 'u-56', name: 'Eden', score: 325 },
  { id: 'u-57', name: 'Flynn', score: 310 },
  { id: 'u-58', name: 'Gemini', score: 295 },
  { id: 'u-59', name: 'Holland', score: 280 },
  { id: 'u-60', name: 'Iris', score: 265 },
  { id: 'u-61', name: 'Jason', score: 250 },
  { id: 'u-62', name: 'Kelsey', score: 235 },
  { id: 'u-63', name: 'London', score: 220 },
  { id: 'u-64', name: 'Mason', score: 205 },
  { id: 'u-65', name: 'Noel', score: 190 },
  { id: 'u-66', name: 'Oakley', score: 175 },
  { id: 'u-67', name: 'Pierce', score: 160 },
  { id: 'u-68', name: 'Quinn', score: 145 },
  { id: 'u-69', name: 'Riley', score: 130 },
  { id: 'u-70', name: 'Scout', score: 115 },
  { id: 'u-71', name: 'Tatum', score: 100 },
  { id: 'u-72', name: 'Unity', score: 85 },
  { id: 'u-73', name: 'Victor', score: 70 },
  { id: 'u-74', name: 'Wesley', score: 55 },
  { id: 'u-75', name: 'Ximena', score: 40 },
  { id: 'u-76', name: 'Yuki', score: 25 },
  { id: 'u-77', name: 'Ziggy', score: 10 },
  { id: 'u-78', name: 'Alder', score: 750 },
  { id: 'u-79', name: 'Blaise', score: 735 },
  { id: 'u-80', name: 'Cedar', score: 720 },
  { id: 'u-81', name: 'Divine', score: 705 },
  { id: 'u-82', name: 'Elan', score: 690 },
  { id: 'u-83', name: 'Farren', score: 675 },
  { id: 'u-84', name: 'Glenn', score: 660 },
  { id: 'u-85', name: 'Harmony', score: 645 },
  { id: 'u-86', name: 'Isaiah', score: 630 },
  { id: 'u-87', name: 'Justice', score: 615 },
  { id: 'u-88', name: 'Karma', score: 600 },
  { id: 'u-89', name: 'Lennox', score: 585 },
  { id: 'u-90', name: 'Marlow', score: 570 },
  { id: 'u-91', name: 'Novak', score: 555 },
  { id: 'u-92', name: 'Ozzy', score: 540 },
  { id: 'u-93', name: 'Piper', score: 525 },
  { id: 'u-94', name: 'Raven', score: 510 },
  { id: 'u-95', name: 'Storm', score: 495 },
  { id: 'u-96', name: 'Trent', score: 480 },
  { id: 'u-97', name: 'Urban', score: 465 },
  { id: 'u-98', name: 'Valor', score: 450 },
  { id: 'u-99', name: 'Winter', score: 435 },
  { id: 'u-100', name: 'Zane', score: 420 },
  { id: 'u-4', name: 'You', score: 1280 },
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

const MemoizedRankRow = memo(RankRow);

// ---------------------------------------------------------------------------
// Screen types
// ---------------------------------------------------------------------------

type Screen = 'home';

// ---------------------------------------------------------------------------
// Home screen
// ---------------------------------------------------------------------------

function HomeScreen({}: { onNavigate: (screen: Screen) => void }) {
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
          renderItem={(params) => <MemoizedRankRow {...params} />}
        />

        <Pressable style={styles.button} onPress={() => setIsStateB((v) => !v)}>
          <Text style={styles.buttonText}>Simulate Rank Update</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export default function App() {
  return <HomeScreen onNavigate={() => {}} />;
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
