document.addEventListener('DOMContentLoaded', () => {
    const selectedTextElement = document.getElementById('selected-text');
    const chatGPTResponseElement = document.getElementById('chatgpt-response');
    const getChatGPTResponseButton = document.getElementById('get-chatgpt-response');

    console.log({ getChatGPTResponseButton, chatGPTResponseElement, selectedTextElement })
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript(
            {
                target: { tabId: tabs[0].id },
                function: getSelectedText,
            },
            (result) => {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                    return;
                }
                selectedTextElement.textContent = result[0].result.text;
            }
        );
    });

    getChatGPTResponseButton.addEventListener('click', async () => {
        const selectedText = selectedTextElement.textContent;
        try {
            const chatGPTResponse = await fetchChatGPTResponse(selectedText);
            chatGPTResponseElement.textContent = chatGPTResponse;
        } catch (error) {
            console.error('Error fetching ChatGPT response:', error);
        }
    });
});

async function getSelectedText() {
    const selectedText = window.getSelection().toString();
    return { text: selectedText };
}

async function fetchChatGPTResponse(prompt) {
    console.log('fetchChatGPTResponse called');
    const apiKey = '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';
    const url = 'https://api.openai.com/v1/engines/text-davinci-002/completions';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                prompt: prompt,
                max_tokens: 50,
                n: 1,
                stop: null,
                temperature: 1,
            }),
        });

        const data = await response.json();
        console.log('ChatGPT response:', data.choices[0].text.trim());
        return data.choices[0].text.trim();
    } catch (error) {
        console.error('Error in fetchChatGPTResponse:', error);
        throw error;
    }
}
