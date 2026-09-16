import { createInitialState, logStep } from "../state/pipelineState.js";
import { runResearcherAgent } from "./researcher.js";
import { runWriterAgent } from "./writer.js";

export async function executePipeline(topic) {
    let state = createInitialState(topic);
    logStep(state, 'Orchestrator', 'Pipeline execution started.');

    //running researcher for context
    state = await runResearcherAgent(state);
    if (state.status === 'FAILED') {
        logStep(state, 'Orchestrator', 'Pipeline terminated due to node errors.');
        return state;
    }

    //running writer to draft report
    state = await runWriterAgent(state);
    if (state.status === "FAILED") {
        logStep(state, 'Orchestrator', 'Pipeline terminated a dragt generation');
        return state;
    }

    state.status = 'COMPLETED';
    logStep(state, 'Orchestrator', 'Pipeline completed successfully.');
    return state;
}