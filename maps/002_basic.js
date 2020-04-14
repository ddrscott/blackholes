import {config} from '../components/maps';
import maps from '../maps';

maps.push({
  ...config,
  background: "url('/bamboo-bg.jpg') center center",
  name: "Such Simple",
  layout: `
|           |     |           |
|           |     |           |
|           O     O           |
|                             |
O                             O
|                             |
|                             |
|                             |
O                             O
|                             |
|                             |
|                             |
O                             O
|                             |
|                             |
|                             |
O                             O
|                             |
|  O     O     O     O     O  |
|                             |
O     O     O     O     O     O
|                             |
|  O     O     O     O     O  |
|  |                       |  |
|  |  O     O     O     O  |  |
|  |  |                 |  |  |
|  |  |  O     O     O  |  |  |
|  |  |  |           |  |  |  |
|  |  |  |  O     O  |  |  |  |
|  |  |  |  |     |  |  |  |  |
|  |  |  |  |  O  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |
|A |B |C |D |E |E |D |C |B |A |`,
});
