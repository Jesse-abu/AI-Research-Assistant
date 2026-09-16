import axios from "axios";

export async function searchWeb(query) {
    const apiKey = process.env.SERPER_API_KEY;

    if (!apiKey) {
        console.warn("[Tool Warning]: Missing SERPER_API_KEY");
        return [];
    }

    try {
        const response = await axios.post(
            "https://google.serper.dev/search",
            { q: query, num: 3 },
            { headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' } }
        );

        const organic = response.data.organic || [];
        return organic.map(item => ({
            title: item.title,
            url: item.link,
            content: item.snippet ? item.snippet.slice(0, 300) : ''
        }));
    } catch (error) {
        console.error("Serper search tool error:", error.message);
        return [];
  }
}