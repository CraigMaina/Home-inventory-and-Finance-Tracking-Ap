
import { GoogleGenAI, Type } from "@google/genai";
import type { ParsedReceipt } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd handle this more gracefully, but for this context, an error is fine.
  // The environment is expected to have the API_KEY.
  console.error("API_KEY is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const receiptSchema = {
    type: Type.OBJECT,
    properties: {
        vendorName: {
            type: Type.STRING,
            description: "The name of the store or vendor from the receipt.",
        },
        transactionDate: {
            type: Type.STRING,
            description: "The date of the transaction in YYYY-MM-DD format.",
        },
        totalAmount: {
            type: Type.NUMBER,
            description: "The final total amount paid on the receipt.",
        },
        items: {
            type: Type.ARRAY,
            description: "An array of items purchased.",
            items: {
                type: Type.OBJECT,
                properties: {
                    itemName: {
                        type: Type.STRING,
                        description: "The name of a single item.",
                    },
                    quantity: {
                        type: Type.NUMBER,
                        description: "The quantity of the item purchased. Default to 1 if not specified.",
                    },
                    price: {
                        type: Type.NUMBER,
                        description: "The total price for this line item.",
                    },
                },
                required: ["itemName", "price", "quantity"],
            },
        },
    },
    required: ["vendorName", "transactionDate", "totalAmount", "items"],
};

/**
 * Parses a receipt image and returns structured data.
 * @param imageBase64 The base64 encoded image data.
 * @param mimeType The MIME type of the image (e.g., 'image/jpeg').
 * @returns A promise that resolves to the parsed receipt data.
 */
export const parseReceiptWithGemini = async (imageBase64: string, mimeType: string): Promise<ParsedReceipt> => {
    try {
        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: mimeType,
            },
        };

        const textPart = {
            text: "Extract the vendor name, transaction date, total amount, and a list of all items with their quantity and price from this receipt. Provide the response in the specified JSON schema.",
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: receiptSchema,
            },
        });

        const jsonString = response.text;
        const parsedJson = JSON.parse(jsonString);
        
        // Basic validation to ensure the response matches the expected structure
        if (
            !parsedJson.vendorName ||
            !parsedJson.totalAmount ||
            !Array.isArray(parsedJson.items)
        ) {
            throw new Error("Invalid JSON structure received from API.");
        }
        
        return parsedJson as ParsedReceipt;

    } catch (error) {
        console.error("Error parsing receipt with Gemini:", error);
        throw new Error("Failed to parse the receipt. The image might be unclear or the format unsupported.");
    }
};
