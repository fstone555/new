import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { FiDownload } from "react-icons/fi";
import { FaRegBookmark, FaBookmark } from "react-icons/fa6";
import './ProjectDetail.css'

function ProjectDetail() {
  const { projectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const folderId = searchParams.get('folder_id');

  const [items, setItems] = useState([]);
  const [folderName, setFolderName] = useState("");
  const [fileToUpload, setFileToUpload] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);

  const fetchBookmarks = async () => {
    const res = await fetch(`http://localhost:3000/bookmark`, {
      credentials: 'include',
    });
    const data = await res.json();
    setBookmarkedIds(data.map((b) => `${b.item_type}-${b.item_id}`));
  };

  const refreshItems = () => {
    fetch(`http://localhost:3000/api/drive/${projectId}${folderId ? `?folder_id=${folderId}` : ''}`)
      .then(res => res.json())
      .then(data => {
        const sorted = [...data].sort((a, b) => a.type.localeCompare(b.type));
        setItems(sorted);
      });

    fetchBookmarks();
  };

  useEffect(() => {
    refreshItems();
  }, [projectId, folderId]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setFileToUpload(file);
  };

  const handleUploadConfirm = async () => {
    if (!fileToUpload) return;

    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('project_id', projectId);
    if (folderId) formData.append('folder_id', folderId);

    const res = await fetch('http://localhost:3000/api/files', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      setFileToUpload(null);
      document.querySelector('input[type="file"]').value = '';
      refreshItems();
    } else {
      alert("เกิดข้อผิดพลาดในการอัปโหลดไฟล์");
    }
  };

  const handleCreateFolder = async () => {
    const token = localStorage.getItem("token"); // 👈 เพิ่มบรรทัดนี้
  
    if (!token) {
      console.error("No token found");
      return;
    }
  
    try {
      const res = await fetch("http://localhost:3000/api/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // 👈 ใช้ token ที่ได้
        },
        body: JSON.stringify({
          folder_name: folderName,
          project_id: projectId,
          parent_folder_id: folderId,
        }),
      });
  
      if (!res.ok) {
        const text = await res.text();
        console.error("Server error:", text);
        return;
      }
  
      const data = await res.json();
      console.log("Success:", data);
      refreshItems(); // โหลดรายการใหม่
      setFolderName(""); // ล้างชื่อโฟลเดอร์
    } catch (error) {
      console.error("Network error:", error.message);
    }
  };
  
   

  const handleBookmark = async (item) => {
    const key = `${item.type}-${item.id}`;
    const isBookmarked = bookmarkedIds.includes(key);

    const res = await fetch('http://localhost:3000/bookmark', {
      method: isBookmarked ? 'DELETE' : 'POST',
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify({
        item_id: item.id,
        item_type: item.type,
        project_id: projectId,
      }),
    });

    if (res.ok) fetchBookmarks();
    else alert("ไม่สามารถทำรายการบุ๊กมาร์กได้");
  };

  const handleOpenFolder = (id) => setSearchParams({ folder_id: id });

  const formatDate = (isoDate) => {
    if (!isoDate) return "-";
    const date = new Date(isoDate);
    return date.toLocaleString();
  };

  return (
    <div className='project-detailcontainer'>
      <h2 className="text-xl font-bold mb-4">📁 Project Drive</h2>

      <div className="flex flex-wrap gap-3 items-center mb-6">
        <input type="file" onChange={handleFileChange} className="border p-2" />
        {fileToUpload && <span className="text-sm text-gray-700">{fileToUpload.name}</span>}
        <button onClick={handleUploadConfirm} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700" disabled={!fileToUpload}>Upload</button>
        <input type="text" placeholder="New folder name" value={folderName} onChange={e => setFolderName(e.target.value)} className="border p-2" />
        <button onClick={handleCreateFolder} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Create Folder</button>
      </div>

      <table className="w-full text-sm table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-4 py-2 border">📄 ชื่อ</th>
            <th className="px-4 py-2 border">🏷️ ประเภท</th>
            <th className="px-4 py-2 border">📦 ขนาด</th>
            <th className="px-4 py-2 border">📅 เวลาอัปโหลด</th>
            <th className="px-4 py-2 border">🔧 การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => {
            const isBookmarked = bookmarkedIds.includes(`${item.type}-${item.id}`);
            return (
              <tr key={`${item.type}-${item.id}`} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">
                  <span
                    onClick={() => item.type === 'folder' && handleOpenFolder(item.id)}
                    className={item.type === 'folder' ? 'text-blue-600 hover:underline cursor-pointer' : ''}>
                    {item.type === 'folder' ? '📁' : '📄'} {item.name}
                  </span>
                </td>
                <td className="px-4 py-2 border capitalize">{item.type}</td>
                <td className="px-4 py-2 border">
                  {item.type === 'file' ? `${(item.file_size / 1024).toFixed(1)} KB` : '-'}
                </td>
                <td className="px-4 py-2 border">{formatDate(item.upload_date)}</td>
                <td className="px-4 py-2 border">
                  <div className="flex gap-3">
                    <button onClick={() =>
                      window.open(
                        item.type === 'file'
                          ? `http://localhost:3000/api/files/download/${item.id}`
                          : `http://localhost:3000/api/folders/download/${item.id}`,
                        '_blank'
                      )
                    } className="text-blue-600 hover:text-blue-800" title="Download">
                      <FiDownload />
                    </button>
                    <button
                      onClick={() => handleBookmark(item)}
                      className={isBookmarked ? "text-yellow-600" : "text-gray-400"}
                      title="Bookmark"
                    >
                      {isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {folderId && (
        <button onClick={() => navigate(-1)} className="mt-6 text-sm text-gray-600 underline">← กลับ</button>
      )}
    </div>
  );
}

export default ProjectDetail;
