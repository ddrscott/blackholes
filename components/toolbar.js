import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Draggable from 'react-draggable';

import Hole from '../lib/tools/hole';

export const TOOLS = [
    new Hole(),
]

export function Toolbar({onChange}) {
    const [selected, setSelected] = useState(TOOLS[0]);

    function toolSelected(t) {
        setSelected(t);
        typeof onChange === 'function' && onChange(t);
    }

    return <Draggable>
        <div className="panel toolbar no-select">
            <h6 className="toolbar-header">Hole</h6>
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
