import express from "express";
import "dotenv/config"

const app = express();


app.get("/health", (req,res) => {
    res.json({
        status : "ok"
    })
})

const PORT = 4000;

app.listen(PORT,() => {
    console.log(`Server is running on port ${PORT}`);
})