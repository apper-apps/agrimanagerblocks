import irrigationData from '@/services/mockData/irrigationRecords.json';

// Mock delay to simulate API latency
async function delay(ms = 300) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class IrrigationService {
  constructor() {
    this.irrigationRecords = [...irrigationData];
    this.nextId = Math.max(...this.irrigationRecords.map(record => record.Id), 0) + 1;
  }

  async getAll() {
    await delay();
    return [...this.irrigationRecords];
  }

  async getById(id) {
    await delay();
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      throw new Error('Invalid irrigation record ID');
    }
    
    const record = this.irrigationRecords.find(record => record.Id === numericId);
    if (!record) {
      throw new Error('Irrigation record not found');
    }
    
    return { ...record };
  }

  async getByFieldId(fieldId) {
    await delay();
    const numericFieldId = parseInt(fieldId);
    if (isNaN(numericFieldId)) {
      throw new Error('Invalid field ID');
    }
    
    return this.irrigationRecords
      .filter(record => record.fieldId === numericFieldId)
      .map(record => ({ ...record }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  async create(recordData) {
    await delay();
    
    const newRecord = {
      ...recordData,
      Id: this.nextId++,
      createdAt: new Date().toISOString()
    };
    
    this.irrigationRecords.push(newRecord);
    return { ...newRecord };
  }

  async update(id, recordData) {
    await delay();
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      throw new Error('Invalid irrigation record ID');
    }

    const index = this.irrigationRecords.findIndex(record => record.Id === numericId);
    if (index === -1) {
      throw new Error('Irrigation record not found');
    }

    this.irrigationRecords[index] = {
      ...this.irrigationRecords[index],
      ...recordData,
      Id: numericId
    };

    return { ...this.irrigationRecords[index] };
  }

  async delete(id) {
    await delay();
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      throw new Error('Invalid irrigation record ID');
    }

    const index = this.irrigationRecords.findIndex(record => record.Id === numericId);
    if (index === -1) {
      throw new Error('Irrigation record not found');
    }

    this.irrigationRecords.splice(index, 1);
    return true;
  }

  async getStats() {
    await delay();
    const totalRecords = this.irrigationRecords.length;
    const totalWaterUsed = this.irrigationRecords.reduce((sum, record) => sum + record.waterAmount, 0);
    const averageWaterPerIrrigation = totalRecords > 0 ? totalWaterUsed / totalRecords : 0;
    
    return {
      totalRecords,
      totalWaterUsed,
      averageWaterPerIrrigation
    };
  }
}

export default new IrrigationService();