import React, {useEffect} from 'react'
import axios from 'axios';

const api = axios.create({
    baseURL: `http://localhost:3000/results`
  });

function ResultsTableElem(props){
    return(
        <td style={{filter: `brightness(${props.brightness})`}}>
            {props.subId}. brightness rating: {props.brightness}
        </td>
    );
}

function ResultsTableRow(props){
    const resultsData = props.results;
    let resultElems = [];
    for(let i=0; i<resultsData.length ; i++){
        resultElems.push(<ResultsTableElem key={resultsData[i].id} subId={resultsData[i].id} brightness={resultsData[i].brightness}/>)
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
