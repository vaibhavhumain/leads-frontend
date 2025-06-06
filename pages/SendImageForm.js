import React, { useState } from 'react';

import BASE_URL from '../utils/api';
export default function ImageUploadForm() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      alert('Please select an image first.');
      return;
    }

    const formData = new FormData();
    formData.append('image', image);

    try {
      const res = await fetch(`${BASE_URL}/api/upload/upload-image`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setUploadedUrl(`${BASE_URL}${data.path}`);
        alert('Image uploaded successfully!');
        window.location.href = '/gallery';
      } else {
        alert('Upload failed.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('An error occurred while uploading.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      {preview && (
        <div style={{ margin: '10px 0' }}>
          <img src={preview} alt="Preview" style={{ maxWidth: '300px', borderRadius: '8px' }} />
        </div>
      )}
      <button type="submit">Upload Image</button>

      {uploadedUrl && (
        <div style={{ marginTop: '15px' }}>
          <p>Uploaded Image URL:</p>
          <a href={uploadedUrl} target="_blank" rel="noopener noreferrer">
            {uploadedUrl}
          </a>
        </div>
      )}
    </form>
  );
}
