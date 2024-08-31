import { DataTypes, Model} from "sequelize";
import database from '../config/database';


class Measure extends Model{
    declare measure_uuid: string;
    declare customer_code: string;
    declare measure_datetime: Date;
    declare measure_type: string;
    declare has_confirmed: boolean;
    declare image_url: string;
    declare confirmed_value: number;
}

Measure.init(
    {
        measure_uuid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        customer_code: {
            type: DataTypes.STRING,
            allowNull: false,
            // references:{
            //     model: Customer,
            //     key: 'customer_code'
            // }
        },
        measure_datetime: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        measure_type: {
            type: DataTypes.ENUM('WATER', 'GAS'),
            allowNull: false,
        },
        has_confirmed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        image_url: {
            type: DataTypes.STRING,
        },
        confirmed_value: {
            type: DataTypes.INTEGER,

        }
    }, {
        sequelize: database.connection,
        tableName: 'measure',
        timestamps: false,        
    }
);

export default Measure;


