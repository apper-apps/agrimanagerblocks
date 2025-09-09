class FieldService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'field_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "name_c" } },
          { field: { Name: "size_in_acres_c" } },
          { field: { Name: "location_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "created_at_c" } }
        ],
        orderBy: [
          { fieldName: "Id", sorttype: "DESC" }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching fields:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "name_c" } },
          { field: { Name: "size_in_acres_c" } },
          { field: { Name: "location_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "created_at_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching field with ID ${id}:`, error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async create(fieldData) {
    try {
      const params = {
        records: [{
          Name: fieldData.name,
          name_c: fieldData.name,
          size_in_acres_c: fieldData.sizeInAcres,
          location_c: fieldData.location,
          status_c: fieldData.status,
          created_at_c: new Date().toISOString()
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
          console.error(`Failed to create field ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulRecords[0]?.data;
      }
    } catch (error) {
      console.error("Error creating field:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async update(id, fieldData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: fieldData.name,
          name_c: fieldData.name,
          size_in_acres_c: fieldData.sizeInAcres,
          location_c: fieldData.location,
          status_c: fieldData.status
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
          console.error(`Failed to update field ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          failedUpdates.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulUpdates[0]?.data;
      }
    } catch (error) {
      console.error("Error updating field:", error?.response?.data?.message || error.message);
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
      console.error("Error deleting field:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async getStats() {
    try {
      const fields = await this.getAll();
      const totalFields = fields.length;
      const activeFields = fields.filter(f => f.status_c === "active").length;
      const totalAcres = fields.reduce((sum, f) => sum + (f.size_in_acres_c || 0), 0);
      const fallowFields = fields.filter(f => f.status_c === "fallow").length;

      return {
        totalFields,
        activeFields,
        totalAcres: Math.round(totalAcres * 10) / 10,
        fallowFields
      };
    } catch (error) {
      console.error("Error getting field stats:", error?.response?.data?.message || error.message);
      return {
        totalFields: 0,
        activeFields: 0,
        totalAcres: 0,
        fallowFields: 0
      };
    }
  }
}

export default new FieldService();