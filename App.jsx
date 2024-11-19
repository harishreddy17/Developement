import React, { useState, useRef, useEffect } from "react";

const App = () => {
  const [damageDetails, setDamageDetails] = useState([]);
  const [processedFrames, setProcessedFrames] = useState([]);
  const [processedImage, setProcessedImage] = useState(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [flag, setFlag] = useState(false);

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    setFlag(false);
    if (file) {
      setLoading(true);
      setError(null);
      setProcessedImage(null);
      setProcessedFrames([]);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch(
          "https://cardamageai.ctruh.org/process-video-frames/",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setProcessedFrames(data.frames);
        setDamageDetails(data.damage_summary);
        setFlag(true);
      } catch (error) {
        console.error("Error processing video:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    setFlag(false);
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      setLoading(true);
      setError(null);
      setProcessedFrames([]);
      setProcessedImage(null);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch(
          "https://cardamageai.ctruh.org/process-image/",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setProcessedImage(`data:image/jpeg;base64,${data.image}`);
        setDamageDetails(data.damage_details);
        setFlag(true);
      } catch (error) {
        console.error("Error processing image:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const calculateSummary = (damages) => {
    const summary = damages.reduce((acc, damage) => {
      acc[damage.type] = (acc[damage.type] || 0) + 1;
      return acc;
    }, {});
    return summary;
  };

  const handleNextFrame = () => {
    setCurrentFrameIndex((prevIndex) =>
      prevIndex < processedFrames.length - 1 ? prevIndex + 1 : prevIndex
    );
  };

  const handlePreviousFrame = () => {
    setCurrentFrameIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : prevIndex
    );
  };

  return (
    <div className="processor">
      <h1>AI-Based Car Damage Detection</h1>
      <div className="upload-controls">
        <div className="upload-section">
          <label>Upload Video:</label>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            disabled={loading}
          />
        </div>
        <div className="upload-section">
          <label>Upload Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={loading}
          />
        </div>
      </div>

      {loading && <p>Processing...</p>}
      {error && <p className="error">Error: {error}</p>}

      {processedImage && flag && (
        <div className="image-container">
          <img
            src={processedImage}
            alt="Processed"
            style={{ maxWidth: "100%" }}
          />
        </div>
      )}

      {processedFrames.length > 0 && flag && (
        <div className="frame-container">
          <img
            src={`data:image/jpeg;base64,${processedFrames[currentFrameIndex].frame}`}
            alt={`Frame ${currentFrameIndex}`}
            style={{ maxWidth: "100%" }}
          />
          <div className="frame-controls">
            <button
              onClick={handlePreviousFrame}
              disabled={currentFrameIndex === 0}
            >
              Previous Frame
            </button>
            <span>
              Frame {currentFrameIndex + 1} / {processedFrames.length}
            </span>
            <button
              onClick={handleNextFrame}
              disabled={currentFrameIndex === processedFrames.length - 1}
            >
              Next Frame
            </button>
          </div>
        </div>
      )}

      {damageDetails.length > 0 && flag && (
        <div className="damage-summary">
          <h3>Damage Summary:</h3>
          <div className="summary-container">
            {Object.entries(calculateSummary(damageDetails)).map(
              ([type, count]) => (
                <div key={type} className="summary-item">
                  <span className="damage-type">{type}:</span>
                  <span className="damage-count">{count}</span>
                </div>
              )
            )}
          </div>
        </div>
      )}

      <style jsx="true">{`
        .processor {
          max-width: 800px;
          padding: 20px;
        }
        .upload-controls {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
        }
        .upload-section {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .image-container,
        .frame-container {
          margin-top: 20px;
        }
        .frame-controls {
          margin-top: 10px;
          display: flex;
          gap: 10px;
          justify-content: center;
        }
        .error {
          color: red;
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
};

export default App;
