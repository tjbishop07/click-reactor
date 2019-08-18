import React, { useState } from "react";
import GameContext from "./context";

const provider = props => {
    const [state, setState] = useState({
        fullName: '',
        isLoggedIn: false,
        score: 0,
        user: null
    });
    return (
        <GameContext.Provider
            value={{
                data: state,
                updateIsLoggedIn: (status) => {
                    setState({ ...state, isLoggedIn: status });
                },
                updateFullName: (newName) => {
                    setState({ ...state, fullName: newName });
                },
                updateScore: (newScore) => {
                    setState({ ...state, score: (state.score + newScore) });
                }
            }}
        >
            {props.children}
        </GameContext.Provider>
    );
};

export default provider;
