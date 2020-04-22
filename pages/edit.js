import React, { useState } from 'react';
import styled from 'styled-components';
import dynamic from 'next/dynamic'


const Game = dynamic(() => import('../components/game'), { ssr: false });

const Main = styled.main`
    display: flex;
    flex: row;
`;

const Editor = styled.section`
`;

function App({query}) {
    const {map} = query;

    const [x_increment, setXinc] = useState(16);
    const [y_increment, setYinc] = useState(25);
    const [name, setName] = useState('Name');
    const [layout, setLayout] = useState("\n\n");

    const stage = {x_increment, y_increment, name, layout};
    return (
        <Main>
            <Game map={stage} height={800} />
            <Editor>
                layout: <textarea value={layout} onChange={(val) => setLayout(val)}/>
                <pre>
{'{'}
    name: {name},
    x_increment: {JSON.stringify(x_increment)},
    y_increment: {JSON.stringify(y_increment)},
    layout: `
${layout}`
{'}'}
                </pre>
            </Editor>
        </Main>
    )
}

App.getInitialProps = ({query}) => {
    return {query}
}

export default App;
