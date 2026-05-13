async function loadQuotes() {
    try {
        const response = await fetch ('quotes.json')
        const survivorQuotes = await response.json();
        console.log("data loaded", survivorQuotes);
        return survivorQuotes;
    } catch (error) {
        console.error("Failed to load data:", error);
        throw new Error("Could not load data");
    }
}

export default loadQuotes