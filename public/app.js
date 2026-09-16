async function startPipeline() {
    const topicInput = document.getElementById('topicInput');
    const btn = document.getElementById('runBtn');
    const logOutput = document.getElementById('logOutput');
    const draftOutput = document.getElementById('draftOutput');

    const topic = topicInput.value.trim();

    if (!topic) {
        alert('Please enter a valid topic.');
        return;
    }

    btn.disabled = true;
    logOutput.textContent = '[System]: Dispatching request to pipeline orchestrator...';
    draftOutput.textContent = 'Generating...';

    try {
        const response = await fetch('/api/pipeline/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
        });

        const result = await response.json();

        if (!result.success) {
        logOutput.textContent = `[Error]: ${result.error || 'Pipeline execution failed.'}`;
        draftOutput.textContent = 'Execution failed.';
        } else {
        logOutput.textContent = result.data.logs.join('\n');
        draftOutput.innerHTML = result.data.draft.replace(/\n/g, '<br>');
        }
    } catch (err) {
        logOutput.textContent = `[Network Error]: ${err.message}`;
        draftOutput.textContent = 'Error loading report.';
    } finally {
        btn.disabled = false;
    }
}

document.getElementById('runBtn').addEventListener('click', startPipeline);

document.getElementById('topicInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    startPipeline();
  }
});