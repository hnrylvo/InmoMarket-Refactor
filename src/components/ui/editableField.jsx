import React, { useState, useEffect } from "react";

export const EditableField = ({ label, value, isEditing, onEdit, onSave, onCancel }) => {
  const [tempValue, setTempValue] = useState(value || "");

  useEffect(() => {
    if (isEditing) setTempValue(value || "");
  }, [isEditing, value]);

  return (
    <div className="flex flex-col space-y-1">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      {isEditing ? (
        <>
          <input
            type="text"
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded p-2 w-full"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
          />
          <div className="flex justify-between items-center mt-2">
            <button
              className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 my-3 rounded"
              onClick={() => onSave(tempValue)}
            >
              Save
            </button>

            <button
              className="text-sm text-gray-600 dark:text-gray-400 underline"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <div className="flex justify-between items-center">
          <span
            className={
              value
                ? "text-gray-900 dark:text-gray-100"
                : "text-gray-400 italic dark:text-gray-500"
            }
          >
            {value || "Not provided"}
          </span>
          <button
            className="text-sm text-gray-600 dark:text-gray-400 underline"
            onClick={onEdit}
          >
            {value ? "Edit" : "Add"}
          </button>
        </div>
      )}
    </div>
  );
};
