import mockPlantingRecords from '@/services/mockData/plantingRecords.json';
import cropService from './cropService';
import fieldService from './fieldService';

class PlantingRecordService {
  constructor() {
    this.plantingRecords = [...mockPlantingRecords];
    this.nextId = Math.max(...this.plantingRecords.map(record => record.Id), 0) + 1;
  }

  async getAll() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Enrich with crop and field data
    const enrichedRecords = await Promise.all(
      this.plantingRecords.map(async (record) => {
        const crop = await cropService.getById(record.cropId);
        const field = await fieldService.getById(record.fieldId);
        
        return {
          ...record,
          cropName: crop?.name || 'Unknown Crop',
          fieldName: field?.name || 'Unknown Field'
        };
      })
    );
    
    return enrichedRecords.sort((a, b) => new Date(b.plantingDate) - new Date(a.plantingDate));
  }

  async getById(id) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid ID provided');
    }
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const record = this.plantingRecords.find(record => record.Id === id);
    if (!record) {
      throw new Error('Planting record not found');
    }
    
    // Enrich with crop and field data
    const crop = await cropService.getById(record.cropId);
    const field = await fieldService.getById(record.fieldId);
    
    return {
      ...record,
      cropName: crop?.name || 'Unknown Crop',
      fieldName: field?.name || 'Unknown Field'
    };
  }

  async create(recordData) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Validate required fields
    if (!recordData.cropId || !recordData.fieldId || !recordData.plantingDate || !recordData.seedQuantity) {
      throw new Error('Missing required fields');
    }
    
    // Validate crop and field exist
    await cropService.getById(recordData.cropId);
    await fieldService.getById(recordData.fieldId);
    
    const newRecord = {
      Id: this.nextId++,
      cropId: parseInt(recordData.cropId),
      fieldId: parseInt(recordData.fieldId),
      plantingDate: recordData.plantingDate,
      seedQuantity: parseFloat(recordData.seedQuantity),
      plantingMethod: recordData.plantingMethod || 'Direct Seeding',
      notes: recordData.notes || ''
    };
    
    this.plantingRecords.push(newRecord);
    
    // Return enriched record
    const crop = await cropService.getById(newRecord.cropId);
    const field = await fieldService.getById(newRecord.fieldId);
    
    return {
      ...newRecord,
      cropName: crop?.name || 'Unknown Crop',
      fieldName: field?.name || 'Unknown Field'
    };
  }

  async update(id, updates) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid ID provided');
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const index = this.plantingRecords.findIndex(record => record.Id === id);
    if (index === -1) {
      throw new Error('Planting record not found');
    }
    
    // Validate crop and field if provided
    if (updates.cropId) {
      await cropService.getById(parseInt(updates.cropId));
    }
    if (updates.fieldId) {
      await fieldService.getById(parseInt(updates.fieldId));
    }
    
    const updatedRecord = {
      ...this.plantingRecords[index],
      ...updates,
      Id: id, // Ensure ID doesn't change
      cropId: updates.cropId ? parseInt(updates.cropId) : this.plantingRecords[index].cropId,
      fieldId: updates.fieldId ? parseInt(updates.fieldId) : this.plantingRecords[index].fieldId,
      seedQuantity: updates.seedQuantity ? parseFloat(updates.seedQuantity) : this.plantingRecords[index].seedQuantity
    };
    
    this.plantingRecords[index] = updatedRecord;
    
    // Return enriched record
    const crop = await cropService.getById(updatedRecord.cropId);
    const field = await fieldService.getById(updatedRecord.fieldId);
    
    return {
      ...updatedRecord,
      cropName: crop?.name || 'Unknown Crop',
      fieldName: field?.name || 'Unknown Field'
    };
  }

  async delete(id) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid ID provided');
    }
    
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const index = this.plantingRecords.findIndex(record => record.Id === id);
    if (index === -1) {
      throw new Error('Planting record not found');
    }
    
    this.plantingRecords.splice(index, 1);
    return { success: true };
  }

  async getStats() {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const totalRecords = this.plantingRecords.length;
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const thisMonthRecords = this.plantingRecords.filter(record => 
      new Date(record.plantingDate) >= thisMonth
    ).length;
    
    const uniqueCrops = new Set(this.plantingRecords.map(record => record.cropId)).size;
    const uniqueFields = new Set(this.plantingRecords.map(record => record.fieldId)).size;
    
    return {
      totalRecords,
      thisMonthRecords,
      uniqueCrops,
      uniqueFields
    };
  }

  async getRecent(limit = 5) {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const recentRecords = await this.getAll();
    return recentRecords.slice(0, limit);
  }

  getPlantingMethods() {
    return [
      'Direct Seeding',
      'Transplanting',
      'Broadcasting',
      'Row Planting',
      'Hill Planting',
      'Drill Seeding',
      'No-Till',
      'Hydroponic'
    ];
  }
}

const plantingRecordService = new PlantingRecordService();
export default plantingRecordService;