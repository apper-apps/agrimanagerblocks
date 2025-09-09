class FertilizerService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'fertilizer_record_c';
    this.lookupFields = ['field_id_c', 'crop_id_c'];
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "fertilizer_type_c" } },
          { field: { Name: "application_date_c" } },
          { field: { Name: "quantity_used_c" } },
          { field: { Name: "unit_c" } },
          { field: { Name: "cost_per_unit_c" } },
          { field: { Name: "total_cost_c" } },
          { field: { Name: "application_method_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "field_id_c" } },
          { field: { Name: "crop_id_c" } }
        ],
        orderBy: [
          { fieldName: "application_date_c", sorttype: "DESC" }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching fertilizer records:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "fertilizer_type_c" } },
          { field: { Name: "application_date_c" } },
          { field: { Name: "quantity_used_c" } },
          { field: { Name: "unit_c" } },
          { field: { Name: "cost_per_unit_c" } },
          { field: { Name: "total_cost_c" } },
          { field: { Name: "application_method_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "field_id_c" } },
          { field: { Name: "crop_id_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching fertilizer record with ID ${id}:`, error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async getByFieldId(fieldId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "fertilizer_type_c" } },
          { field: { Name: "application_date_c" } },
          { field: { Name: "quantity_used_c" } },
          { field: { Name: "unit_c" } },
          { field: { Name: "cost_per_unit_c" } },
          { field: { Name: "total_cost_c" } },
          { field: { Name: "application_method_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "field_id_c" } },
          { field: { Name: "crop_id_c" } }
        ],
        where: [
          {
            FieldName: "field_id_c",
            Operator: "EqualTo",
            Values: [parseInt(fieldId)]
          }
        ],
        orderBy: [
          { fieldName: "application_date_c", sorttype: "DESC" }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error(`Error fetching fertilizer records for field ${fieldId}:`, error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async create(recordData) {
    try {
      const totalCost = recordData.quantityUsed * recordData.costPerUnit;
      
      const params = {
        records: [{
          Name: recordData.fertilizerType,
          fertilizer_type_c: recordData.fertilizerType,
          application_date_c: recordData.applicationDate,
          quantity_used_c: parseInt(recordData.quantityUsed),
          unit_c: recordData.unit,
          cost_per_unit_c: parseFloat(recordData.costPerUnit),
          total_cost_c: Math.round(totalCost * 100) / 100,
          application_method_c: recordData.applicationMethod,
          notes_c: recordData.notes,
          field_id_c: parseInt(recordData.fieldId),
          crop_id_c: recordData.cropId ? parseInt(recordData.cropId) : null
        }]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create fertilizer record ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulRecords[0]?.data;
      }
    } catch (error) {
      console.error("Error creating fertilizer record:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async update(id, recordData) {
    try {
      const totalCost = recordData.quantityUsed * recordData.costPerUnit;
      
      const params = {
        records: [{
          Id: parseInt(id),
          fertilizer_type_c: recordData.fertilizerType,
          application_date_c: recordData.applicationDate,
          quantity_used_c: parseInt(recordData.quantityUsed),
          unit_c: recordData.unit,
          cost_per_unit_c: parseFloat(recordData.costPerUnit),
          total_cost_c: Math.round(totalCost * 100) / 100,
          application_method_c: recordData.applicationMethod,
          notes_c: recordData.notes,
          field_id_c: parseInt(recordData.fieldId),
          crop_id_c: recordData.cropId ? parseInt(recordData.cropId) : null
        }]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update fertilizer record ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          failedUpdates.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulUpdates[0]?.data;
      }
    } catch (error) {
      console.error("Error updating fertilizer record:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return true;
    } catch (error) {
      console.error("Error deleting fertilizer record:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async getStats() {
    try {
      const records = await this.getAll();
      const totalApplications = records.length;
      const totalCost = records.reduce((sum, r) => sum + (r.total_cost_c || 0), 0);
      const avgCostPerApplication = totalApplications > 0 ? totalCost / totalApplications : 0;
      
      const fertilizerTypes = [...new Set(records.map(r => r.fertilizer_type_c).filter(Boolean))];
      
      return {
        totalApplications,
        totalCost: Math.round(totalCost * 100) / 100,
        avgCostPerApplication: Math.round(avgCostPerApplication * 100) / 100,
        uniqueFertilizerTypes: fertilizerTypes.length
      };
    } catch (error) {
      console.error("Error getting fertilizer stats:", error?.response?.data?.message || error.message);
      return {
        totalApplications: 0,
        totalCost: 0,
        avgCostPerApplication: 0,
        uniqueFertilizerTypes: 0
      };
    }
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