import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
  View,
} from 'react-native';

export type RankingListRenderParams<TItem> = {
  item: TItem;
  oldPosition: number;
  newPosition: number;
  index: number;
  movement: number;
};

export type RankingListProps<TItem> = {
  oldRanking: TItem[];
  newRanking: TItem[];
  getId: (item: TItem) => string;
  scrollToId?: string;
  style?: StyleProp<ViewStyle>;
  rowHeight?: number;
  duration?: number;
  rowStyle?: StyleProp<ViewStyle>;
  renderItem?: (params: RankingListRenderParams<TItem>) => React.ReactNode;
};

const DEFAULT_ROW_HEIGHT = 64;
const DEFAULT_DURATION = 450;
const SCROLL_CONTEXT_ROWS = 2;

type RankedItemEntry<TItem> = RankingListRenderParams<TItem> & { id: string };

export function RankingList<TItem>({
  oldRanking,
  newRanking,
  getId,
  scrollToId,
  style,
  rowHeight = DEFAULT_ROW_HEIGHT,
  duration = DEFAULT_DURATION,
  rowStyle,
  renderItem,
}: RankingListProps<TItem>) {
  const scrollViewRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const yByIdRef = useRef<Record<string, Animated.Value>>({});

  useEffect(() => {
    if (!__DEV__) {
      return;
    }

    const seenOld = new Set<string>();
    const seenNew = new Set<string>();
    const duplicateOldIds = new Set<string>();
    const duplicateNewIds = new Set<string>();

    oldRanking.forEach((item) => {
      const id = getId(item);

      if (seenOld.has(id)) {
        duplicateOldIds.add(id);
      }

      seenOld.add(id);
    });

    newRanking.forEach((item) => {
      const id = getId(item);

      if (seenNew.has(id)) {
        duplicateNewIds.add(id);
      }

      seenNew.add(id);
    });

    if (duplicateOldIds.size === 0 && duplicateNewIds.size === 0) {
      return;
    }

    const oldDuplicates = Array.from(duplicateOldIds).join(', ');
    const newDuplicates = Array.from(duplicateNewIds).join(', ');

    console.warn(
      `[RankingList] Duplicate ids detected. oldRanking duplicates: ${
        oldDuplicates || 'none'
      }; newRanking duplicates: ${newDuplicates || 'none'}`
    );
  }, [getId, newRanking, oldRanking]);

  const rankedItems = useMemo(() => {
    const oldPositionById = oldRanking.reduce<Record<string, number>>(
      (acc, item, index) => {
        acc[getId(item)] = index + 1;
        return acc;
      },
      {}
    );

    return newRanking.reduce<RankedItemEntry<TItem>[]>((acc, item, index) => {
      const id = getId(item);

      const newPosition = index + 1;
      const oldPosition = oldPositionById[id] ?? newPosition;

      acc.push({
        id,
        item,
        index,
        oldPosition,
        newPosition,
        movement: oldPosition - newPosition,
      });

      return acc;
    }, []);
  }, [getId, newRanking, oldRanking]);

  const maxPosition = rankedItems.length;
  const scrollTargetOffset = useMemo(() => {
    if (!scrollToId) {
      return null;
    }

    const targetItem = rankedItems.find(({ id }) => id === scrollToId);

    if (!targetItem) {
      return null;
    }

    // show some rows above the target item for better context
    const targetOffset = (targetItem.newPosition - 1) * rowHeight;

    return Math.max(0, targetOffset - rowHeight * SCROLL_CONTEXT_ROWS);
  }, [rankedItems, rowHeight, scrollToId]);

  const startAnimation = React.useCallback(() => {
    const animations: Animated.CompositeAnimation[] = [];

    rankedItems.forEach(({ id, oldPosition, newPosition }) => {
      const fromY = (oldPosition - 1) * rowHeight;
      const toY = (newPosition - 1) * rowHeight;
      const existing = yByIdRef.current[id];
      const value = existing ?? new Animated.Value(fromY);

      yByIdRef.current[id] = value;
      value.setValue(fromY);

      animations.push(
        Animated.timing(value, {
          toValue: toY,
          duration,
          useNativeDriver: true,
        })
      );
    });

    if (animations.length > 0) {
      Animated.parallel(animations).start();
    }
  }, [duration, rankedItems, rowHeight]);

  useEffect(() => {
    const nextIds = new Set(rankedItems.map(({ id }) => id));

    Object.keys(yByIdRef.current).forEach((id) => {
      if (!nextIds.has(id)) {
        delete yByIdRef.current[id];
      }
    });

    rankedItems.forEach(({ id, newPosition }) => {
      const toY = (newPosition - 1) * rowHeight;

      const existing = yByIdRef.current[id];
      const value = existing ?? new Animated.Value(toY);
      yByIdRef.current[id] = value;

      value.setValue(toY);
    });
  }, [rankedItems, rowHeight]);

  useEffect(() => {
    startAnimation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rankedItems, rowHeight, duration]);

  useEffect(() => {
    if (scrollTargetOffset === null) {
      return;
    }

    const frameId = requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({
        y: scrollTargetOffset,
        animated: false,
      });
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [scrollTargetOffset]);

  return (
    <ScrollView
      ref={scrollViewRef}
      style={[styles.scrollView, style]}
      contentContainerStyle={{ height: maxPosition * rowHeight }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {rankedItems.map(
          ({ id, item, oldPosition, newPosition, movement, index }) => {
            const y =
              yByIdRef.current[id] ??
              new Animated.Value((newPosition - 1) * rowHeight);

            yByIdRef.current[id] = y;

            return (
              <Animated.View
                key={id}
                style={[
                  styles.row,
                  rowStyle,
                  {
                    height: rowHeight,
                    transform: [{ translateY: y }],
                  },
                ]}
              >
                {renderItem ? (
                  renderItem({
                    item,
                    oldPosition,
                    newPosition,
                    movement,
                    index,
                  })
                ) : (
                  <View style={styles.defaultRowContent}>
                    <Text style={[styles.defaultTitle]}>{id}</Text>
                    <Text style={styles.defaultMeta}>
                      {`#${oldPosition} -> #${newPosition}`}
                    </Text>
                  </View>
                )}
              </Animated.View>
            );
          }
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    width: '100%',
  },
  container: {
    position: 'relative',
    width: '100%',
  },
  row: {
    position: 'absolute',
    left: 0,
    right: 0,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  defaultRowContent: {
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D0D7DE',
    backgroundColor: '#F6F8FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  defaultTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  defaultMeta: {
    marginTop: 2,
    color: '#4B5563',
    fontSize: 12,
  },
});
