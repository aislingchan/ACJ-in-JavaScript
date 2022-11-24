import React, {useEffect, useState} from 'react';
import {ResultsTable} from './resultsTable.js';
import "./App.css";
import axios from 'axios';

const api = axios.create({
  baseURL: `http://localhost:3000/results`
});

function App() {
  const [results, setResults] = useState();

  useEffect(() => {
    console.log("useEffect in App");
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
    // <div>
    //   <Header title="Sample Course Title"/>
    //   <div>
    //     <SubmissionContainer side="left"/>
    //     <SubmissionContainer side="right"/>
    //   </div>
    // </div>

    <div>
      {console.log("in app component")}
      {results ? <ResultsTable resultLists={results}/> : null}
    </div>
  )
}

function Header(props){
  return (
    <div>
      <h1 className="heading">Adaptive Comparative Judgement Tool</h1>
      <hr/>
      <h3 className="heading">{props.title}</h3>
    </div>
  )
}

function SubmissionContainer(props){
  return (
    <div className="submissionContainer">
      <SubmissionDisplay/>
      <button>{props.side} is better</button>
      <CommentsContainer/>
    </div>
  )
}

function SubmissionDisplay(){
  return (
    <div>
      <p style={{borderStyle: "solid", borderWidth: "1px"}}>Display PDF of script here</p>
    </div>
  )
}

function CommentsContainer(){
  return (
    <div>
      <CommentsBox audience="students"/>
      <CommentsBox audience="admin staff"/>
    </div>
  )
}

function CommentsBox(props){
  return (
    <div>
      <p>Comments for {props.audience}</p>
      <textarea></textarea>
    </div>
  )
}

export default App