import React from 'react'

export function ResultsTableElem(props){
    const brightness = ((props.rank/props.total) * 0.5) + 0.5;
    return(
        <td style={{filter: `brightness(${brightness})`}}>{props.subId}. brightness rating: {brightness}</td>
    );
}
