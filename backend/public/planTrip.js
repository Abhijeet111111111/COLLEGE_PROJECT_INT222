  document.getElementById('ai-planner-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // UI States
            const btn = document.getElementById('submit-btn');
            const btnText = document.getElementById('btn-text');
            const loader = document.getElementById('btn-loader');
            const resultDiv = document.getElementById('ai-result');
            const placeholder = document.getElementById('output-placeholder');
            const statusText = document.getElementById('status-text');
            
            btn.disabled = true;
            btnText.textContent = "AI is thinking...";
            loader.style.display = "block";
            
            placeholder.style.display = "block";
            statusText.textContent = "Generating your perfect trip... This might take a few seconds ✈️";
            resultDiv.style.display = "none";
            resultDiv.innerHTML = "";

            // Gather Data
            const data = {
                destination: document.getElementById('p-destination').value,
                weather: document.getElementById('p-weather').value,
                rush: document.getElementById('p-rush').value,
                cuisine: document.getElementById('p-cuisine').value
            };

            try {
                const response = await fetch('/plan-trip/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    placeholder.style.display = "none";
                    resultDiv.style.display = "block";
                    resultDiv.innerHTML = marked.parse(result.data);
                } else {
                    placeholder.style.display = "block";
                    statusText.textContent = "Oops! " + (result.message || 'Something went wrong.');
                }
            } catch (err) {
                console.error(err);
                placeholder.style.display = "block";
                statusText.textContent = "Network error. Please try again later.";
            } finally {
                btn.disabled = false;
                btnText.textContent = "Generate Trip";
                loader.style.display = "none";
            }
        });