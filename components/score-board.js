import React from 'react';
import PropTypes from 'prop-types';

export function ScoreBoard({title, score, log}) {
    return <>
        <div className="score-board nine-pin">
            <div className="score-board-left">
                <label className="score-board-label">stage</label>
                <div className="stage">{title}</div>
            </div>
            <div className="score-board-right">
                <label className="score-board-label">score</label>
                <div className="score">{score}</div>
            </div>
        </div>
        <div className="stats nine-pin no-select">{log}</div>
    </>
}

ScoreBoard.propTypes = {
    title: PropTypes.string.isRequired,
    score: PropTypes.number.isRequired,
    log: PropTypes.string
};
