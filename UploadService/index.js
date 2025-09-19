import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import { generate } from "./utils/utils.js";

const app = express();
app.use(cors())
app.use(express.json());

// POSTMAN
app.post("/deploy", async (req, res) => {
    const repoUrl = req.body.repoUrl;
    const id = generate(); // asd12
    await simpleGit().clone(repoUrl, `output/${id}`);

    res.json({
        id: id
    })
});

app.listen(3000);