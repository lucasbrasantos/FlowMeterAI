import {Router} from 'express';
import { MeasureController } from '../controllers/MeasureController';
import multer from 'multer';

const storage = multer.memoryStorage();
const imageUpload = multer({storage: storage});

const router = Router();


const measureController = new MeasureController();
router.post('/upload', imageUpload.single("image"), measureController.uploadMeasure);
router.get('/:customer_code/list', measureController.getMeasureByCustomerCode);
router.patch('/confirm', measureController.confirmMeasure);

export default router;
