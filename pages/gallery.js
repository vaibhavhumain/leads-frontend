import React, { useEffect, useState } from "react";
import { sanity } from "../lib/sanity";
import imageUrlBuilder from "@sanity/image-url";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";

const builder = imageUrlBuilder(sanity);
function urlFor(source) {
  return builder.image(source).auto("format").fit("max").url();
}

export default function Gallery() {
  const [categories, setCategories] = useState([]);
  const [models, setModels] = useState([]);
  const [buses, setBuses] = useState([]);
  const [images, setImages] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedBus, setSelectedBus] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [swiperInstance, setSwiperInstance] = useState(null);

  // Set beautiful gradient background on mount
  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background =
      "linear-gradient(135deg, #e0e7ff 0%, #f3f8ff 50%, #dbeafe 100%)";
    return () => {
      document.body.style.background = prev;
    };
  }, []);

  // Fetch categories on mount
  useEffect(() => {
    sanity.fetch(`*[_type == "category"]{_id, title}`).then(setCategories);
  }, []);

  // Fetch models when category selected
  useEffect(() => {
    if (!selectedCategory) return setModels([]);
    sanity
      .fetch(
        `*[_type == "model" && parentCategory._ref == $catId]{_id, title}`,
        { catId: selectedCategory }
      )
      .then(setModels);
    setSelectedModel("");
    setBuses([]);
    setSelectedBus("");
    setImages([]);
  }, [selectedCategory]);

  // Fetch buses when model selected
  useEffect(() => {
    if (!selectedModel) return setBuses([]);
    sanity
      .fetch(
        `*[_type == "bus" && model._ref == $modelId]{_id, serialNumber}`,
        { modelId: selectedModel }
      )
      .then(setBuses);
    setSelectedBus("");
    setImages([]);
  }, [selectedModel]);

  // Fetch images when bus selected
  useEffect(() => {
    if (!selectedBus) return setImages([]);
    sanity
      .fetch(
        `*[_type == "busImage" && bus._ref == $busId]{_id, label, image}`,
        { busId: selectedBus }
      )
      .then(setImages);
    setSelectedImages(new Set());
  }, [selectedBus]);

  // WhatsApp share: Use Web Share API for images (mobile only, or prompt download for desktop)
  async function handleWhatsAppShareSelected() {
    const imgs = images.filter((img) => selectedImages.has(img._id));
    if (imgs.length === 0) return alert("No images selected!");

    // Try native share (only on mobile and modern browsers)
    if (
      navigator.canShare &&
      navigator.canShare({ files: [new File([], "a.jpg", { type: "image/jpeg" })] })
    ) {
      const files = [];
      for (const img of imgs) {
        const imgUrl = urlFor(img.image);
        const response = await fetch(imgUrl);
        const blob = await response.blob();
        files.push(
          new File([blob], `${img.label || "bus-image"}.jpg`, { type: blob.type })
        );
      }
      try {
        await navigator.share({
          files,
          title: "Bus Images from Gobind Coach",
          text: "Here are some bus images!",
        });
        return;
      } catch (e) {
        alert("Native sharing cancelled or not available.");
      }
    }

    // Fallback: ZIP and prompt download
    const zip = new JSZip();
    for (const img of imgs) {
      const imgUrl = urlFor(img.image);
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      zip.file(`${img.label || "bus-image"}.jpg`, blob);
    }
    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, "bus-images.zip");
    alert("ZIP file downloaded. Please send it on WhatsApp manually.");
  }

  // Download an image
  async function handleDownloadImage(imgUrl, label = "bus-image") {
    const response = await fetch(imgUrl);
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `${label}.jpg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  // Image select toggle
  function toggleSelectImage(imgId) {
    setSelectedImages((prev) => {
      const s = new Set(prev);
      if (s.has(imgId)) s.delete(imgId);
      else s.add(imgId);
      return s;
    });
  }

  // --- Select All/Deselect All Logic ---
  const allSelected = images.length > 0 && selectedImages.size === images.length;
  function handleSelectAllToggle() {
    if (allSelected) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(images.map(img => img._id)));
    }
  }

  // Keyboard navigation in modal (Esc to close, arrows to switch)
  useEffect(() => {
    if (!modalOpen) return;
    function onKey(e) {
      if (e.key === "Escape") setModalOpen(false);
      if (e.key === "ArrowRight" && modalIndex < images.length - 1)
        setModalIndex((i) => i + 1);
      if (e.key === "ArrowLeft" && modalIndex > 0)
        setModalIndex((i) => i - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen, modalIndex, images.length]);

  // Swiper next/prev buttons
  const handlePrev = () => {
    if (swiperInstance && modalIndex > 0) {
      swiperInstance.slidePrev();
    }
  };
  const handleNext = () => {
    if (swiperInstance && modalIndex < images.length - 1) {
      swiperInstance.slideNext();
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 text-blue-800 drop-shadow text-center">
        Bus Image Gallery
      </h1>
      {/* Category Dropdowns */}
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <div>
          <label className="font-semibold mr-2">Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border rounded p-2 min-w-[200px]"
          >
            <option value="">--Select Category--</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
        {models.length > 0 && (
          <div>
            <label className="font-semibold mr-2">Model:</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="border rounded p-2 min-w-[200px]"
            >
              <option value="">--Select Model--</option>
              {models.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>
        )}
        {buses.length > 0 && (
          <div>
            <label className="font-semibold mr-2">Bus:</label>
            <select
              value={selectedBus}
              onChange={(e) => setSelectedBus(e.target.value)}
              className="border rounded p-2 min-w-[200px]"
            >
              <option value="">--Select Bus--</option>
              {buses.map((bus) => (
                <option key={bus._id} value={bus._id}>
                  {bus.serialNumber}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* WhatsApp Share, Select All/Deselect All */}
      {selectedBus && images.length > 0 && (
        <div className="mb-6 flex gap-3 items-center flex-wrap">
          <button
            className="bg-green-600 text-white rounded px-4 py-2 font-semibold shadow hover:bg-green-700"
            onClick={handleWhatsAppShareSelected}
          >
            Share Selected Images (Native/ZIP)
          </button>
          <button
            className={`rounded px-4 py-2 font-semibold shadow transition
              ${allSelected
                ? "bg-gray-200 text-blue-600 hover:bg-gray-100"
                : "bg-blue-600 text-white hover:bg-blue-700"}
            `}
            onClick={handleSelectAllToggle}
          >
            {allSelected ? "Deselect All" : "Select All"}
          </button>
          <span className="text-base text-gray-600">
            {selectedImages.size
              ? `${selectedImages.size} image(s) selected`
              : "Select images below"}
          </span>
        </div>
      )}

      {/* Image Gallery */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {images.map((img, idx) => {
          let imgUrl = "";
          if (img.image && img.image.asset) imgUrl = urlFor(img.image);
          const isSelected = selectedImages.has(img._id);
          return (
            <div
              key={img._id}
              className={`border rounded-2xl shadow bg-white p-3 flex flex-col items-center cursor-pointer transition-all relative group ${
                isSelected
                  ? "ring-4 ring-blue-400"
                  : "hover:ring-2 hover:ring-blue-200"
              }`}
            >
              {/* Select checkbox overlay */}
              <input
                type="checkbox"
                checked={isSelected}
                onChange={e => {
                  e.stopPropagation();
                  toggleSelectImage(img._id);
                }}
                className="absolute top-3 left-3 w-5 h-5 accent-blue-600 z-10"
                title={isSelected ? "Deselect" : "Select"}
              />
              {/* Clicking img opens modal, NOT card/cell */}
              {imgUrl ? (
                <img
                  src={imgUrl}
                  alt={img.label}
                  className="w-full h-40 object-cover rounded-xl mb-2 border"
                  style={{ cursor: "zoom-in" }}
                  onClick={() => {
                    setModalOpen(true);
                    setModalIndex(idx);
                  }}
                />
              ) : (
                <div className="w-full h-40 flex items-center justify-center text-gray-400 bg-gray-100 rounded-xl mb-2 border">
                  No Image
                </div>
              )}
              <div className="font-medium text-center">{img.label}</div>
            </div>
          );
        })}
      </div>

      {/* Full-Screen Modal with Swiper */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <div
            className="absolute inset-0"
            style={{ backdropFilter: "blur(4px)" }}
            onClick={() => setModalOpen(false)}
          />
          {/* Custom prev/next buttons */}
          <button
            onClick={handlePrev}
            disabled={modalIndex === 0}
            className={`absolute left-6 top-1/2 -translate-y-1/2 z-50 text-4xl text-white bg-black/50 rounded-full px-3 py-2 shadow-lg hover:bg-blue-600 transition ${
              modalIndex === 0 ? "opacity-40 cursor-not-allowed" : ""
            }`}
            title="Previous"
          >
            &#8592;
          </button>
          <div className="relative w-full max-w-3xl mx-auto p-0 sm:p-6">
            <Swiper
              navigation={false}
              keyboard={{ enabled: true }}
              initialSlide={modalIndex}
              onSwiper={setSwiperInstance}
              onSlideChange={(swiper) => setModalIndex(swiper.activeIndex)}
              style={{ borderRadius: "1.5rem" }}
            >
              {images.map((img, idx) => {
                const imgUrl = img.image && img.image.asset ? urlFor(img.image) : "";
                return (
                  <SwiperSlide key={img._id}>
                    <img
                      src={imgUrl}
                      alt={img.label}
                      className="w-full max-h-[70vh] object-contain rounded-2xl bg-white mx-auto"
                      style={{ boxShadow: "0 2px 16px 0 rgba(0,0,0,0.3)" }}
                    />
                    <div className="text-center text-lg font-bold text-white mt-4 drop-shadow">
                      {img.label}
                    </div>
                    <div className="flex justify-center gap-4 mt-3">
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded font-semibold"
                        onClick={async () => await handleDownloadImage(imgUrl, img.label)}
                      >
                        Download
                      </button>
                      <button
                        className="bg-green-600 text-white px-4 py-2 rounded font-semibold"
                        onClick={async () => {
                          // Try share one image natively
                          if (
                            navigator.canShare &&
                            navigator.canShare({
                              files: [new File([], "a.jpg", { type: "image/jpeg" })],
                            })
                          ) {
                            const response = await fetch(imgUrl);
                            const blob = await response.blob();
                            const file = new File(
                              [blob],
                              `${img.label || "bus-image"}.jpg`,
                              { type: blob.type }
                            );
                            await navigator.share({
                              files: [file],
                              title: "Bus Image from Gobind Coach",
                              text: "Check out this bus image!",
                            });
                          } else {
                            await handleDownloadImage(imgUrl, img.label);
                            alert("Downloaded! Now share via WhatsApp manually.");
                          }
                        }}
                      >
                        Share/Send
                      </button>
                      <button
                        className={`border-2 px-4 py-2 rounded font-semibold ${
                          selectedImages.has(img._id)
                            ? "bg-blue-400 border-blue-600 text-white"
                            : "bg-white border-blue-400 text-blue-700"
                        }`}
                        onClick={() => toggleSelectImage(img._id)}
                      >
                        {selectedImages.has(img._id) ? "Deselect" : "Select"}
                      </button>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-2 right-2 text-4xl text-white bg-black/50 rounded-full p-2 hover:bg-red-600 transition"
              title="Close"
            >
              ×
            </button>
          </div>
          <button
            onClick={handleNext}
            disabled={modalIndex === images.length - 1}
            className={`absolute right-6 top-1/2 -translate-y-1/2 z-50 text-4xl text-white bg-black/50 rounded-full px-3 py-2 shadow-lg hover:bg-blue-600 transition ${
              modalIndex === images.length - 1
                ? "opacity-40 cursor-not-allowed"
                : ""
            }`}
            title="Next"
          >
            &#8594;
          </button>
        </div>
      )}
    </div>
  );
}
