export function createInitialState(topic) {
  return {
    topic,
    status: 'INITIALIZED',
    researchData: [],
    draft: "",
    verdict: null,
    errors: [],
    logs: []
  };
}

export function logStep(state, agentName, message) {
  const timestamp = new Date().toISOString();
  state.logs.push(`[${timestamp}] [${agentName}]: ${message}`);
}