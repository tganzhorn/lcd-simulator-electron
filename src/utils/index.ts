export const fillZeroes = (string: string, length: number) => {
    if (string.length === length) return string;

    let tmp = string;
    for (let i = string.length; i < length; i++) {
        tmp = "0" + tmp;
    }   
    return tmp;
}
