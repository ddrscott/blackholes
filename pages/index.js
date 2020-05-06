import React, { useState } from 'react';
import Router from 'next/router'
import styled from 'styled-components';
import dynamic from 'next/dynamic'

import '../maps/001_such_simple';
import maps from '../maps';

const Game = dynamic(() => import('../components/game'), { ssr: false });

// const Aside = styled.aside`
//   text-align: center;
//   @media (min-width: 500px) {
//     padding: 0.25em;
//   }
// `;

// const Main = styled.main`
//   width: 100%;
//   height: 100%;
//   display: flex;
//   flex-direction: column;

//   @media (min-width: var(--breakpoint-phone)) {
//     flex-direction: row;
//     justify-content: center;
//     text-align: left;
//   }
// `;

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
    return (<>
        <Game className="game" map={maps[mapIdx-1]} />
        </>
    )
}

App.getInitialProps = ({query}) => {
    return {query}
}

export default App;
