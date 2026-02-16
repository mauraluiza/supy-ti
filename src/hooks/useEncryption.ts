import CryptoJS from 'crypto-js';

const SECRET_KEY = "SUPPY_DEV_SECRET_KEY_123"; // TODO: Move to .env in production

export const useEncryption = () => {

    const encryptData = (text: string): string => {
        if (!text) return "";
        return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
    };

    const decryptData = (cipherText: string): string => {
        if (!cipherText) return "";
        try {
            const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
            return bytes.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            console.error("Erro ao descriptografar:", error);
            return "";
        }
    };

    return { encryptData, decryptData };
};
