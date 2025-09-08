
import { Request, Response } from 'express';
import { GoogleGenAI, Type } from "@google/genai";
import { ParsedReceipt } from '../../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
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


export const parseReceipt = async (req: Request, res: Response) => {
    try {
        const { imageBase64, mimeType } = req.body;

        if (!imageBase64 || !mimeType) {
            return res.status(400).json({ message: 'Missing imageBase64 or mimeType in request body.' });
        }

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

        if (
            !parsedJson.vendorName ||
            !parsedJson.totalAmount ||
            !Array.isArray(parsedJson.items)
        ) {
            throw new Error("Invalid JSON structure received from API.");
        }

        res.status(200).json(parsedJson as ParsedReceipt);

    } catch (error) {
        console.error("Error in backend receipt parser:", error);
        res.status(500).json({ message: "Failed to parse the receipt. The image might be unclear or the format unsupported." });
    }
};