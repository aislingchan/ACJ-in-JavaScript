import React from 'react'

function App() {
  return (
    <div>
      <Header title="Sample Course Title"/>
      <div>
        <SubmissionContainer side="left"/>
        <SubmissionContainer side="right"/>
      </div>
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