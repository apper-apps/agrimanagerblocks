class PestMonitoringService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'pest_observation_c';
    this.lookupFields = ['field_id_c', 'crop_id_c'];
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "pest_type_c" } },
          { field: { Name: "category_c" } },
          { field: { Name: "severity_level_c" } },
          { field: { Name: "affected_area_c" } },
          { field: { Name: "affected_area_unit_c" } },
          { field: { Name: "observation_date_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "treatment_applied_c" } },
          { field: { Name: "treatment_date_c" } },
          { field: { Name: "treatment_cost_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "photos_c" } },
          { field: { Name: "weather_conditions_c" } },
          { field: { Name: "observed_by_c" } },
          { field: { Name: "follow_up_required_c" } },
          { field: { Name: "follow_up_date_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "field_id_c" } },
          { field: { Name: "crop_id_c" } }
        ],
        orderBy: [
          { fieldName: "observation_date_c", sorttype: "DESC" }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching pest observations:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "pest_type_c" } },
          { field: { Name: "category_c" } },
          { field: { Name: "severity_level_c" } },
          { field: { Name: "affected_area_c" } },
          { field: { Name: "affected_area_unit_c" } },
          { field: { Name: "observation_date_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "treatment_applied_c" } },
          { field: { Name: "treatment_date_c" } },
          { field: { Name: "treatment_cost_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "photos_c" } },
          { field: { Name: "weather_conditions_c" } },
          { field: { Name: "observed_by_c" } },
          { field: { Name: "follow_up_required_c" } },
          { field: { Name: "follow_up_date_c" } },
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
      console.error(`Error fetching pest observation with ID ${id}:`, error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async create(observationData) {
    try {
      const params = {
        records: [{
          Name: observationData.pestType,
          pest_type_c: observationData.pestType,
          category_c: observationData.category,
          severity_level_c: parseInt(observationData.severityLevel),
          affected_area_c: parseFloat(observationData.affectedArea),
          affected_area_unit_c: observationData.affectedAreaUnit,
          observation_date_c: observationData.observationDate,
          description_c: observationData.description,
          treatment_applied_c: observationData.treatmentApplied,
          treatment_date_c: observationData.treatmentDate,
          treatment_cost_c: observationData.treatmentCost ? parseFloat(observationData.treatmentCost) : 0,
          status_c: observationData.status,
          photos_c: observationData.photos ? JSON.stringify(observationData.photos) : null,
          weather_conditions_c: observationData.weatherConditions,
          observed_by_c: observationData.observedBy,
          follow_up_required_c: observationData.followUpRequired,
          follow_up_date_c: observationData.followUpDate,
          notes_c: observationData.notes,
          field_id_c: parseInt(observationData.fieldId),
          crop_id_c: observationData.cropId ? parseInt(observationData.cropId) : null
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
          console.error(`Failed to create pest observation ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulRecords[0]?.data;
      }
    } catch (error) {
      console.error("Error creating pest observation:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async update(id, observationData) {
    try {
      const updateData = {
        Id: parseInt(id)
      };

      if (observationData.pestType) updateData.pest_type_c = observationData.pestType;
      if (observationData.category) updateData.category_c = observationData.category;
      if (observationData.severityLevel) updateData.severity_level_c = parseInt(observationData.severityLevel);
      if (observationData.affectedArea) updateData.affected_area_c = parseFloat(observationData.affectedArea);
      if (observationData.affectedAreaUnit) updateData.affected_area_unit_c = observationData.affectedAreaUnit;
      if (observationData.observationDate) updateData.observation_date_c = observationData.observationDate;
      if (observationData.description) updateData.description_c = observationData.description;
      if (observationData.treatmentApplied) updateData.treatment_applied_c = observationData.treatmentApplied;
      if (observationData.treatmentDate) updateData.treatment_date_c = observationData.treatmentDate;
      if (observationData.treatmentCost !== undefined) updateData.treatment_cost_c = parseFloat(observationData.treatmentCost) || 0;
      if (observationData.status) updateData.status_c = observationData.status;
      if (observationData.weatherConditions) updateData.weather_conditions_c = observationData.weatherConditions;
      if (observationData.observedBy) updateData.observed_by_c = observationData.observedBy;
      if (observationData.followUpRequired !== undefined) updateData.follow_up_required_c = observationData.followUpRequired;
      if (observationData.followUpDate) updateData.follow_up_date_c = observationData.followUpDate;
      if (observationData.notes) updateData.notes_c = observationData.notes;
      if (observationData.fieldId) updateData.field_id_c = parseInt(observationData.fieldId);
      if (observationData.cropId !== undefined) updateData.crop_id_c = observationData.cropId ? parseInt(observationData.cropId) : null;

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
          console.error(`Failed to update pest observation ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          failedUpdates.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulUpdates[0]?.data;
      }
    } catch (error) {
      console.error("Error updating pest observation:", error?.response?.data?.message || error.message);
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
      console.error("Error deleting pest observation:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async getStats() {
    try {
      const observations = await this.getAll();
      const totalObservations = observations.length;
      const activeIssues = observations.filter(o => o.status_c === 'Active').length;
      const resolvedIssues = observations.filter(o => o.status_c === 'Resolved').length;
      const monitoringIssues = observations.filter(o => o.status_c === 'Monitoring').length;
      
      const avgSeverity = totalObservations > 0 
        ? Math.round((observations.reduce((sum, o) => sum + (o.severity_level_c || 0), 0) / totalObservations) * 10) / 10
        : 0;

      const totalTreatmentCost = observations.reduce((sum, o) => sum + (o.treatment_cost_c || 0), 0);
      const totalAffectedArea = observations.reduce((sum, o) => sum + (o.affected_area_c || 0), 0);

      return {
        totalObservations,
        activeIssues,
        resolvedIssues,
        monitoringIssues,
        avgSeverity,
        totalTreatmentCost: Math.round(totalTreatmentCost * 100) / 100,
        totalAffectedArea: Math.round(totalAffectedArea * 10) / 10
      };
    } catch (error) {
      console.error("Error getting pest monitoring stats:", error?.response?.data?.message || error.message);
      return {
        totalObservations: 0,
        activeIssues: 0,
        resolvedIssues: 0,
        monitoringIssues: 0,
        avgSeverity: 0,
        totalTreatmentCost: 0,
        totalAffectedArea: 0
      };
    }
  }

  async getPestTypes() {
    const pestTypes = [
      { category: 'Pest', types: ['Aphids', 'Cutworm', 'Corn Borer', 'Thrips', 'Spider Mites', 'Whiteflies', 'Caterpillars', 'Beetles'] },
      { category: 'Disease', types: ['Powdery Mildew', 'Leaf Spot', 'Rust', 'Blight', 'Root Rot', 'Wilt', 'Mosaic Virus', 'Anthracnose'] },
      { category: 'Weed', types: ['Pigweed', 'Lambsquarters', 'Foxtail', 'Bindweed', 'Thistle', 'Dandelion', 'Crabgrass', 'Johnson Grass'] }
    ];
    
    return pestTypes;
  }
}

export default new PestMonitoringService();