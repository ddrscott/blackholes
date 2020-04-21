import React, { useState } from 'react';
import Router from 'next/router'
import styled from 'styled-components';
import dynamic from 'next/dynamic'

import '../maps/001_such_simple';
import '../maps/002_bigger';
import '../maps/003_wedgy';
import '../maps/004_smiley';
import '../maps/005_try_angles';
import '../maps/006_just_air';
import maps from '../maps';

const Game = dynamic(() => import('../components/game'), { ssr: false });

const Aside = styled.aside`
  @media (min-width: 480px) {
    padding: 0.25em;
  }
`;

const Main = styled.main`
  width: 100%;
  display: flex;
  flex-direction: column;
  text-align: center;

  @media (min-width: 480px) {
    flex-direction: row;
    justify-content: center;
    text-align: left;
  }
`;

function App({query}) {
    const {map} = query;

    function openMap(idx) {
        Router.push({
            pathname: '/',
            query: { map: idx },
        })
        setMap(idx);
    }


    let [mapIdx, setMap] = useState(maps[map - 1] ? parseInt(map) : 1);
    return (
        <Main>
            <Game map={maps[mapIdx-1]} height={800} />
            <Aside>
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
                <div>
                    <small style={{whiteSpace: 'nowrap'}}>Map: {mapIdx} of {maps.length}</small>
                </div>
            </Aside>
        </Main>
    )
}

App.getInitialProps = ({query}) => {
    return {query}
}

export default App;
