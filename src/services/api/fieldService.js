import fieldsData from "@/services/mockData/fields.json";
import React from "react";
import Error from "@/components/ui/Error";

class FieldService {
  constructor() {
    this.fields = [...fieldsData];
  }

  async delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAll() {
    await this.delay();
    return [...this.fields];
  }

  async getById(id) {
    await this.delay();
    const field = this.fields.find(f => f.Id === parseInt(id));
    if (!field) {
      throw new Error("Field not found");
    }
    return { ...field };
  }

  async create(fieldData) {
    await this.delay();
    const maxId = Math.max(...this.fields.map(f => f.Id), 0);
    const newField = {
      Id: maxId + 1,
      ...fieldData,
      createdAt: new Date().toISOString()
    };
    this.fields.push(newField);
    return { ...newField };
  }

  async update(id, fieldData) {
    await this.delay();
    const index = this.fields.findIndex(f => f.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Field not found");
    }
    this.fields[index] = { ...this.fields[index], ...fieldData };
    return { ...this.fields[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.fields.findIndex(f => f.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Field not found");
    }
    const deletedField = this.fields.splice(index, 1)[0];
    return { ...deletedField };
}

  async getIrrigationStats(fieldId) {
    await this.delay();
    // This would typically fetch irrigation stats for the field
    // For now, return mock data structure
    return {
      totalIrrigations: 0,
      totalWaterUsed: 0,
      lastIrrigation: null
    };
  }

  async getStats() {
    await this.delay();
    const totalFields = this.fields.length;
    const activeFields = this.fields.filter(f => f.status === "active").length;
    const totalAcres = this.fields.reduce((sum, f) => sum + f.sizeInAcres, 0);
    const fallowFields = this.fields.filter(f => f.status === "fallow").length;

    return {
      totalFields,
      activeFields,
      totalAcres: Math.round(totalAcres * 10) / 10,
      fallowFields
    };
  }
}

export default new FieldService();