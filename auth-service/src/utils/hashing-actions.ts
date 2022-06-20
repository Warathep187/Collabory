import bcrypt from "bcrypt";

export const hashPassword = async (password: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            resolve(hashedPassword);
        } catch (e) {
            reject(e);
        }
    });
};

export const comparePassword = async (enteredPassword: string, hashedPassword: string): Promise<boolean> => {
    return new Promise(async(resolve, reject) => {
        try {
            const isMatch = await bcrypt.compare(enteredPassword, hashedPassword);
            resolve(isMatch);
        }catch(e) {
            reject(e);
        }
    })
};
