export const parseDate = (dateString: string, format: string = "dd/mm/yyyy"): Date => {
    let day: number | undefined;
    let month: number | undefined;
    let year: number | undefined;

    switch (format) {
        case "dd/mm/yyyy":
            [day, month, year] = dateString.split('/').map(Number);
            break;
        case "yyyy-mm-dd":
            [month, day, year] = dateString.split('/').map(Number);
            break;
        default:
            throw new Error("Unsupported date format");
    }

    if (day === undefined || month === undefined || year === undefined) {
        throw new Error("Invalid date format");
    }

    return new Date(year, month - 1, day);
};
