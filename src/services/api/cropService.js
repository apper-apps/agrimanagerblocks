class CropService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'crop_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "name_c" } },
          { field: { Name: "variety_c" } },
          { field: { Name: "field_id_c" } },
          { field: { Name: "field_name_c" } },
          { field: { Name: "planting_date_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "estimated_harvest_c" } },
          { field: { Name: "growth_stage_c" } },
          { field: { Name: "stage_history_c" } }
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
      console.error("Error fetching crops:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "name_c" } },
          { field: { Name: "variety_c" } },
          { field: { Name: "field_id_c" } },
          { field: { Name: "field_name_c" } },
          { field: { Name: "planting_date_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "estimated_harvest_c" } },
          { field: { Name: "growth_stage_c" } },
          { field: { Name: "stage_history_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching crop with ID ${id}:`, error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async create(cropData) {
    try {
      const params = {
        records: [{
          Name: cropData.name,
          name_c: cropData.name,
          variety_c: cropData.variety,
          field_id_c: parseInt(cropData.fieldId),
          field_name_c: cropData.fieldName,
          planting_date_c: cropData.plantingDate,
          status_c: cropData.status || "growing",
          estimated_harvest_c: cropData.estimatedHarvest,
          growth_stage_c: "Planted",
          stage_history_c: JSON.stringify([{
            stage: "Planted",
            date: cropData.plantingDate,
            updatedAt: new Date().toISOString()
          }])
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
          console.error(`Failed to create crop ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulRecords[0]?.data;
      }
    } catch (error) {
      console.error("Error creating crop:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async update(id, cropData) {
    try {
      const updateData = {
        Id: parseInt(id)
      };

      if (cropData.name) updateData.name_c = cropData.name;
      if (cropData.variety) updateData.variety_c = cropData.variety;
      if (cropData.fieldId) updateData.field_id_c = parseInt(cropData.fieldId);
      if (cropData.fieldName) updateData.field_name_c = cropData.fieldName;
      if (cropData.plantingDate) updateData.planting_date_c = cropData.plantingDate;
      if (cropData.status) updateData.status_c = cropData.status;
      if (cropData.estimatedHarvest) updateData.estimated_harvest_c = cropData.estimatedHarvest;
      if (cropData.growthStage) updateData.growth_stage_c = cropData.growthStage;

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
          console.error(`Failed to update crop ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          failedUpdates.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulUpdates[0]?.data;
      }
    } catch (error) {
      console.error("Error updating crop:", error?.response?.data?.message || error.message);
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
      console.error("Error deleting crop:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async getStats() {
    try {
      const crops = await this.getAll();
      const totalCrops = crops.length;
      const activeCrops = crops.filter(c => c.status_c === "growing" || c.status_c === "planted").length;
      const readyToHarvest = crops.filter(c => c.status_c === "ready").length;
      const harvested = crops.filter(c => c.status_c === "harvested").length;

      return {
        totalCrops,
        activeCrops,
        readyToHarvest,
        harvested
      };
    } catch (error) {
      console.error("Error getting crop stats:", error?.response?.data?.message || error.message);
      return {
        totalCrops: 0,
        activeCrops: 0,
        readyToHarvest: 0,
        harvested: 0
      };
    }
  }
}

export default new CropService();