import { uniqueNamesGenerator, NumberDictionary, animals } from "unique-names-generator";

const generateUniqueName = (): string => {
    const numberDictionary = NumberDictionary.generate({ min: 1000, max: 9999 });
    const name = uniqueNamesGenerator({
        dictionaries: [animals, numberDictionary],
        style: 'capital',
        separator: ""
    })
    return name;
}

export default generateUniqueName;