import React, { useState } from "react";

const Languages = () => {
  const [language, setLanguage] = useState("English");
  const [isEditing, setIsEditing] = useState(false);
  const [tempLanguage, setTempLanguage] = useState(language);

  const handleSave = () => {
    setLanguage(tempLanguage);
    setIsEditing(false);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Preferred Language
      </label>

      {!isEditing ? (
        <div className="flex justify-between items-center">
          <span className="text-gray-900 dark:text-gray-100">
            {language}
          </span>
          <button
            className="text-sm text-gray-600 dark:text-gray-400 underline"
            onClick={() => {
              setTempLanguage(language);
              setIsEditing(true);
            }}
          >
            Edit
          </button>
        </div>
      ) : (
        <>
          <select
            value={tempLanguage}
            onChange={(e) => setTempLanguage(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded p-2 w-full"
          >
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
          </select>

          <div className="flex justify-between items-center mt-2">
            <button
              className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 my-3 rounded"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              className="text-sm text-gray-600 dark:text-gray-400 underline"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Languages;
