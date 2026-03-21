# rn-ranking-list

Simple leaderboard list.

## Specification

**rn-ranking-list** is a reusable React Native component for displaying a leaderboard or ranking list. It is designed to:

- Display a list of users/items ranked by score or position.
- Animate the movement of a user/item when their ranking position changes (e.g., when a user moves up or down the leaderboard).
- Accept previous and new ranking arrays, and derive rank movement from item IDs.
- Animate ranking changes automatically whenever the ranking data updates.
- Be customizable in appearance (row rendering, colors, avatars, etc.).
- Support smooth, performant animations for ranking changes.
- Be easy to integrate into any React Native app.

### Core Features

- **Animated Ranking Changes:** When a user’s position changes, the component animates their movement from the old position to the new one.
- **Customizable Rows:** Consumers can provide a custom row renderer to display user info, scores, avatars, etc.
- **Flexible Data:** Accepts old/new ranking arrays with unique IDs.
- **Performance:** Optimized for smooth animations even with large lists.

### Example Use Cases

- Live leaderboards in games or fitness apps.
- Ranking lists for contests, sales, or productivity.
- Any scenario where user/item positions change dynamically and should be visually highlighted.

## Installation

```sh
npm install rn-ranking-list
```

## Usage

```tsx
import { RankingList } from 'rn-ranking-list';

type User = {
  id: string;
  name: string;
};

const oldRanking: User[] = [
  { id: 'u-1', name: 'Alex' },
  { id: 'u-2', name: 'Sam' },
  { id: 'u-3', name: 'Jamie' },
];

const newRanking: User[] = [
  { id: 'u-2', name: 'Sam' },
  { id: 'u-3', name: 'Jamie' },
  { id: 'u-1', name: 'Alex' },
];

export function Leaderboard() {
  return (
    <>
      <RankingList
        oldRanking={oldRanking}
        newRanking={newRanking}
        getId={(item) => item.id}
      />
    </>
  );
}
```

Every time `oldRanking`/`newRanking` updates, the component compares the positions and animates the rows automatically—no extra trigger needed.

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
