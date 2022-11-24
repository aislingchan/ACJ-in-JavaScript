import express from "express";
import {runACJ} from "./main.js";

const app = express();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3001");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', (req, res) => {
    res.send("ACJ in JavaScript Project");
})

app.get('/results', (req, res) => {
    runACJ().then((data) => res.send(data));
    //res.send("here is some data");
})

app.listen(3000);