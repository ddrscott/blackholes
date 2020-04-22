import {config} from '../components/maps';
import maps from '../maps';

maps.push({
    ...config,
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
|  |D |C |B |A |A |B |C |D |  |
|  |  |  |  |  |  |  |  |  |  |`,
});
