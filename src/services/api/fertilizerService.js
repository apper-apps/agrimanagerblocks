import fertilizerData from "@/services/mockData/fertilizerRecords.json";

class FertilizerService {
  constructor() {
    this.fertilizerRecords = [...fertilizerData];
  }

  async delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAll() {
    await this.delay();
    return [...this.fertilizerRecords];
  }

  async getById(id) {
    await this.delay();
    const record = this.fertilizerRecords.find(r => r.Id === parseInt(id));
    if (!record) {
      throw new Error("Fertilizer record not found");
    }
    return { ...record };
  }

  async getByFieldId(fieldId) {
    await this.delay();
    return this.fertilizerRecords
      .filter(r => r.fieldId === parseInt(fieldId))
      .map(r => ({ ...r }));
  }

  async create(recordData) {
    await this.delay();
    const maxId = Math.max(...this.fertilizerRecords.map(r => r.Id), 0);
    const totalCost = recordData.quantityUsed * recordData.costPerUnit;
    
    const newRecord = {
      Id: maxId + 1,
      ...recordData,
      totalCost: Math.round(totalCost * 100) / 100,
      createdAt: new Date().toISOString()
    };
    
    this.fertilizerRecords.push(newRecord);
    return { ...newRecord };
  }

  async update(id, recordData) {
    await this.delay();
    const index = this.fertilizerRecords.findIndex(r => r.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Fertilizer record not found");
    }

    const totalCost = recordData.quantityUsed * recordData.costPerUnit;
    const updatedRecord = {
      ...this.fertilizerRecords[index],
      ...recordData,
      totalCost: Math.round(totalCost * 100) / 100
    };

    this.fertilizerRecords[index] = updatedRecord;
    return { ...updatedRecord };
  }

  async delete(id) {
    await this.delay();
    const index = this.fertilizerRecords.findIndex(r => r.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Fertilizer record not found");
    }
    const deletedRecord = this.fertilizerRecords.splice(index, 1)[0];
    return { ...deletedRecord };
  }

  async getStats() {
    await this.delay();
    const totalApplications = this.fertilizerRecords.length;
    const totalCost = this.fertilizerRecords.reduce((sum, r) => sum + r.totalCost, 0);
    const avgCostPerApplication = totalApplications > 0 ? totalCost / totalApplications : 0;
    
    const fertilizerTypes = [...new Set(this.fertilizerRecords.map(r => r.fertilizerType))];
    
    return {
      totalApplications,
      totalCost: Math.round(totalCost * 100) / 100,
      avgCostPerApplication: Math.round(avgCostPerApplication * 100) / 100,
      uniqueFertilizerTypes: fertilizerTypes.length
    };
  }

  getFertilizerTypes() {
    return [
      "Nitrogen (Urea)",
      "NPK 10-10-10",
      "NPK 15-15-15",
      "NPK 20-20-20",
      "Phosphorus (DAP)",
      "Potassium (Muriate)",
      "Organic Compost",
      "Liquid Fertilizer"
    ];
  }
}

export default new FertilizerService();