import React from 'react';
import {Link} from 'react-router-dom'

function TempHome(){
    return(
        <div>
            <h1>ACJ in JavaScript</h1>
            <h3>Temporary Home Page</h3>
            <ul>
                <li><Link to="/results">ACJ Results</Link></li>
                <li><Link to="/login">Log in</Link></li>
                <li><Link to="/judging">Begin Judging</Link></li>
            </ul>
        </div>
    )
}

export default TempHome