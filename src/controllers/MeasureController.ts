import { Request, Response } from 'express';
import { GeminiService } from '../services/gemini.service';
import Measure from '../models/Measure';
import { MeasureRepository } from '../repository/MeasureRepository';
import path from 'path';
import fs from 'fs';
import { parseDate } from '../utils/dateUtils';
import validate from 'uuid-validate';

export class MeasureController {

    private geminiService: GeminiService;
    private measureRepository: MeasureRepository;

    constructor() {
        this.geminiService = new GeminiService();
        this.measureRepository = new MeasureRepository();
    } 

    public uploadMeasure = async (req: Request, res: Response): Promise<void> => {
        try {           

            const { customer_code, measure_datetime } = req.body;
            const measure_type = req.body.measure_type.toUpperCase();

            const existingMeasure = await this.measureRepository.getMeasureByTypeForCurrentMonth({measure_type, measure_datetime, customer_code});

            if (existingMeasure) {
                res.status(409).json({
                    error_code: "DOUBLE_REPORT",
                    error_description: "A measure for this customer and type already exists for this month",
                });
                return;
            }

            if (!customer_code) {
                res.status(400).json({
                    error_code: "INVALID_DATA",
                    error_description: "customer_code is required",
                });
                return;
            }

            if (!measure_datetime) {
                res.status(400).json({
                    error_code: "INVALID_DATA",
                    error_description: "measure_datetime is required",
                });
                return;
            }

            let parsedDate: Date;
            try {
                parsedDate = parseDate(measure_datetime);
            } catch (error) {
                res.status(400).json({
                    error_code: "INVALID_DATA",
                    error_description: "measure_datetime is invalid or not in the correct format (dd/mm/yyyy)",
                });
                return;
            }

            if (!measure_type || !['WATER', 'GAS'].includes(measure_type)) {
                res.status(400).json({
                    error_code: "INVALID_DATA",
                    error_description: "measure_type is required and must be either 'WATER' or 'GAS'",
                });
                return;
            }

            if (!req.file) {
                res.status(400).json({
                    error_code: "INVALID_DATA",
                    error_description: "No file uploaded",
                });
                return;
            }
            const { mimetype, originalname, buffer } = req.file;

            const tempDir = path.join(__dirname, './../temp');

            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            const tempFilePath = path.join(tempDir, originalname);
            fs.writeFileSync(tempFilePath, buffer);

            const newImage = {
                filePath: tempFilePath,
                mimeType: mimetype,
                fileName: originalname,
            };

            const uri = await this.geminiService.uploadFileToGoogleManager(newImage);

            const measureDatetime = req.body.measure_datetime
            ? parseDate(req.body.measure_datetime)
            : new Date();

            const newMeasure = new Measure({
                customer_code,
                measure_datetime: measureDatetime,
                measure_type: measure_type,
                image_url: uri,
            });

            const response = await this.geminiService.analyzeImage(newMeasure, newImage, uri);
            newMeasure.confirmed_value = response;

            const savedMeasure = await this.measureRepository.uploadMeasure(newMeasure);
            
            fs.rmSync(tempDir, { recursive: true, force: true });

            res.status(200).json({
                image_url: savedMeasure.image_url,
                measure_value: savedMeasure.confirmed_value,
                measure_uuid: savedMeasure.measure_uuid,
            });

        } catch (error) {
            console.error('Error uploading measure: ' + error);
            res.status(500).json({ error: 'Failed uploading measure' });
        }
    }

    public confirmMeasure = async(req: Request, res: Response): Promise<void> => {
        try {
            const { measure_uuid, confirmed_value } = req.body;
            const measure = await this.measureRepository.getMeasureByUuid(measure_uuid);
            
            if (!measure_uuid) {
                res.status(400).json({
                    error_code: "INVALID_DATA",
                    error_description: "measure_uuid is required",
                });
                return;
            }

            if(measure_uuid && !validate(measure_uuid, 4)){
                res.status(400).json({
                    error_code: "INVALID_DATA",
                    error_description: "measure_uuid is invalid",
                });
                return;
            }                

            if (confirmed_value === undefined || confirmed_value === null) {
                res.status(400).json({
                    error_code: "INVALID_DATA",
                    error_description: "confirmed_value is required",
                });
                return;
            }

            if(!measure){
                res.status(404).json({
                    error_code: "MEASURE_NOT_FOUND",
                    error_description: "Leitura não encontrada",
                });
                return;
            }

            if(measure.has_confirmed){
                res.status(409).json({
                    error_code: "CONFIRMATION_DUPLICATE",
                    error_description: "Leitura do mês já realizada",
                });
                return;
            }

            await this.measureRepository.updateMeasure({ measure_uuid, confirmed_value }, measure);

            res.status(200).json({ success: true });

        }catch (error) {
            console.error('Error confirming measure: '+ error);
            res.status(500).json({ error: 'Failed confirming measure' });
        }
    }

    public getMeasureByCustomerCode = async(req: Request, res: Response): Promise<void> => {
        try {
            const measureType = req.query.measure_type as string;
            
            if(measureType && measureType.length === 1) {
                res.status(400).json({
                    error_code: "INVALID_TYPE",
                    error_description: "Tipo de medição não permitida",
                });
                return;
            }

            if (measureType && !['WATER', 'GAS'].includes(measureType.toUpperCase())) {
                res.status(400).json({
                    error_code: "INVALID_TYPE",
                    error_description: "Tipo de medição não permitida",
                });
                return;
            }


            const customer_code = req.params.customer_code;
            const measures = await this.measureRepository.getMeasureByCustomerCode({customer_code, measureType});;

            if (measures.length === 0) {
                res.status(404).json({
                    error_code: "MEASURES_NOT_FOUND",
                    error_description: "Nenhuma leitura encontrada",
                });
                return;
            }
    
            res.status(200).json({ customer_code: customer_code, measures });
        } catch (error) {
            console.error('Error getting measure by customer code: '+ error);
            res.status(500).json({ error: 'Failed getting measure by customer code' });
        }
    }
}



