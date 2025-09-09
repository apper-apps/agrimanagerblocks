class IrrigationService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'irrigation_record_c';
    this.lookupFields = ['field_id_c'];
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "date_c" } },
          { field: { Name: "duration_c" } },
          { field: { Name: "water_amount_c" } },
          { field: { Name: "irrigation_method_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "field_id_c" } }
        ],
        orderBy: [
          { fieldName: "date_c", sorttype: "DESC" }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching irrigation records:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "date_c" } },
          { field: { Name: "duration_c" } },
          { field: { Name: "water_amount_c" } },
          { field: { Name: "irrigation_method_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "field_id_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching irrigation record with ID ${id}:`, error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async getByFieldId(fieldId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "date_c" } },
          { field: { Name: "duration_c" } },
          { field: { Name: "water_amount_c" } },
          { field: { Name: "irrigation_method_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "field_id_c" } }
        ],
        where: [
          {
            FieldName: "field_id_c",
            Operator: "EqualTo",
            Values: [parseInt(fieldId)]
          }
        ],
        orderBy: [
          { fieldName: "date_c", sorttype: "DESC" }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error(`Error fetching irrigation records for field ${fieldId}:`, error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async create(recordData) {
    try {
      const params = {
        records: [{
          Name: `Irrigation - ${new Date(recordData.date).toLocaleDateString()}`,
          date_c: recordData.date,
          duration_c: parseInt(recordData.duration),
          water_amount_c: parseInt(recordData.waterAmount),
          irrigation_method_c: recordData.irrigationMethod,
          notes_c: recordData.notes,
          created_at_c: new Date().toISOString(),
          field_id_c: parseInt(recordData.fieldId)
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
          console.error(`Failed to create irrigation record ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulRecords[0]?.data;
      }
    } catch (error) {
      console.error("Error creating irrigation record:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async update(id, recordData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          date_c: recordData.date,
          duration_c: parseInt(recordData.duration),
          water_amount_c: parseInt(recordData.waterAmount),
          irrigation_method_c: recordData.irrigationMethod,
          notes_c: recordData.notes,
          field_id_c: parseInt(recordData.fieldId)
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
          console.error(`Failed to update irrigation record ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          failedUpdates.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulUpdates[0]?.data;
      }
    } catch (error) {
      console.error("Error updating irrigation record:", error?.response?.data?.message || error.message);
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
      console.error("Error deleting irrigation record:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async getStats() {
    try {
      const records = await this.getAll();
      const totalRecords = records.length;
      const totalWaterUsed = records.reduce((sum, record) => sum + (record.water_amount_c || 0), 0);
      const averageWaterPerIrrigation = totalRecords > 0 ? totalWaterUsed / totalRecords : 0;
      
      return {
        totalRecords,
        totalWaterUsed,
        averageWaterPerIrrigation: Math.round(averageWaterPerIrrigation * 100) / 100
      };
    } catch (error) {
      console.error("Error getting irrigation stats:", error?.response?.data?.message || error.message);
      return {
        totalRecords: 0,
        totalWaterUsed: 0,
        averageWaterPerIrrigation: 0
      };
    }
  }
}

export default new IrrigationService();