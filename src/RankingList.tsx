import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
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
  scrollEventThrottle?: number;
  renderItem?: (params: RankingListRenderParams<TItem>) => React.ReactNode;
  onScrollToComplete?: () => void;
  skipInitialAnimation?: boolean;
};

const DEFAULT_ROW_HEIGHT = 64;
const DEFAULT_DURATION = 450;
const OVERSCAN_COUNT = 5;
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
  scrollEventThrottle = Platform.OS === 'ios' ? 100 : 16,
  renderItem,
  onScrollToComplete,
  skipInitialAnimation = false,
}: RankingListProps<TItem>) {
  const scrollViewRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const yByIdRef = useRef<Record<string, Animated.Value>>({});
  const scrollOffsetRef = useRef(0);
  const hasInitialAnimationRunRef = useRef(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

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

  // Initialise an Animated.Value for every id that does not yet have one so
  // that the JSX render never creates values or mutates refs during rendering,
  // which would trigger the React "useInsertionEffect must not schedule
  // updates" warning on Fabric / React 18+.
  useMemo(() => {
    rankedItems.forEach(({ id, newPosition }) => {
      if (!yByIdRef.current[id]) {
        yByIdRef.current[id] = new Animated.Value(
          (newPosition - 1) * rowHeight
        );
      }
    });
  }, [rankedItems, rowHeight]);

  const visibleItems = useMemo(() => {
    if (isAnimating) {
      // During animated transitions, rows can travel across the viewport even
      // when both endpoints are outside it. Rendering all rows avoids visual
      // gaps for large list shuffles.
      return rankedItems;
    }

    const firstVisible = Math.max(
      0,
      Math.floor(scrollOffset / rowHeight) - OVERSCAN_COUNT
    );
    const lastVisible = Math.min(
      rankedItems.length - 1,
      Math.ceil((scrollOffset + viewportHeight) / rowHeight) + OVERSCAN_COUNT
    );
    return rankedItems.slice(firstVisible, lastVisible + 1);
  }, [isAnimating, rankedItems, rowHeight, scrollOffset, viewportHeight]);

  const renderItems = useMemo(() => {
    if (!isAnimating || !scrollToId) {
      return visibleItems;
    }

    const focusedIndex = rankedItems.findIndex(({ id }) => id === scrollToId);

    if (focusedIndex < 0) {
      return visibleItems;
    }

    const focusedItem = rankedItems[focusedIndex];

    if (!focusedItem) {
      return visibleItems;
    }

    return [
      ...rankedItems.slice(0, focusedIndex),
      ...rankedItems.slice(focusedIndex + 1),
      focusedItem,
    ];
  }, [isAnimating, rankedItems, scrollToId, visibleItems]);

  const maxPosition = rankedItems.length;
  const scrollTargetOffset = useMemo(() => {
    if (!scrollToId) {
      return null;
    }

    const targetItem = rankedItems.find(({ id }) => id === scrollToId);

    if (!targetItem) {
      return null;
    }

    // When skipping initial animation, use new position; otherwise use old position
    const isFirstAnimation = !hasInitialAnimationRunRef.current;
    const shouldUseNewPosition = skipInitialAnimation && isFirstAnimation;
    const positionToUse = shouldUseNewPosition
      ? targetItem.newPosition
      : targetItem.oldPosition;

    // Calculate movement and context based on which position we're using
    const targetOffset = (positionToUse - 1) * rowHeight;
    const movement = shouldUseNewPosition
      ? 0 // No movement when we're already at the target position
      : targetItem.oldPosition - targetItem.newPosition;

    // If moving down (negative movement), position at bottom; otherwise at top
    const contextRows =
      movement < 0
        ? rowHeight * SCROLL_CONTEXT_ROWS + rowHeight - viewportHeight
        : -rowHeight * SCROLL_CONTEXT_ROWS;

    const maxScrollOffset = Math.max(
      0,
      rankedItems.length * rowHeight - viewportHeight
    );

    return Math.min(maxScrollOffset, Math.max(0, targetOffset + contextRows));
  }, [
    rankedItems,
    rowHeight,
    scrollToId,
    viewportHeight,
    skipInitialAnimation,
  ]);

  const startAnimation = React.useCallback(() => {
    const isFirstAnimation = !hasInitialAnimationRunRef.current;
    const shouldSkipFocusAnimation = skipInitialAnimation && isFirstAnimation;
    hasInitialAnimationRunRef.current = true;

    const animations: Animated.CompositeAnimation[] = [];

    rankedItems.forEach(({ id, oldPosition, newPosition }) => {
      const fromY = (oldPosition - 1) * rowHeight;
      const toY = (newPosition - 1) * rowHeight;
      const deltaY = toY - fromY;
      const isFocusedRow = scrollToId === id;

      const existing = yByIdRef.current[id];
      const value = existing ?? new Animated.Value(fromY);

      yByIdRef.current[id] = value;
      value.setValue(fromY);

      // Only animate the focused row; other rows jump to their final position
      if (isFocusedRow && scrollToId && !shouldSkipFocusAnimation) {
        const distanceRows = Math.abs(deltaY) / rowHeight;
        const focusDuration = Math.min(
          duration + distanceRows * 20,
          duration * 3
        );

        const easingConfig = {
          toValue: toY,
          duration: focusDuration,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: false,
        };

        animations.push(Animated.timing(value, easingConfig));
      } else {
        // Non-focused rows jump directly to their final position
        // Also jump focused row if skipInitialAnimation is true
        value.setValue(toY);
      }
    });

    if (animations.length > 0) {
      setIsAnimating(true);
      Animated.parallel(animations).start(() => {
        rankedItems.forEach(({ id, newPosition }) => {
          const toY = (newPosition - 1) * rowHeight;
          yByIdRef.current[id]?.setValue(toY);
        });

        setIsAnimating(false);
      });
    }
  }, [duration, rankedItems, rowHeight, scrollToId, skipInitialAnimation]);

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
    if (scrollTargetOffset !== null) {
      return;
    }

    startAnimation();
  }, [scrollTargetOffset, startAnimation]);

  useEffect(() => {
    if (scrollTargetOffset === null) {
      return;
    }

    const frameId = requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({
        y: scrollTargetOffset,
        animated: false,
      });
      scrollOffsetRef.current = scrollTargetOffset;
      onScrollToComplete?.();
      startAnimation();
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [scrollTargetOffset, onScrollToComplete, startAnimation]);

  useEffect(() => {
    if (!isAnimating || !scrollToId || viewportHeight <= 0) {
      return;
    }

    const focusedY = yByIdRef.current[scrollToId];

    if (!focusedY) {
      return;
    }

    const maxScrollOffset = Math.max(
      0,
      maxPosition * rowHeight - viewportHeight
    );
    const topContext = rowHeight * SCROLL_CONTEXT_ROWS;
    const bottomContext = rowHeight * SCROLL_CONTEXT_ROWS;
    let frameId = 0;

    const followRow = (rowTop: number) => {
      const rowBottom = rowTop + rowHeight;
      const currentOffset = scrollOffsetRef.current;
      const viewportTop = currentOffset;
      const viewportBottom = currentOffset + viewportHeight;

      let nextOffset = currentOffset;

      if (rowTop < viewportTop + topContext) {
        nextOffset = Math.max(0, rowTop - topContext);
      } else if (rowBottom > viewportBottom - bottomContext) {
        nextOffset = Math.min(
          maxScrollOffset,
          rowBottom - viewportHeight + bottomContext
        );
      }

      if (Math.abs(nextOffset - currentOffset) > 0.5) {
        scrollViewRef.current?.scrollTo({ y: nextOffset, animated: false });
        scrollOffsetRef.current = nextOffset;
      }
    };

    const listenerId = focusedY.addListener(({ value }) => {
      if (frameId) {
        return;
      }

      frameId = requestAnimationFrame(() => {
        frameId = 0;
        followRow(value);
      });
    });

    return () => {
      focusedY.removeListener(listenerId);

      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [isAnimating, maxPosition, rowHeight, scrollToId, viewportHeight]);

  useEffect(() => {
    if (isAnimating || !scrollToId || viewportHeight <= 0) {
      return;
    }

    const focusedItem = rankedItems.find(({ id }) => id === scrollToId);

    if (!focusedItem) {
      return;
    }

    const targetY = (focusedItem.newPosition - 1) * rowHeight;
    const movement = focusedItem.oldPosition - focusedItem.newPosition;
    const maxScrollOffset = Math.max(
      0,
      maxPosition * rowHeight - viewportHeight
    );

    // If moving down (negative movement), position at bottom; otherwise at top
    let nextOffset;
    if (movement < 0) {
      // Moving down: position at bottom with context rows below
      nextOffset = Math.min(
        maxScrollOffset,
        Math.max(
          0,
          targetY + rowHeight - viewportHeight + rowHeight * SCROLL_CONTEXT_ROWS
        )
      );
    } else {
      // Moving up or static: position at top with context rows above
      nextOffset = Math.min(
        maxScrollOffset,
        Math.max(0, targetY - rowHeight * SCROLL_CONTEXT_ROWS)
      );
    }

    scrollViewRef.current?.scrollTo({ y: nextOffset, animated: false });
    scrollOffsetRef.current = nextOffset;
  }, [
    isAnimating,
    maxPosition,
    rankedItems,
    rowHeight,
    scrollToId,
    viewportHeight,
  ]);

  return (
    <ScrollView
      ref={scrollViewRef}
      style={[styles.scrollView, style]}
      contentContainerStyle={{ height: maxPosition * rowHeight }}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={scrollEventThrottle}
      onLayout={(e) => setViewportHeight(e.nativeEvent.layout.height)}
      onScroll={(e) => {
        const nextOffset = e.nativeEvent.contentOffset.y;
        scrollOffsetRef.current = nextOffset;
        setScrollOffset(nextOffset);
      }}
    >
      <View style={styles.container}>
        {renderItems.map(
          ({ id, item, oldPosition, newPosition, movement, index }) => {
            const y = yByIdRef.current[id]!;
            const isFocusedRow = scrollToId === id && isAnimating;

            return (
              <Animated.View
                key={id}
                style={[
                  styles.row,
                  rowStyle,
                  // eslint-disable-next-line react-native/no-inline-styles
                  {
                    height: rowHeight,
                    transform: [{ translateY: y }],
                    zIndex: isFocusedRow ? 1 : 0,
                    elevation: isFocusedRow ? 1 : 0,
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
