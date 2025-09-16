class EquipmentService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'equipment_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "name_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "purchase_date_c" } },
          { field: { Name: "maintenance_schedule_c" } },
          { field: { Name: "operational_status_c" } },
          { field: { Name: "field_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "description_c" } }
        ],
        orderBy: [
          { fieldName: "Name", sorttype: "ASC" }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching equipment:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "name_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "purchase_date_c" } },
          { field: { Name: "maintenance_schedule_c" } },
          { field: { Name: "operational_status_c" } },
          { field: { Name: "field_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "description_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching equipment with ID ${id}:`, error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async create(equipmentData) {
    try {
      const params = {
        records: [{
          Name: equipmentData.name_c,
          name_c: equipmentData.name_c,
          type_c: equipmentData.type_c,
          purchase_date_c: equipmentData.purchase_date_c,
          maintenance_schedule_c: equipmentData.maintenance_schedule_c,
          operational_status_c: equipmentData.operational_status_c,
          field_c: equipmentData.field_c ? parseInt(equipmentData.field_c) : null,
          notes_c: equipmentData.notes_c || '',
          description_c: equipmentData.description_c || ''
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
          console.error(`Failed to create equipment ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulRecords[0]?.data;
      }
    } catch (error) {
      console.error("Error creating equipment:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async update(id, equipmentData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: equipmentData.name_c,
          name_c: equipmentData.name_c,
          type_c: equipmentData.type_c,
          purchase_date_c: equipmentData.purchase_date_c,
          maintenance_schedule_c: equipmentData.maintenance_schedule_c,
          operational_status_c: equipmentData.operational_status_c,
          field_c: equipmentData.field_c ? parseInt(equipmentData.field_c) : null,
          notes_c: equipmentData.notes_c || '',
          description_c: equipmentData.description_c || ''
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
          console.error(`Failed to update equipment ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          failedUpdates.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulUpdates[0]?.data;
      }
    } catch (error) {
      console.error("Error updating equipment:", error?.response?.data?.message || error.message);
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
      console.error("Error deleting equipment:", error?.response?.data?.message || error.message);
      throw error;
    }
  }
}

export default new EquipmentService();