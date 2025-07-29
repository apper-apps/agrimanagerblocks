import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import FieldCard from "@/components/organisms/FieldCard";
import AddFieldModal from "@/components/organisms/AddFieldModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import fieldService from "@/services/api/fieldService";

const Fields = () => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editField, setEditField] = useState(null);

  const loadFields = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fieldService.getAll();
      setFields(data);
    } catch (err) {
      setError("Failed to load fields. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFields();
  }, []);

  const handleAddField = async (fieldData) => {
    try {
      const newField = await fieldService.create(fieldData);
      setFields(prev => [...prev, newField]);
      toast.success("Field added successfully!");
    } catch (err) {
      toast.error("Failed to add field. Please try again.");
      throw err;
    }
  };

  const handleEditField = async (id, fieldData) => {
    try {
      const updatedField = await fieldService.update(id, fieldData);
      setFields(prev => prev.map(f => f.Id === id ? updatedField : f));
      toast.success("Field updated successfully!");
    } catch (err) {
      toast.error("Failed to update field. Please try again.");
      throw err;
    }
  };

  const handleDeleteField = async (id) => {
    if (!window.confirm("Are you sure you want to delete this field?")) {
      return;
    }

    try {
      await fieldService.delete(id);
      setFields(prev => prev.filter(f => f.Id !== id));
      toast.success("Field deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete field. Please try again.");
    }
  };

  const openEditModal = (field) => {
    setEditField(field);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditField(null);
  };

  if (loading) {
    return <Loading variant="cards" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadFields} />;
  }

  if (fields.length === 0) {
    return (
      <Empty
        title="No fields found"
        description="Start managing your farm by adding your first field. Track field sizes, locations, and status all in one place."
        icon="MapPin"
        actionLabel="Add Your First Field"
        onAction={() => setShowAddModal(true)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">
            Fields
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your farm fields and track their status
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="flex items-center"
        >
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Add Field
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fields.map((field) => (
          <FieldCard
            key={field.Id}
            field={field}
            onEdit={openEditModal}
            onDelete={handleDeleteField}
          />
        ))}
      </div>

      <AddFieldModal
        isOpen={showAddModal}
        onClose={closeModal}
        onSave={editField ? handleEditField : handleAddField}
        editField={editField}
      />
    </div>
  );
};

export default Fields;