import mongoose from 'mongoose';
import BaseModel from '../base-model';
import { options as CATEGORY_TYPE } from './meter-reading-category';

class MeterReading extends BaseModel {
	constructor(){
		super();
		this.setSchema({
			total : {
				type : Number,
				required : true
			},
			category : {
				type : String,
				enum : CATEGORY_TYPE,
				required : true
			}
		});
	}
}

MeterReading._collection = 'MeterReading';

const self = new MeterReading();

export default self.mongoose.model(MeterReading._collection, self.schema);