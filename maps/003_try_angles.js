import {config} from '../components/maps';
import maps from '../maps';

maps.push({
  ...config,
  background: "url('/bamboo-bg.jpg') center center",
  name: "Try Angles",
  layout: `
|           |     |           |
|           |     |           |
|           O     O           |
|     ^                ^      |
|    ^ ^              ^ ^     |
|                             |
|                             |
|                             |
|        ^           ^        |
|                             |
|     ^     ^     ^     ^     |
|                             |
|  ^     ^     ^     ^     ^  |
|                             |
|     ^     ^     ^     ^     |
|                             |
|  ^     ^     ^     ^     ^  |
|                             |
|     ^     ^     ^     ^     |
|                             |
|  ^     ^     ^     ^     ^  |
|                             |
|     ^     ^     ^     ^     |
|                             |
|        ^     ^     ^        |
|  |                       |  |
|  |                       |  |
|  |  |                 |  |  |
|  |  |                 |  |  |
|  |  |  |           |  |  |  |
|  |  |  |     |     |  |  |  |
|A |B |C |D |E |E |D |C |B |A |
|  |  |  |  |  |  |  |  |  |  |`,
});
