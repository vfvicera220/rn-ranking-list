import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RankingList } from 'rn-ranking-list';

type Player = {
  id: string;
  name: string;
  score: number;
};

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

export default function App() {
  const [isStateB, setIsStateB] = useState(false);

  const oldRanking = isStateB ? oldRankings : newRankings;
  const newRanking = isStateB ? newRankings : oldRankings;

  return (
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
        renderItem={({ item, movement, oldPosition, newPosition }) => (
          <View style={styles.rowCard}>
            <View>
              <Text style={styles.rowName}>{item.name}</Text>
              <Text style={styles.rowMeta}>{`Score: ${item.score}`}</Text>
            </View>
            <View style={styles.rankMetaWrap}>
              <Text
                style={styles.rankText}
              >{`#${oldPosition} -> #${newPosition}`}</Text>
              <Text
                style={[
                  styles.delta,
                  movement > 0
                    ? styles.up
                    : movement < 0
                    ? styles.down
                    : styles.same,
                ]}
              >
                {movement > 0
                  ? `+${movement}`
                  : movement < 0
                  ? `${movement}`
                  : '0'}
              </Text>
            </View>
          </View>
        )}
      />

      <Pressable
        style={styles.button}
        onPress={() => {
          setIsStateB((v) => !v);
        }}
      >
        <Text style={styles.buttonText}>Simulate Rank Update</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 72,
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
    marginTop: 16,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    paddingVertical: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
