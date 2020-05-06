import React from 'react';
import PropTypes from 'prop-types';

export function ScoreBoard({title, score, log, onClick, onFullScreen}) {
    return <>
        <div className="score-board nine-pin" onClick={onClick}>
            <div className="score-board-left">
                <label className="score-board-label">Holes</label>
                <div className="stage">{title}</div>
            </div>
            <div className="score-board-center">
                <label className="score-board-label">score</label>
                <div className="score">{score}</div>
            </div>
            <div className="score-board-right">
                {/*<i className="icon-caret-down"></i>*/}
            </div>
        </div>
    </>
}

ScoreBoard.propTypes = {
    title: PropTypes.string.isRequired,
    score: PropTypes.number.isRequired,
    log: PropTypes.string,
    onClick: PropTypes.func
}
