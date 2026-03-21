# rn-ranking-list

Simple leaderboard list.

## Specification

**rn-ranking-list** is a reusable React Native component for displaying a leaderboard or ranking list. It is designed to:

- Display a list of users/items ranked by score or position.
- Animate the movement of a user/item when their ranking position changes (e.g., when a user moves up or down the leaderboard).
- Accept both the previous and new ranking positions to drive the animation.
- Be customizable in appearance (row rendering, colors, avatars, etc.).
- Support smooth, performant animations for ranking changes.
- Be easy to integrate into any React Native app.

### Core Features

- **Animated Ranking Changes:** When a user’s position changes, the component animates their movement from the old position to the new one.
- **Customizable Rows:** Consumers can provide a custom row renderer to display user info, scores, avatars, etc.
- **Flexible Data:** Accepts an array of items with unique IDs and ranking positions.
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

```js
import { multiply } from 'rn-ranking-list';

// ...

const result = multiply(3, 7);
```

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
