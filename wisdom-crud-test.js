import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 10 }, // naik ke 10 user
    { duration: '20s', target: 100 }, // stabil 100 user
    { duration: '20s', target: 100 }, // stabil 100 user
    { duration: '20s', target: 100 }, // stabil 100 user
    { duration: '10s', target: 0 },  // turun lagi
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],   // error < 1%
    http_req_duration: ['p(95)<600'], // 95% response < 400ms
  },
};

// IP server kamu di sini 👇
const BASE_URL = 'http://127.0.0.1:3001';

export default function () {
  // 1️⃣ Tambah data
  const addPayload = JSON.stringify({ text: `kata bijak ${Math.random()}` });
  const addHeaders = { 'Content-Type': 'application/json' };
  const addRes = http.post(`${BASE_URL}/add`, addPayload, { headers: addHeaders });

  check(addRes, {
    'Add success (200)': (r) => r.status === 200,
  });

  // 2️⃣ Ambil semua data
  const getAllRes = http.get(`${BASE_URL}/all`);
  check(getAllRes, {
    'Get all (200)': (r) => r.status === 200,
  });

  const allItems = getAllRes.json();
  let lastId = 0;

  // Ambil ID terakhir kalau ada
  if (Array.isArray(allItems) && allItems.length > 0) {
    lastId = allItems[allItems.length - 1].id;
  }

  // 3️⃣ Edit data terakhir
  if (lastId) {
    const editPayload = JSON.stringify({ text: `update kata bijak ${Math.random()}` });
    const editRes = http.put(`${BASE_URL}/edit/${lastId}`, editPayload, { headers: addHeaders });
    check(editRes, {
      'Edit success (200)': (r) => r.status === 200,
    });
  }

  // 4️⃣ Hapus data terakhir
  if (lastId) {
    const delRes = http.del(`${BASE_URL}/delete/${lastId}`);
    check(delRes, {
      'Delete success (200)': (r) => r.status === 200,
    });
  }

  sleep(1); // jeda antar user
}
