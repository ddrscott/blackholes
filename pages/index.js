import styled from 'styled-components';
import Link from 'next/link'
import Measure from 'react-measure'
import {Game} from '../components/game';
import '../maps/001_basic';
import '../maps/002_basic';
import maps from '../maps/index';

const AsideStart = styled.aside`
`;

const AsideEnd = styled.aside`
`;

const Main = styled.main`
  width: 100%;
  display: flex;
  justify-content: center;
`;

function App({query}) {
  return (
    <Main>
      <AsideStart>
      </AsideStart>
      <Game map={maps[0]} height={800} />
      <AsideEnd>
      </AsideEnd>
    </Main>
  )
}

App.getInitialProps = ({res, query}) => {
  return {query}
}

export default App;
