import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { executePipeline } from '../agents/orchestrator.js';

const router = Router();

const pipelineLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        error: "Too many research requests from this IP address. Please try again in 15 minutes"
    }
})

router.post('/run', async (req, res) => {
    const { topic } = req.body;

    if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
        return res.status(400).json({
            success: false,
            error: 'Field "topic" is required and must be a non-empty string.'
        })
    };

    if (topic.length > 30) {
        return res.status(400).json({
            success: false,
            error: 'Topic length exceeds maximum limit of 30 characters'
        })
    };

    if (!topic) {
        return res.status(400).json({ error: 'Topic is required to run the pipeline.' });
    };

    const startTime = Date.now();

    try {
        const resultState = await executePipeline(topic.trim());
        const executionTime = Date.now() - startTime;

        return res.status(200).json({
            success: true,
            executionTime,
            data: resultState
        });

    } catch (err) {
        return res.status(404).json({
            success: false,
            error: 'Internal Server Error',
            details: err.message
        })
    }
});

export default router;