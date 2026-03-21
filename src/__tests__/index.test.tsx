const mockScrollTo = jest.fn();

jest.mock('react', () => {
  const actual = jest.requireActual('react');

  return {
    ...actual,
    useCallback: jest.fn(),
    useEffect: jest.fn(),
    useMemo: jest.fn(),
    useRef: jest.fn(),
    useState: jest.fn(),
  };
});

jest.mock('react-native', () => {
  class MockAnimatedValue {
    currentValue: number;

    constructor(initialValue: number) {
      this.currentValue = initialValue;
    }

    setValue(nextValue: number) {
      this.currentValue = nextValue;
    }
  }

  return {
    Animated: {
      Value: MockAnimatedValue,
      View: 'Animated.View',
      parallel: jest.fn(() => ({ start: jest.fn() })),
      timing: jest.fn(() => ({ start: jest.fn() })),
    },
    ScrollView: 'ScrollView',
    StyleSheet: {
      create: <T,>(styles: T) => styles,
      hairlineWidth: 1,
    },
    Text: 'Text',
    View: 'View',
  };
});

import * as React from 'react';
import { Animated } from 'react-native';
import { RankingList, triggerRankingListAnimation } from '../RankingList';

const mockUseCallback = React.useCallback as jest.Mock;
const mockUseEffect = React.useEffect as jest.Mock;
const mockUseMemo = React.useMemo as jest.Mock;
const mockUseRef = React.useRef as jest.Mock;
const mockUseState = React.useState as jest.Mock;
const mockAnimatedTiming = Animated.timing as jest.Mock;

type Player = {
  id: string;
  name: string;
};

type RankingListTestProps = {
  oldRanking: Player[];
  newRanking: Player[];
  getId: (item: Player) => string;
  scrollToId?: string;
  rowHeight?: number;
};

const oldRanking: Player[] = [
  { id: 'u-1', name: 'Alex' },
  { id: 'u-2', name: 'Sam' },
  { id: 'u-3', name: 'Jamie' },
];

const newRanking: Player[] = [
  { id: 'u-1', name: 'Alex' },
  { id: 'u-3', name: 'Jamie' },
  { id: 'u-2', name: 'Sam' },
];

let hookIndex = 0;
let hookSlots: unknown[] = [];
let cleanups: Array<() => void> = [];
let scrollViewCurrent: { scrollTo: typeof mockScrollTo } | null = null;

function setupHookRuntime() {
  hookIndex = 0;
  hookSlots = [];
  cleanups = [];
  scrollViewCurrent = { scrollTo: mockScrollTo };

  mockUseCallback.mockImplementation((fn) => fn);
  mockUseEffect.mockImplementation((effect) => {
    const cleanup = effect();

    if (typeof cleanup === 'function') {
      cleanups.push(cleanup);
    }
  });
  mockUseMemo.mockImplementation((factory) => factory());
  mockUseRef.mockImplementation((initialValue) => {
    const slot = hookIndex;
    hookIndex += 1;

    if (hookSlots[slot] === undefined) {
      const currentValue =
        slot === 0 && scrollViewCurrent !== null
          ? scrollViewCurrent
          : initialValue;

      hookSlots[slot] = { current: currentValue };
    }

    return hookSlots[slot];
  });
  mockUseState.mockImplementation((initialValue) => {
    const slot = hookIndex;
    hookIndex += 1;

    if (hookSlots[slot] === undefined) {
      hookSlots[slot] =
        typeof initialValue === 'function'
          ? (initialValue as () => unknown)()
          : initialValue;
    }

    const setState = (nextValue: unknown | ((value: unknown) => unknown)) => {
      hookSlots[slot] =
        typeof nextValue === 'function'
          ? (nextValue as (value: unknown) => unknown)(hookSlots[slot])
          : nextValue;
    };

    return [hookSlots[slot], setState];
  });
}

function renderRankingList(props: RankingListTestProps) {
  hookIndex = 0;
  RankingList(props);
}

function cleanupEffects() {
  cleanups
    .splice(0)
    .reverse()
    .forEach((cleanup) => {
      cleanup();
    });
}

describe('RankingList', () => {
  beforeEach(() => {
    mockScrollTo.mockReset();
    mockAnimatedTiming.mockReset();
    mockUseCallback.mockClear();
    mockUseEffect.mockClear();
    mockUseMemo.mockClear();
    mockUseRef.mockReset();
    mockUseState.mockReset();

    setupHookRuntime();

    global.requestAnimationFrame = jest.fn((callback) => {
      callback(0);
      return 1;
    });

    global.cancelAnimationFrame = jest.fn();
  });

  afterEach(() => {
    cleanupEffects();
  });

  it('scrolls to the matching item on load', () => {
    renderRankingList({
      oldRanking,
      newRanking,
      getId: (item) => item.id,
      rowHeight: 50,
      scrollToId: 'u-2',
    });

    expect(mockScrollTo).toHaveBeenCalledWith({
      y: 100,
      animated: false,
    });
  });

  it('does not scroll when the target id is missing', () => {
    renderRankingList({
      oldRanking,
      newRanking,
      getId: (item) => item.id,
      rowHeight: 50,
      scrollToId: 'u-999',
    });

    expect(mockScrollTo).not.toHaveBeenCalled();
  });

  it('applies an animation request after the updated rankings commit', () => {
    renderRankingList({
      oldRanking,
      newRanking: oldRanking,
      getId: (item) => item.id,
      rowHeight: 50,
    });

    triggerRankingListAnimation();

    expect(mockAnimatedTiming).not.toHaveBeenCalled();

    renderRankingList({
      oldRanking,
      newRanking,
      getId: (item) => item.id,
      rowHeight: 50,
    });

    expect(mockAnimatedTiming).toHaveBeenCalledTimes(3);
    expect(
      mockAnimatedTiming.mock.calls.map(([, config]) => config.toValue)
    ).toEqual([0, 50, 100]);
  });
});
