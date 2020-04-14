import {config} from '../components/maps';
import maps from '../maps';

maps.push({
  ...config,
  background: "url('/bamboo-bg.jpg') center center",
  name: "Wedgy",
  layout: `
|    O                   O    |
|     O                 O     |
|      O               O      |
|       O             O       |
|        O           O        |
|         O         O         |
|          O       O          |
|           O     O           |
|            O   O            |
|                             |
|              o              |
|             o o             |
|            o   o            |
|           o     o           |
|          o       o          |
|         o         o         |
O        o           o        O
|       O             O       |
|                             |
|                             |
|     O                 O     |
|                             |
|  o     O           O     o  |
|  |                       |  |
|  |  o     O     O     o  |  |
|  |  |                 |  |  |
|  |  |  o     O     o  |  |  |
|  |  |  |           |  |  |  |
|  |  |  |  o     o  |  |  |  |
|  |  |  |  |     |  |  |  |  |
|  |  |  |  |  o  |  |  |  |  |
|  |D |C |B |A |A |B |C |D |  |
|  |  |  |  |  |  |  |  |  |  |`,
});
