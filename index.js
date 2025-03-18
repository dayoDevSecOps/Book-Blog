import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "Books",
    password: "Password",
    port: "5432",
});

db.connect();


app.use(bodyParser.urlencoded({ extended: true })); 

app.get("/", (req, res) => {
    res.render("index.ejs")
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});