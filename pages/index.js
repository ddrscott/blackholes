import React, { useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link'
import Measure from 'react-measure'
import {Game} from '../components/game';
import '../maps/register';
import maps from '../maps';

const Aside = styled.aside`
  padding: .5em;
`;


const Main = styled.main`
  width: 100%;
  display: flex;
  justify-content: center;
`;

function openMap(idx) {
  window.location = '/?map=' + idx;
}

function App({query}) {
  const {map} = query;

  let [mapIdx, setMap] = useState(maps[map - 1] ? parseInt(map) : 1);
  return (
    <Main>
      <Aside>
      </Aside>
      <Game map={maps[mapIdx-1]} height={800} />
      <Aside>
        <div>
        <small style={{whiteSpace: 'nowrap'}}>Map: {mapIdx} of {maps.length}</small>
        </div>
      {
       mapIdx > 1
       ? <button onClick={() => openMap(mapIdx - 1)}>&lt; Previous</button>
       : <button disabled>&lt; Previous</button>
      }
      {
       mapIdx < maps.length
       ? <button onClick={() => openMap(mapIdx + 1)}>Next &gt;</button>
       : <button disabled>Next &gt;</button>
      }
      </Aside>
    </Main>
  )
}

App.getInitialProps = ({res, query}) => {
  return {query}
}

export default App;
