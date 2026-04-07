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
    const firstVisible = Math.max(
      0,
      Math.floor(scrollOffset / rowHeight) - OVERSCAN_COUNT
    );
    const lastVisible = Math.min(
      rankedItems.length - 1,
      Math.ceil((scrollOffset + viewportHeight) / rowHeight) + OVERSCAN_COUNT
    );

    // Always render only the viewport + overscan
    // During the two-phase animation (out-of-view skip), the focused row animates off-screen
    // then is repositioned out-of-view before animating back in, so it won't flicker
    return rankedItems.slice(firstVisible, lastVisible + 1);
  }, [rankedItems, rowHeight, scrollOffset, viewportHeight]);

  const renderItems = useMemo(() => {
    if (!scrollToId) {
      return visibleItems;
    }

    // Always render focused row last so it appears on top of all others
    const focusedIndex = visibleItems.findIndex(({ id }) => id === scrollToId);

    if (focusedIndex < 0) {
      const focusedItem = rankedItems.find(({ id }) => id === scrollToId);
      if (!focusedItem) {
        return visibleItems;
      }

      return [...visibleItems, focusedItem];
    }

    const focusedItem = visibleItems[focusedIndex];
    if (!focusedItem) {
      return visibleItems;
    }

    const withoutFocused = [
      ...visibleItems.slice(0, focusedIndex),
      ...visibleItems.slice(focusedIndex + 1),
    ];
    return [...withoutFocused, focusedItem];
  }, [rankedItems, scrollToId, visibleItems]);

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

    // Calculate position in scroll coordinates
    const rowScrollY = (positionToUse - 1) * rowHeight;

    // If viewport is large enough, center the focused row; otherwise use context-based positioning
    if (viewportHeight > rowHeight * 3) {
      // Center the focused row on screen
      const fixedViewportY = (viewportHeight - rowHeight) / 2;
      const targetOffset = rowScrollY - fixedViewportY;
      const maxScrollOffset = Math.max(
        0,
        rankedItems.length * rowHeight - viewportHeight
      );
      return Math.max(0, Math.min(maxScrollOffset, targetOffset));
    }

    // Fallback: use context-based positioning for small viewports
    const movement = shouldUseNewPosition
      ? 0
      : targetItem.oldPosition - targetItem.newPosition;

    const contextRows =
      movement < 0
        ? rowHeight * SCROLL_CONTEXT_ROWS + rowHeight - viewportHeight
        : -rowHeight * SCROLL_CONTEXT_ROWS;

    const maxScrollOffset = Math.max(
      0,
      rankedItems.length * rowHeight - viewportHeight
    );

    return Math.min(maxScrollOffset, Math.max(0, rowScrollY + contextRows));
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

    const focusedItem = scrollToId
      ? rankedItems.find(({ id }) => id === scrollToId)
      : undefined;
    const shouldAnimateAllRows =
      !!scrollToId && !focusedItem && !shouldSkipFocusAnimation;

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
      if (isFocusedRow && focusedItem && !shouldSkipFocusAnimation) {
        const distanceRows = Math.abs(deltaY) / rowHeight;
        const movement = oldPosition - newPosition;
        const isMovingDown = movement < 0;
        const viewportTop = scrollOffsetRef.current;
        const viewportBottom = viewportTop + viewportHeight;
        const fromInViewport =
          fromY + rowHeight > viewportTop && fromY < viewportBottom;
        const toInViewport =
          toY + rowHeight > viewportTop && toY < viewportBottom;

        // Two-phase animation: out of viewport, then skip to target
        // Phase 1 duration is slightly shorter, Phase 3 matches it
        const totalDuration = Math.min(
          duration + distanceRows * 20,
          duration * 3
        );
        const phaseDuration = totalDuration * 0.45;

        if (fromInViewport && toInViewport) {
          animations.push(
            Animated.timing(value, {
              toValue: toY,
              duration: totalDuration,
              easing: Easing.bezier(0.25, 0.1, 0.25, 1),
              useNativeDriver: false,
            })
          );
        } else {
          // Position to animate row out of viewport
          const outOfViewY = isMovingDown
            ? viewportBottom + rowHeight * 2
            : viewportTop - rowHeight * 2;

          animations.push(
            Animated.sequence([
              // Phase 1: Animate row out of current viewport
              Animated.timing(value, {
                toValue: outOfViewY,
                duration: phaseDuration,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                useNativeDriver: false,
              }),
              // Phase 2: Instantly reposition to off-screen at new location
              // (0-duration jump to the opposite side of the new position)
              Animated.timing(value, {
                toValue: isMovingDown
                  ? toY - (viewportHeight + rowHeight * 2)
                  : toY + (viewportHeight + rowHeight * 2),
                duration: 0,
                useNativeDriver: false,
              }),
              // Phase 3: Animate back into viewport at new position
              Animated.timing(value, {
                toValue: toY,
                duration: phaseDuration,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                useNativeDriver: false,
              }),
            ])
          );
        }
      } else if (shouldAnimateAllRows && oldPosition !== newPosition) {
        animations.push(
          Animated.timing(value, {
            toValue: toY,
            duration,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            useNativeDriver: false,
          })
        );
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
  }, [
    duration,
    rankedItems,
    rowHeight,
    scrollToId,
    skipInitialAnimation,
    viewportHeight,
  ]);

  // Initialize animated values when rankedItems changes or is first created
  useMemo(() => {
    const nextIds = new Set(rankedItems.map(({ id }) => id));

    // Clean up animated values for items that no longer exist
    Object.keys(yByIdRef.current).forEach((id) => {
      if (!nextIds.has(id)) {
        delete yByIdRef.current[id];
      }
    });

    // Initialize animated values for each item in rankedItems
    rankedItems.forEach(({ id, newPosition }) => {
      if (!yByIdRef.current[id]) {
        yByIdRef.current[id] = new Animated.Value(
          (newPosition - 1) * rowHeight
        );
      }
    });
  }, [rankedItems, rowHeight]);

  // When rankedItems changes, immediately reset animated values to old positions
  // This prevents flicker by ensuring items are positioned correctly before animation starts
  useEffect(() => {
    rankedItems.forEach(({ id, oldPosition }) => {
      const fromY = (oldPosition - 1) * rowHeight;
      yByIdRef.current[id]?.setValue(fromY);
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

    // Position focused row at center of viewport (fixed screen position)
    const fixedViewportY = (viewportHeight - rowHeight) / 2;

    const lockRow = (rowTop: number) => {
      // Calculate scroll offset to keep focused row at fixed viewport position
      const nextOffset = Math.max(
        0,
        Math.min(maxScrollOffset, rowTop - fixedViewportY)
      );

      if (Math.abs(nextOffset - scrollOffsetRef.current) > 0.5) {
        scrollViewRef.current?.scrollTo({ y: nextOffset, animated: false });
        scrollOffsetRef.current = nextOffset;
      }
    };

    const listenerId = focusedY.addListener(({ value }) => {
      lockRow(value);
    });

    return () => {
      focusedY.removeListener(listenerId);
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
    const maxScrollOffset = Math.max(
      0,
      maxPosition * rowHeight - viewportHeight
    );

    // If viewport is large enough, center the focused row; otherwise use context-based positioning
    let nextOffset;
    if (viewportHeight > rowHeight * 3) {
      // Center the focused row on screen
      const fixedViewportY = (viewportHeight - rowHeight) / 2;
      nextOffset = Math.max(
        0,
        Math.min(maxScrollOffset, targetY - fixedViewportY)
      );
    } else {
      // Fallback: use context-based positioning for small viewports
      const movement = focusedItem.oldPosition - focusedItem.newPosition;
      let baseOffset;
      if (movement < 0) {
        // Moving down: position at bottom with context rows below
        baseOffset = Math.max(
          0,
          targetY + rowHeight - viewportHeight + rowHeight * SCROLL_CONTEXT_ROWS
        );
      } else {
        // Moving up or static: position at top with context rows above
        baseOffset = Math.max(0, targetY - rowHeight * SCROLL_CONTEXT_ROWS);
      }
      nextOffset = Math.min(maxScrollOffset, baseOffset);
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
            const isFocusedRow = scrollToId === id;

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
                    zIndex: isFocusedRow ? 1000 : 0,
                    elevation: isFocusedRow ? 1000 : 0,
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
