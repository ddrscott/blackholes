import React, { useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link'
import Measure from 'react-measure'
import {Game} from '../components/game';
import '../maps/001_such_simple';
import '../maps/002_bigger';
import '../maps/002_wedgy';
import '../maps/003_try_angles';
import '../maps/004_smiley';
import maps from '../maps';

const Aside = styled.aside`
  padding: .5em;
`;


const Main = styled.main`
  width: 100%;
  display: flex;
  justify-content: center;
`;

function App({query}) {
  const {map} = query;

  const [mapIdx, setMap] = useState(maps[map] ? parseInt(map) : 0);
  return (
    <Main>
      <Aside>
      </Aside>
      <Game map={maps[mapIdx]} height={800} />
      <Aside>
        <div>
        <small style={{whiteSpace: 'nowrap'}}>Map: {mapIdx + 1} of {maps.length}</small>
        </div>
      {
       mapIdx > 0
       ? <button onClick={() => setMap(mapIdx - 1)}>&lt; Previous</button>
       : <button disabled>&lt; Previous</button>
      }
      {
       mapIdx < maps.length - 1
       ? <button onClick={() => setMap(mapIdx + 1)}>Next &gt;</button>
       : <button disabled>Next &gt;</button>
      }
      </Aside>
    </Main>
  )
}

App.getInitialProps = ({res, query}) => {
  console.log(query);
  return {query}
}

export default App;
