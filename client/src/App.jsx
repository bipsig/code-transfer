import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'https://crovixa-server.onrender.com';

function App() {
  const [filename, setFilename] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');

  // Fetch all files on component mount
  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await fetch(`${API_URL}/files`);
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Error fetching files:', error);
      setMessage('Error fetching files');
    }
  };

  const handleSave = async () => {
    if (!filename.trim() || !content.trim()) {
      setMessage('Please enter both filename and content');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename, content }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage(data.message);
        setFilename('');
        setContent('');
        fetchFiles(); // Refresh the file list
      } else {
        setMessage(data.message || 'Error saving file');
      }
    } catch (error) {
      console.error('Error saving file:', error);
      setMessage('Error saving file');
    }
  };

  const handleFileClick = (file) => {
    setSelectedFile(file);
  };

  const handleNewFile = () => {
    setSelectedFile(null);
    setFilename('');
    setContent('');
    setMessage('');
  };

  return (
    <div className="App">
      <div className="container">
        <h1>Code Snippet Manager</h1>
        
        {/* Editor Section */}
        <div className="editor-section">
          <div className="input-group">
            <label htmlFor="filename">File Name:</label>
            <input
              type="text"
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="e.g., myScript.js"
            />
          </div>

          <div className="input-group">
            <label htmlFor="content">Code Content:</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your code snippet here..."
              rows="15"
            />
          </div>

          <button onClick={handleSave} className="btn-save">
            Save File
          </button>

          {message && <div className="message">{message}</div>}
        </div>

        {/* Files List Section */}
        <div className="files-section">
          <div className="files-header">
            <h2>Saved Files</h2>
            <button onClick={handleNewFile} className="btn-new">
              New File
            </button>
          </div>

          <div className="files-list">
            {files.length === 0 ? (
              <p className="no-files">No files saved yet</p>
            ) : (
              files.map((file) => (
                <div
                  key={file._id}
                  className={`file-item ${selectedFile?._id === file._id ? 'active' : ''}`}
                  onClick={() => handleFileClick(file)}
                >
                  <span className="file-name">{file.filename}</span>
                  <span className="file-date">
                    {new Date(file.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* File Content Display */}
        {selectedFile && (
          <div className="content-display">
            <h3>File: {selectedFile.filename}</h3>
            <pre className="code-content">{selectedFile.content}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;