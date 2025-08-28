
import React, { useState, useCallback } from 'react';
import Card from './Card';
import { parseReceiptWithGemini } from '../services/geminiService';
import type { ParsedReceipt } from '../types';
import { TransactionType } from '../types';
import { SparklesIcon, ReceiptIcon } from './icons/IconComponents';

const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
    return {
      base64: await base64EncodedDataPromise,
      mimeType: file.type
    };
};

const ReceiptParser: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [parsedData, setParsedData] = useState<ParsedReceipt | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setError(null);
        setParsedData(null);
        setImagePreview(URL.createObjectURL(file));

        try {
            const { base64, mimeType } = await fileToGenerativePart(file);
            const result = await parseReceiptWithGemini(base64, mimeType);
            setParsedData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800 flex items-center">
                    <SparklesIcon className="w-8 h-8 mr-3 text-indigo-500"/>
                    AI Receipt Scanner
                </h1>
            </div>
            <p className="text-slate-600 max-w-2xl">
                Upload an image of a receipt, and our AI will automatically extract the details to help you log your expenses faster than ever.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <Card>
                        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-xl">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Receipt preview" className="max-h-64 w-auto rounded-lg mb-4"/>
                            ) : (
                                <ReceiptIcon className="w-16 h-16 text-slate-400 mb-4" />
                            )}
                            <h3 className="text-lg font-semibold text-slate-700 mb-2">Upload your receipt</h3>
                            <p className="text-sm text-slate-500 mb-4">PNG, JPG, or WEBP files are accepted.</p>
                            <input
                                type="file"
                                id="receipt-upload"
                                className="hidden"
                                accept="image/png, image/jpeg, image/webp"
                                onChange={handleFileChange}
                                disabled={isLoading}
                            />
                            <label
                                htmlFor="receipt-upload"
                                className={`px-6 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${isLoading ? 'bg-slate-300 text-slate-500' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                            >
                                {isLoading ? 'Processing...' : 'Choose File'}
                            </label>
                        </div>
                    </Card>
                </div>

                <div>
                    <Card title="Extracted Information">
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center h-full p-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div>
                                <p className="mt-4 text-slate-600">AI is reading your receipt...</p>
                            </div>
                        )}
                        {error && <div className="text-red-600 bg-red-100 p-4 rounded-lg">{error}</div>}
                        {!isLoading && !error && !parsedData && (
                            <div className="text-center text-slate-500 p-8">
                                Your parsed receipt data will appear here.
                            </div>
                        )}
                        {parsedData && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-baseline">
                                    <p className="text-lg font-bold text-slate-800">{parsedData.vendorName}</p>
                                    <p className="text-sm text-slate-500">{parsedData.transactionDate}</p>
                                </div>
                                <div className="border-t border-slate-200 pt-4">
                                    <ul className="space-y-2">
                                        {parsedData.items.map((item, index) => (
                                            <li key={index} className="flex justify-between items-center text-sm">
                                                <span className="text-slate-700">{item.quantity} x {item.itemName}</span>
                                                <span className="font-medium text-slate-600">${item.price.toFixed(2)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="border-t border-slate-200 pt-3 mt-3 flex justify-between items-center font-bold text-lg">
                                    <span className="text-slate-800">Total</span>
                                    <span className="text-indigo-600">${parsedData.totalAmount.toFixed(2)}</span>
                                </div>
                                <button className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-500 transition-colors mt-4">
                                    Add as Expense
                                </button>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ReceiptParser;
