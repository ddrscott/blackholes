import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Draggable from 'react-draggable';

import Puck from '../lib/tools/puck';
import Biggy from '../lib/tools/biggy';
import Gravity from '../lib/tools/gravity';

export const TOOLS = [
    new Puck(),
    new Biggy(),
    new Gravity(),
]

export function Toolbar({onChange}) {
    const [selected, setSelected] = useState(TOOLS[0]);

    function toolSelected(t) {
        setSelected(t);
        typeof onChange === 'function' && onChange(t);
    }

    return <Draggable>
        <div className="toolbar no-select">
            <h6>Plop</h6>
            {
                TOOLS.map((t) => 
                    <div className={`toolbar-tool ${t == selected && 'selected'}`}
                        key={t.label}
                        onClick={() => toolSelected(t)}
                        onTouchEnd={() => toolSelected(t)}
                        style={{cursor: 'pointer'}}
                    >{t.label}</div>
                )
            }
        </div>
    </Draggable>
}

Toolbar.propTypes = {
    onChange: PropTypes.func
};
