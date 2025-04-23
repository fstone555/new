import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
function Edit() {
  const { project_id } = useParams(); // ดึง id จาก URL
  const [formData, setFormData] = useState({
    project_name: "",
    description: "",
    department_id: "",
    status: "In Progress",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // ดึงข้อมูลโปรเจกต์ที่มีอยู่
  useEffect(() => {
    if (!project_id) {
      console.log("Project ID is missing, skipping fetch.");
      return;
    }
  
    const fetchProject = async () => {
      try {
        console.log("Fetching project with ID:", project_id);
        const response = await fetch(`http://localhost:3000/api/projects/${project_id}`);
        console.log("Response status:", response.status);
        if (!response.ok) throw new Error("Failed to fetch project data");
        const data = await response.json();
        console.log("Fetched data:", data);
        setFormData(data);
      } catch (err) {
        setError(err.message);
      }
    };
  
    fetchProject();
  }, [project_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    console.log("Submitting update for project_id:", project_id);

    try {
      const response = await fetch(
        `http://localhost:3000/api/projects/${project_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Update failed");

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Edit Project</h2>

      {success && (
        <div className="bg-green-100 text-green-700 p-2 mb-4 rounded">
          Project updated successfully!
        </div>
      )}
      {error && (
        <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left">Field</th>
              <th className="border border-gray-300 p-2 text-left">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2">Project Name</td>
              <td className="border border-gray-300 p-2">
                <input
                  type="text"
                  name="project_name"
                  value={formData.project_name}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2"
                />
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Description</td>
              <td className="border border-gray-300 p-2">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2"
                  rows="3"
                ></textarea>
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Department ID</td>
              <td className="border border-gray-300 p-2">
                <input
                  type="number"
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2"
                />
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Status</td>
              <td className="border border-gray-300 p-2">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border rounded-md p-2"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="text-center mt-6">
          <button
            type="submit"
            disabled={loading}
            className={`${
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            } text-white px-6 py-2 rounded-xl transition`}
          >
            {loading ? "Updating..." : "Update Project"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Edit;
