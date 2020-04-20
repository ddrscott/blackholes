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
  padding: .5em;
`;


const Main = styled.main`
  width: 100%;
  display: flex;
  flex-direction: column-reverse;
  text-align: center;

  @media (min-width: 600px) {
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

App.getInitialProps = ({query}) => {
    return {query}
}

export default App;
