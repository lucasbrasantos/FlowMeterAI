import { GEMINI_API_KEY } from '../config/config';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from "@google/generative-ai/server";
import Measure from '../models/Measure';
import { log } from 'node:console';

export class GeminiService {
    
    private genAI: GoogleGenerativeAI;
    private textModel: GenerativeModel;

    private fileManager: GoogleAIFileManager;

    constructor() {
        this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

        this.textModel = this.genAI.getGenerativeModel({
            model: "gemini-1.5-flash"
        });

        this.fileManager = new GoogleAIFileManager(GEMINI_API_KEY);
    }

    public async analyzeImage(measure: Measure, image: any, uri: string): Promise<number> {
        try {
            const prompt = `
                Analyze the uploaded image of a ${measure.measure_type} meter. The image contains a meter (such as a water clock meter or gas meter) with a numeric value displayed. Your task is to accurately extract and return the numeric value shown on the meter in the image.
                Please ensure the following:
                 - Detect and read the numeric value from the display of the meter as accurately as possible.
                 - Return the extracted value as an integer or decimal number, ONLY THE VALUE EXTRACTED, WITH NO TEXTS.
                 - Do not include any additional text or explanations in your response.
                 - If the meter display is unclear or not readable or isnt a display, return the value as 0.
            `;

            const result = await this.textModel.generateContent([
                {
                  fileData: {
                    mimeType: image.mimeType,
                    fileUri: uri
                  }
                },
                { text: prompt },
            ]);

            const value = result.response.text();
            return parseInt(value, 10);

        } catch (error) {
            console.error('Error analyzing image:', error);
            throw new Error('Error analyzing image.');
        }
    }

    public async uploadFileToGoogleManager(image: any): Promise<string> {
        try {

            const uploadResponse = await this.fileManager.uploadFile(image.filePath, {
                mimeType: image.mimeType,
                displayName: image.fileName,
            });

            // console.log(`Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`);

            return uploadResponse.file.uri;

        } catch (error) {
            console.log('Error uploading file to Google Manager:', error);
            throw new Error('Error uploading file to Google Manager.');
        }        
    }
}
