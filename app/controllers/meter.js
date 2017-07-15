import _ from 'lodash';
import co from 'co';
import MeterReading from '../models/meter/meter-readings';
import {options as CATEGORY_TYPE, default as CATEGORY} from '../models/meter/meter-reading-category';

export const addMeterReading = co.wrap(function*(socket,io, data){
	try{
		console.log('New Reading : ', data);
		if(data){
			const meterReading = new MeterReading(data);
			if(CATEGORY_TYPE.indexOf(meterReading.category) >= 0){
				const savedMeterReading = yield meterReading.save();
				// socket.emit('addMeterReadingResponse', savedMeterReading);
				// const query = {
				// 	category : meterReading.category
				// };
				// const newCategoryData = yield MeterReading.find(query).exec();
				// if(newCategoryData){
					io.emit('updateCategoryGraph', {category : meterReading.category, meterReading : meterReading});
				// }
				return;
			}
			console.log('Category not matched : ', meterReading.category);
			socket.emit('addMeterReadingResponse', null);
			return;
		}
		console.log('Data not found');
		return;
	}catch(err){
		console.log('Error in addMeterReading : ', err);
		socket.emit('addMeterReadingResponse', null);
		return;
	}
});

const convertArrayToObjWithKey = (arr, key) => {
	const obj = {};
	for(let item of arr){
		if(!obj[item[key]]){
			obj[item[key]] = [];
		}
		obj[item[key]].push(item);
	}
	return obj;
}

export const initGraph = co.wrap(function*(socket){
	try{
		const meterReadings = yield MeterReading.find().exec();
		if(meterReadings && meterReadings.length > 0){
			console.log(meterReadings);
			const meterReadingByCategory = convertArrayToObjWithKey(meterReadings, 'category');
			console.log(meterReadingByCategory);
			if(meterReadingByCategory){
				console.log('meterReading : ', meterReadingByCategory);
				socket.emit('initGraphResponse', meterReadingByCategory);
				return;
			}
			console.log('data not present');
		}
		console.log('No MeterReading present');
		socket.emit('initGraphResponse', null);
		return;
	}catch(err){
		console.log('Error in initGraph : ', err);
		return;
	}
});