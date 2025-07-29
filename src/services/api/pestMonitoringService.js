import pestObservationsData from '@/services/mockData/pestObservations.json';

class PestMonitoringService {
  constructor() {
    this.observations = [...pestObservationsData];
    this.nextId = Math.max(...this.observations.map(o => o.Id), 0) + 1;
  }

  async delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAll() {
    await this.delay();
    return [...this.observations];
  }

  async getById(id) {
    await this.delay();
    const observation = this.observations.find(o => o.Id === parseInt(id));
    if (!observation) {
      throw new Error(`Observation with ID ${id} not found`);
    }
    return { ...observation };
  }

  async getByFieldId(fieldId) {
    await this.delay();
    return this.observations.filter(o => o.fieldId === parseInt(fieldId));
  }

  async create(observationData) {
    await this.delay();
    
    const newObservation = {
      Id: this.nextId++,
      fieldId: parseInt(observationData.fieldId),
      cropId: observationData.cropId ? parseInt(observationData.cropId) : null,
      pestType: observationData.pestType,
      category: observationData.category,
      severityLevel: parseInt(observationData.severityLevel),
      affectedArea: parseFloat(observationData.affectedArea),
      affectedAreaUnit: observationData.affectedAreaUnit || 'acres',
      observationDate: observationData.observationDate || new Date().toISOString(),
      description: observationData.description,
      treatmentApplied: observationData.treatmentApplied || null,
      treatmentDate: observationData.treatmentDate || null,
      treatmentCost: observationData.treatmentCost ? parseFloat(observationData.treatmentCost) : 0,
      status: observationData.status || 'Active',
      photos: observationData.photos || [],
      weatherConditions: observationData.weatherConditions || '',
      observedBy: observationData.observedBy || 'Farm Manager',
      followUpRequired: observationData.followUpRequired || false,
      followUpDate: observationData.followUpDate || null,
      notes: observationData.notes || ''
    };

    this.observations.push(newObservation);
    return { ...newObservation };
  }

  async update(id, observationData) {
    await this.delay();
    
    const index = this.observations.findIndex(o => o.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Observation with ID ${id} not found`);
    }

    const updatedObservation = {
      ...this.observations[index],
      ...observationData,
      Id: parseInt(id), // Preserve original ID
      fieldId: parseInt(observationData.fieldId),
      cropId: observationData.cropId ? parseInt(observationData.cropId) : null,
      severityLevel: parseInt(observationData.severityLevel),
      affectedArea: parseFloat(observationData.affectedArea),
      treatmentCost: observationData.treatmentCost ? parseFloat(observationData.treatmentCost) : 0
    };

    this.observations[index] = updatedObservation;
    return { ...updatedObservation };
  }

  async delete(id) {
    await this.delay();
    
    const index = this.observations.findIndex(o => o.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Observation with ID ${id} not found`);
    }

    const deletedObservation = this.observations.splice(index, 1)[0];
    return { ...deletedObservation };
  }

  async getStats() {
    await this.delay();
    
    const totalObservations = this.observations.length;
    const activeIssues = this.observations.filter(o => o.status === 'Active').length;
    const resolvedIssues = this.observations.filter(o => o.status === 'Resolved').length;
    const monitoringIssues = this.observations.filter(o => o.status === 'Monitoring').length;
    
    const avgSeverity = totalObservations > 0 
      ? Math.round((this.observations.reduce((sum, o) => sum + o.severityLevel, 0) / totalObservations) * 10) / 10
      : 0;

    const totalTreatmentCost = this.observations.reduce((sum, o) => sum + (o.treatmentCost || 0), 0);
    const totalAffectedArea = this.observations.reduce((sum, o) => sum + o.affectedArea, 0);

    return {
      totalObservations,
      activeIssues,
      resolvedIssues,
      monitoringIssues,
      avgSeverity,
      totalTreatmentCost: Math.round(totalTreatmentCost * 100) / 100,
      totalAffectedArea: Math.round(totalAffectedArea * 10) / 10
    };
  }

  async getPestTypes() {
    await this.delay();
    
    const pestTypes = [
      { category: 'Pest', types: ['Aphids', 'Cutworm', 'Corn Borer', 'Thrips', 'Spider Mites', 'Whiteflies', 'Caterpillars', 'Beetles'] },
      { category: 'Disease', types: ['Powdery Mildew', 'Leaf Spot', 'Rust', 'Blight', 'Root Rot', 'Wilt', 'Mosaic Virus', 'Anthracnose'] },
      { category: 'Weed', types: ['Pigweed', 'Lambsquarters', 'Foxtail', 'Bindweed', 'Thistle', 'Dandelion', 'Crabgrass', 'Johnson Grass'] }
    ];
    
    return pestTypes;
  }
}

export default new PestMonitoringService();