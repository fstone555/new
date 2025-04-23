import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { FcFolder } from "react-icons/fc";

function ProjectDetail() {
  const { projectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const folderId = searchParams.get('folder_id');

  const [items, setItems] = useState([]);
  const [folderName, setFolderName] = useState("");
  const [fileToUpload, setFileToUpload] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3000/api/drive/${projectId}${folderId ? `?folder_id=${folderId}` : ''}`)
      .then(res => res.json())
      .then(setItems)
      .catch(err => console.error('Error fetching drive:', err));
  }, [projectId, folderId]);

  const refreshItems = () => {
    fetch(`http://localhost:3000/api/drive/${projectId}${folderId ? `?folder_id=${folderId}` : ''}`)
      .then(res => res.json())
      .then(setItems);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) setFileToUpload(file);
  };

  const handleUploadConfirm = async () => {
    if (!fileToUpload) return;
  
    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('project_id', projectId);  // ส่ง project_id ไปด้วย
    if (folderId) formData.append('folder_id', folderId);  // ส่ง folder_id ถ้ามี
  
    const res = await fetch('http://localhost:3000/api/files', {
      method: 'POST',
      body: formData,
    });
  
    if (res.ok) {
      setFileToUpload(null); // clear selected file
      refreshItems(); // รีเฟรชรายการหลังการอัปโหลด
    } else {
      console.error("Upload failed");
    }
  };
  

  const handleCreateFolder = async () => {
    if (!folderName) return;

    const res = await fetch("http://localhost:3000/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        folder_name: folderName,
        project_id: projectId,
        parent_folder_id: folderId,
      }),
    });

    if (res.ok) {
      setFolderName("");
      refreshItems();
    }
  };

  const handleOpenFolder = (id) => {
    setSearchParams({ folder_id: id });
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">📁 Project Drive</h2>

      {/* Upload + Create Folder */}
      <div className="flex flex-wrap gap-3 items-center mb-6">
        <input type="file" onChange={handleFileChange} className="border p-2" />

        {fileToUpload && (
          <span className="text-sm text-gray-700">{fileToUpload.name}</span>
        )}

        <button
          onClick={handleUploadConfirm}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:bg-gray-400"
          disabled={!fileToUpload}
        >
          Upload
        </button>

        <input
          type="text"
          placeholder="New folder name"
          value={folderName}
          onChange={e => setFolderName(e.target.value)}
          className="border p-2"
        />
        <button
          onClick={handleCreateFolder}
          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
        >
          Create Folder
        </button>
      </div>

      {/* List */}
      <ul className="space-y-2">
        {items.map(item => (
          <li key={`${item.type}-${item.id}`} className="flex items-center gap-2">
            {item.type === 'folder' ? (
              <button
                onClick={() => handleOpenFolder(item.id)}
                className="flex items-center gap-1 text-blue-600 hover:underline">
                <FcFolder size={20} /> {item.name}
              </button>
            ) : (
              <a
                href={`http://localhost:3000/api/files/download/${item.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:underline">
                📄 {item.name} ({(item.file_size / 1024).toFixed(1)} KB)
              </a>
            )}
          </li>
        ))}
      </ul>

      {folderId && (
        <button
          onClick={goBack}
          className="mt-6 text-sm text-gray-600 underline">
          ← Go back
        </button>
      )}
    </div>
  );
}

export default ProjectDetail;
