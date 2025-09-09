class PlantingRecordService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'planting_record_c';
    this.lookupFields = ['crop_id_c', 'field_id_c'];
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "planting_date_c" } },
          { field: { Name: "seed_quantity_c" } },
          { field: { Name: "planting_method_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "crop_id_c" } },
          { field: { Name: "field_id_c" } }
        ],
        orderBy: [
          { fieldName: "planting_date_c", sorttype: "DESC" }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const records = response.data || [];
      
      // Enrich with crop and field names from lookup objects
      return records.map(record => ({
        ...record,
        cropName: record.crop_id_c?.Name || 'Unknown Crop',
        fieldName: record.field_id_c?.Name || 'Unknown Field'
      }));
    } catch (error) {
      console.error("Error fetching planting records:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "planting_date_c" } },
          { field: { Name: "seed_quantity_c" } },
          { field: { Name: "planting_method_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "crop_id_c" } },
          { field: { Name: "field_id_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const record = response.data;
      return {
        ...record,
        cropName: record.crop_id_c?.Name || 'Unknown Crop',
        fieldName: record.field_id_c?.Name || 'Unknown Field'
      };
    } catch (error) {
      console.error(`Error fetching planting record with ID ${id}:`, error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async create(recordData) {
    try {
      const params = {
        records: [{
          Name: `${recordData.cropName || 'Crop'} - ${recordData.fieldName || 'Field'}`,
          planting_date_c: recordData.plantingDate,
          seed_quantity_c: parseInt(recordData.seedQuantity),
          planting_method_c: recordData.plantingMethod,
          notes_c: recordData.notes,
          crop_id_c: parseInt(recordData.cropId),
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
          console.error(`Failed to create planting record ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        const createdRecord = successfulRecords[0]?.data;
        return {
          ...createdRecord,
          cropName: recordData.cropName,
          fieldName: recordData.fieldName
        };
      }
    } catch (error) {
      console.error("Error creating planting record:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async update(id, updates) {
    try {
      const updateData = {
        Id: parseInt(id)
      };

      if (updates.plantingDate) updateData.planting_date_c = updates.plantingDate;
      if (updates.seedQuantity) updateData.seed_quantity_c = parseInt(updates.seedQuantity);
      if (updates.plantingMethod) updateData.planting_method_c = updates.plantingMethod;
      if (updates.notes) updateData.notes_c = updates.notes;
      if (updates.cropId) updateData.crop_id_c = parseInt(updates.cropId);
      if (updates.fieldId) updateData.field_id_c = parseInt(updates.fieldId);

      const params = {
        records: [updateData]
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
          console.error(`Failed to update planting record ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          failedUpdates.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulUpdates[0]?.data;
      }
    } catch (error) {
      console.error("Error updating planting record:", error?.response?.data?.message || error.message);
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

      return { success: true };
    } catch (error) {
      console.error("Error deleting planting record:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async getStats() {
    try {
      const records = await this.getAll();
      const totalRecords = records.length;
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      
      const thisMonthRecords = records.filter(record => 
        new Date(record.planting_date_c) >= thisMonth
      ).length;
      
      const uniqueCrops = new Set(records.map(record => record.crop_id_c?.Id).filter(Boolean)).size;
      const uniqueFields = new Set(records.map(record => record.field_id_c?.Id).filter(Boolean)).size;
      
      return {
        totalRecords,
        thisMonthRecords,
        uniqueCrops,
        uniqueFields
      };
    } catch (error) {
      console.error("Error getting planting record stats:", error?.response?.data?.message || error.message);
      return {
        totalRecords: 0,
        thisMonthRecords: 0,
        uniqueCrops: 0,
        uniqueFields: 0
      };
    }
  }

  async getRecent(limit = 5) {
    try {
      const recentRecords = await this.getAll();
      return recentRecords.slice(0, limit);
    } catch (error) {
      console.error("Error getting recent planting records:", error?.response?.data?.message || error.message);
      return [];
    }
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