import React from 'react';
import PropTypes from 'prop-types';

export function MainMenu({children, active}) {
    return <div className={`panel main-menu nine-pin ${active || 'hidden'}`}>
        <h1>{document.title}</h1>
        <p>
           * Make Black Holes<br/>
           * Collect Stars N'Stuff<br/>
           * Small Hole, Big Points<br/>
        </p>
        {children}
    </div>
}

MainMenu.propTypes = {
    active: PropTypes.bool,
    children: PropTypes.element.isRequired,
}
