import React, {useState} from 'react'

function ResultsTableElem(props){
    function handleMouseOver(){
        props.handleHover(props.subId, props.cmpId);
    }

    function handleMouseOut(){
        props.handleHover(0,0);
    }
    return(
        <td onMouseOver={handleMouseOver} onMouseOut={handleMouseOut} style={{filter: `brightness(${props.brightness})`}} className={props.selected ? "selectedSub": ""}>
            {props.subId}. brightness rating: {props.brightness}
        </td>
    );
}

function ResultsTableRow(props){
    const [selected, setSelected] = useState([0,0]);
    const changeSelected = (subId, cmpId) => {
        setSelected([subId, cmpId]);
    }
    const resultsData = props.results;
    let resultElems = [];
    for(let i=0; i<resultsData.length ; i++){
        resultElems.push(<ResultsTableElem key={resultsData[i].id} subId={resultsData[i].id} cmpId={resultsData[i].cmpId} brightness={resultsData[i].brightness} handleHover={changeSelected} selected={selected.includes(resultsData[i].id) ?  true: false}/>);
    }
    
    return(
        <tr>
            {resultElems}
        </tr>
    );
}

export function ResultsTable(props){
    const resLists = props.resultLists;
    let resultRows = [];
    for(let i=0; i<resLists.length; i++){
        resultRows.push(<ResultsTableRow key={i} results={resLists[i]}/>);
    }

    return(
        <table>
            <tbody>
                {resultRows}
            </tbody>
        </table>
    )
}
