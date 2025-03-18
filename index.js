import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import fetch from "node-fetch";

const app = express();
const port = 3000;
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "postgres",
    password: "Password",
    port: "5432",
});

const libary = "https://openlibrary.org";


db.connect();


app.use(bodyParser.urlencoded({ extended: true })); 

app.get("/", async (req, res) => {
    try {
        // Get titles and notes from database in a single query
        const query = `
            SELECT title, note, date as header_date
            FROM books 
            WHERE title ILIKE '%rules%'
        `;
        const result = await db.query(query);
        const bookRecords = result.rows;

        // Fetch book data from Open Library
        const bookPromises = bookRecords.map(async (record) => {
            // Format title by replacing spaces with plus signs
            const formattedTitle = record.title.replace(/\s+/g, '+');
            const searchUrl = `${libary}/search.json?q=${formattedTitle}&fields=*,availability&limit=1`;
            
            console.log('Searching:', searchUrl); // Debug log

            const response = await fetch(searchUrl);
            const data = await response.json();
            
            if (data.docs && data.docs.length > 0) {
                const book = data.docs[0];
                const coverUrl = book.cover_i 
                    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` 
                    : '/default-cover.jpg';  // Add a default cover image

                return {
                    title: record.title,
                    cover_id: coverUrl,
                    author: book.author_name ? book.author_name[0] : 'Unknown',
                    published_date: book.first_publish_year || 'Unknown',
                    header_date: record.header_date,
                    notes: record.note || 'No notes available'
                };
            }
            return null;
        });

        const books = (await Promise.all(bookPromises)).filter(book => book !== null);
        
        console.log('Books data:', books); // Debug log
        
        res.render("index.ejs", { books });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error processing request");
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});