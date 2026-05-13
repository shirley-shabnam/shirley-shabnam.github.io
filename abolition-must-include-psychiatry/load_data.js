async function loadData() {
    try {
        const response = await fetch ('prison-disparity.json')
        const prisonDisparity = await response.json();
        console.log("data loaded", prisonDisparity);
        return prisonDisparity;
    } catch (error) {
        console.error("Failed to load data:", error);
        throw new Error("Could not load data");
    }
}

export default loadData