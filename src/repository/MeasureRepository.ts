import { Op } from 'sequelize';
import Measure from '../models/Measure';
import { parseDate } from '../utils/dateUtils';


interface IMeasureRepository{
    uploadMeasure(measure: Measure): Promise<Measure>;
    updateMeasure(confirm_data: any, measure: Measure): Promise<void>;
    getMeasureByCustomerCode(customer_data: any): Promise<Measure[]>;
    getMeasureByUuid(measure_uuid: string): Promise<Measure | null>;
    getMeasureByTypeForCurrentMonth(measure_data: any): Promise<Measure | boolean>;
}

export class MeasureRepository implements IMeasureRepository{
    
    async uploadMeasure(measure: Measure): Promise<Measure> {
        try {
            return await Measure.create({
                customer_code: measure.customer_code,
                measure_datetime: measure.measure_datetime,
                measure_type: measure.measure_type,
                has_confirmed_value: measure.has_confirmed,
                image_url: measure.image_url,
                confirmed_value: measure.confirmed_value,
            });

        } catch (error) {
            console.log("Failed to upload measure: ", error);
            throw new Error("Failed to upload measure");
        }
    }

    async updateMeasure(confirm_data: any, measure: Measure): Promise<void> {
        try {
            const { measure_uuid, confirmed_value } = confirm_data;
            
            measure.confirmed_value = confirmed_value;
            measure.has_confirmed = true;
            await measure.save();

        } catch (error) {
            console.log("Failed to update measure: ", error);
            throw new Error("Failed to update measure");
        }
    }

    async getMeasureByCustomerCode(customer_data: any): Promise<Measure[]> {
        const { customer_code, measureType } = customer_data;

        try {                        
            const measure = await Measure.findAll({
                attributes:{
                    exclude: ['customer_code'],
                },
                where: {
                    customer_code: customer_code,
                    [Op.and]: [
                        measureType ? {
                            measure_type: measureType.toUpperCase(),
                        } : {}
                    ]
                },
                order: [
                    ['measure_datetime', 'DESC'],
                ],
            })

            return measure;
            
        } catch (error) {
            console.log("Failed to get measure by customer code: ", error);
            throw new Error("Failed to get measure by customer code");
        }
    }

    async getMeasureByUuid(measure_uuid: string): Promise<Measure | null> {
        try {
            const measure =  await Measure.findOne({
                where: {
                    measure_uuid: measure_uuid,
                },
            })
            console.log("measure: ", measure);


            return measure || null;

        } catch (error) {
            console.log("Failed to get measure by uuid: ", error);
            throw new Error("Failed to get measure by uuid");
        }
    }

    async getMeasureByTypeForCurrentMonth(measure_data: any): Promise<Measure | boolean> {
        try {
            const { customer_code, measure_type, measure_datetime } = measure_data;

            const measureDatetime = measure_datetime
            ? parseDate(measure_datetime)
            : new Date();

            const measureMonth = measureDatetime.getMonth();
            const measureYear = measureDatetime.getFullYear();

            const firstDayOfMonth = new Date(measureYear, measureMonth, 1);
            const lastDayOfMonth = new Date(measureYear, measureMonth + 1, 0);
            
            const measure = await Measure.findOne({
                where: {
                    customer_code: customer_code,
                    measure_type: measure_type,
                    measure_datetime: {
                        [Op.between]: [firstDayOfMonth, lastDayOfMonth]
                    }
                },
                order: [
                    ['measure_datetime', 'DESC'],
                ],
            })

            return measure ? measure : false;

        }catch (error) {
            console.log("Failed to get measure by type: ", error);
            throw new Error("Failed to get measure by type");
        }
    }
}