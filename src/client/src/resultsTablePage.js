import React, {useEffect, useState} from 'react';
import {ResultsTable} from './resultsTable.js';
import "./App.css";
import axios from 'axios';
import { Link } from 'react-router-dom';

const api = axios.create({
  baseURL: `http://localhost:3000/results`
});

function ResultsTablePage() {
  const [results, setResults] = useState();

  useEffect(() => {
    const getResultsData = async() => {
      try{
          api.get('/').then(res => {
            let resultLines = res.data.split('\n');
            let resultObjects = [];
            for(let l of resultLines){
                if(l){
                    let results = l.split('/');
                    let r = results.map(x => JSON.parse(x));
                    resultObjects.push(r);
                }
            }
            setResults(resultObjects);
            //console.log(resultObjects);
          }).catch((err) => {
            if(err.response){
              console.log(err.response.data);
            }
          })
      }
      catch(error){
        console.log(error);
      }
    }
    getResultsData();
  }, []);

  useEffect(() => {
    console.log(results);
  }, [results])

  return (
    <div>
      {results ? <ResultsTable resultLists={results}/> : null}
      <div><Link to="/">Home</Link></div>
    </div>
  )
}

export default ResultsTablePage