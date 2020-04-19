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
|  |D |C |B |A |A |B |C |D |  |
|  |  |  |  |  |  |  |  |  |  |`,
});
