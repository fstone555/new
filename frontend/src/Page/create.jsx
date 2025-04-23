import { useState } from "react";
function Create() {
    const [formData, setFormData] = useState({
        project_name: "",
        description: "",
        department_id: "",
      });
    
      const [loading, setLoading] = useState(false);
      const [success, setSuccess] = useState(false);
      const [error, setError] = useState("");
    
      const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
      };
    
      const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);
        setError("");
    
        try {
          const response = await fetch("http://localhost:3000/api/projects", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          });
    
          if (!response.ok) {
            throw new Error("Failed to create project");
          }
    
          setSuccess(true);
          setFormData({ project_name: "", description: "", department_id: "" });
        } catch (err) {
          setError(err.message || "Something went wrong");
        } finally {
          setLoading(false);
        }
      };
    return ( 
        <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Create New Project</h2>
  
        {success && (
          <div className="mb-4 text-green-700 bg-green-100 p-2 rounded">
            Project created successfully!
          </div>
        )}
        {error && (
          <div className="mb-4 text-red-700 bg-red-100 p-2 rounded">{error}</div>
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
                    required
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
                    required
                  ></textarea>
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-2">Department ID</td>
                <td className="border border-gray-300 p-2">
                  <input
                    type="text"
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleChange}
                    className="w-full border rounded-md p-2"
                    required
                  />
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
              {loading ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
     );
}

export default Create;