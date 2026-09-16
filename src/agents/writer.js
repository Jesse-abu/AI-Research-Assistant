import Groq from 'groq-sdk';
import { logStep } from '../state/pipelineState.js';

const openai = new Groq({
  apiKey: process.env.OPENAI_API_KEY || ''
});


function formatResearchContext(researchData) {
    if (!researchData || researchData.length === 0) {
        return 'No external research available.';
    }

    return researchData.map((item, idx) => {
        const snippets = item.results.map(r => `- ${r.title}: ${r.content}`).join('\n');
        return `Query ${idx + 1}: ${item.query}\nFindings:\n${snippets}`;
    }).join('\n\n');
}

export async function runWriterAgent(state) {
    state.status = 'WRITING';
    logStep(state, 'Writer', 'Synthesizing research data and generating draft...');

    const contextText = formatResearchContext(state.researchData);

    const systemPrompt = `You are a professional technical researcher and writer. 
        Your goal is to write a comprehensive, well-structured research report in Markdown based on the provided findings.
    Structure your report as follows:
        # Title
        ## Executive Summary
        ## Key Insights & Analysis
        ## Strategic Implications
        ## Conclusion`;

    const userPrompt = `Topic: "${state.topic}"
        Research Findings:
        ${contextText}
        Write a detailed, cohesive report synthesizing these facts. 
        Maintain an authoritative tone and avoid speculation.`;

    try {
        if (!process.env.OPENAI_API_KEY) {
        logStep(state, 'Writer', '[Warning]: Missing OPENAI_API_KEY. Generating fallback synthetic draft.');
        state.draft = `# ${state.topic}\n\n## Executive Summary\nSynthetic summary based on gathered data.\n\n## Key Insights\n- Insight 1 from state research.`;
        state.status = 'WRITING_COMPLETE';
        return state;
        }

        const response = await openai.chat.completions.create({
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ],
        "model": "openai/gpt-oss-120b",
        "temperature": 1,
        "max_completion_tokens": 2048,
        "stream": false,
        "reasoning_effort": "medium",
        "stop": null
        });

        state.draft = response.choices[0].message.content;
        logStep(state, 'Writer', 'Draft completed successfully.');
        state.status = 'WRITING_COMPLETE';
        return state;

    } catch (err) {
        state.errors.push(`Writer Error: ${err.message}`);
        state.status = 'FAILED';
        return state;
    }
}