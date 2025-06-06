import React, { useEffect, useState } from 'react';
import BASE_URL from '../utils/api';
import { Router } from 'next/router';
 export default function Gallery() {
  const [images, setImages] = useState([]);


  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const phone = params.get('phone');
  const name = params.get('name');
  const img = params.get('img');

  if (phone && img) {
    sendViaWhatsApp(img, phone, name || 'Customer');
  }
}, []);

  useEffect(() => {
    fetch(`${BASE_URL}/api/upload/all-images`)
  .then(res => res.json())
  .then(data => {
    if (data.success) setImages(data.images); 
  });
  }, []);

  const sendViaWhatsApp = async (imageUrl, phone, clientName = '') => {
  const cleanedContact = phone.replace(/\D/g, '');
  if (!/^\d{10}$/.test(cleanedContact)) {
    alert("❌ Invalid contact number");
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/api/send/send-whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: cleanedContact,
        imageUrl,
        clientName: clientName || 'Customer',
      }),
    });

    const data = await res.json();
    if (data.success) {
      alert('✅ Image sent via WhatsApp!');
    } else {
      alert('❌ Failed to send image.');
    }
  } catch (err) {
    console.error(err);
    alert('❌ Error occurred while sending the message.');
  }
};


  return (
    <div style={{ padding: 20 }}>
      <h2>Uploaded Images Gallery</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
        {images.map((img, idx) => (
          <div key={idx} style={{ textAlign: 'center' }}>
            <img src={img} alt={`uploaded-${idx}`} style={{ width: 200, borderRadius: 10 }} />
            <br />
            <button
              onClick={() => sendViaWhatsApp(img)}
              style={{
                marginTop: 8,
                padding: '6px 12px',
                borderRadius: '6px',
                backgroundColor: '#25D366',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              📤 Send via WhatsApp
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
