export const printTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString() + ":" + fillZeroes("" + timestamp.getMilliseconds(), 3);
}

export const fillZeroes = (string: string, length: number) => {
    if (string.length === length) return string;

    let tmp = string;
    for (let i = string.length; i < length; i++) {
        tmp = "0" + tmp;
    }   
    return tmp;
}
