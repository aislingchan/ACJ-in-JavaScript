import React from 'react';
import {Link} from 'react-router-dom';

function LoginPage(){
    return(
        <div>
            <h1>Log in</h1>
            <button>Click here to log in with Microsoft</button>
            <div>
                <Link to="/">Home</Link>
            </div>
        </div>
    );
}

export default LoginPage