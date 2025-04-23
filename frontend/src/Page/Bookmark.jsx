import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function Bookmark() {
  const { id } = useParams(); // ดึง id จาก URL
  const [bookmark, setBookmark] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3000/api/bookmarks/${id}`)
      .then((res) => res.json())
      .then((data) => setBookmark(data))
      .catch((err) => console.error("Error fetching bookmark:", err));
  }, [id]);

  if (!bookmark) {
    return <div>Loading...</div>;
  }

  return (
    <div className="table-share">
      <h1>Bookmark</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>ชื่อ</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>วันที่แชร์</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>ประเภท</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>สถานะ</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>{bookmark.name}</td>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>{bookmark.dateShared}</td>
            <td style={{ border: "1px solid #ccc", padding: "8px" }}>{bookmark.type}</td>
            <td style={{ border: "1px solid #ccc", padding: "8px", color: bookmark.status === "เสร็จสิ้น" ? "green" : "red" }}>
              {bookmark.status}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Bookmark;
