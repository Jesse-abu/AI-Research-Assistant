import express, { json } from "express";
import "dotenv/config"
import cors from "cors";
import pipelineRoutes from "./routes/pipelineRoutes.js";

const app = express();
const PORT = process.env.PORT;

app.use(cors())
app.use(express.json());
app.use(express.static("public"));

//routes
app.use('/api/pipeline', pipelineRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Pipeline server is operational.' });
});

app.listen(PORT, () => {
    console.log(`Server live on http://localhost:${PORT}`);
});