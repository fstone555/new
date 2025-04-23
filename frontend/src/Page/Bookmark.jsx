import { useEffect, useState } from "react";

function Bookmark() {
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/bookmark", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then(setBookmarks)
      .catch((err) => console.error("Error fetching bookmark:", err));
  }, []);

  return (
    <div className="table-share p-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">⭐ Bookmark ของฉัน</h1>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">ชื่อ</th>
            <th className="border px-4 py-2">ประเภท</th>
            <th className="border px-4 py-2">โปรเจกต์</th>
            <th className="border px-4 py-2">วันที่บุ๊คมาร์ค</th>
          </tr>
        </thead>
        <tbody>
          {bookmarks.map((item) => (
            <tr key={`${item.item_type}-${item.item_id}`} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{item.item_name || "(ไม่มีชื่อ)"}</td>
              <td className="border px-4 py-2 capitalize">{item.item_type}</td>
              <td className="border px-4 py-2">{item.project_id}</td>
              <td className="border px-4 py-2">{new Date(item.bookmarked_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Bookmark;
