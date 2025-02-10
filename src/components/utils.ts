export function capitalizeFirstLetter(val: string) {
    return val.split(" ").map((word: string) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(" ");
}