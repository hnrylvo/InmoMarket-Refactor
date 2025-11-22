import {useState} from "react";

const UpdatePasswordSection = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [fields, setFields] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });

  const handleSave = () => {
    // Hook to backend here
    console.log("Updating password:", fields);
    setIsEditing(false);
  };

  const handleChange = (key) => (e) => {
    setFields((prev) => ({ ...prev, [key]: e.target.value }));
  };

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Password
      </label>

      {!isEditing ? (
        <div className="flex justify-between items-center">
          <span className="text-gray-400 italic dark:text-gray-500">
            •••••••••••••
          </span>
          <button
            className="text-sm text-gray-600 dark:text-gray-400 underline"
            onClick={() => setIsEditing(true)}
          >
            Update
          </button>
        </div>
      ) : (
        <>
          <input
            type="password"
            placeholder="Current password"
            value={fields.current}
            onChange={handleChange("current")}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded p-2 w-full"
          />
          <input
            type="password"
            placeholder="New password"
            value={fields.newPassword}
            onChange={handleChange("newPassword")}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded p-2 w-full"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={fields.confirm}
            onChange={handleChange("confirm")}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded p-2 w-full"
          />
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-2">
            <button
              className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded w-full sm:w-auto"
              onClick={handleSave}
            >
              Save Password
            </button>
            <button
              className="text-sm text-gray-600 dark:text-gray-400 underline w-full sm:w-auto text-left sm:text-center"
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
