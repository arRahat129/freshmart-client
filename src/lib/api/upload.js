'use server';

export const uploadImage = async (fileFormData) => {
    try {
        const uploadApiUrl = process.env.IMAGE_UPLOAD_API_URL;
        if (!uploadApiUrl) {
            throw new Error("IMAGE_UPLOAD_API_URL is not defined in environment variables.");
        }

        const res = await fetch(uploadApiUrl, {
            method: 'POST',
            body: fileFormData
        });

        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Image upload error:", error);
        throw error;
    }
};