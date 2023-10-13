function convertDate(date) {
    const event = new Date(date);
    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    };

    return event.toLocaleDateString("id-ID", options);
}

module.exports = {
    convertDate,
};
