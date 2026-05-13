async function loadGroupedData() {
    try {
        const response = await fetch ('grouped.json')
        const groupedRaceData = await response.json();
        console.log("data loaded", groupedRaceData);
        return groupedRaceData;
    } catch (error) {
        console.error("Failed to load data:", error);
        throw new Error("Could not load data");
    }
}

export default loadGroupedData