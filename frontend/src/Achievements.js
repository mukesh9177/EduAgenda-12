import React, { useEffect, useState } from 'react';

function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [showCertificationForm, setShowCertificationForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ''
  });
  const [certificationData, setCertificationData] = useState({
    title: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    certificateNumber: '',
    description: '',
    status: 'active'
  });
  const [certificateFile, setCertificateFile] = useState(null);
  const [achievementFile, setAchievementFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch achievements on mount
  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/achievements', {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      });
      const data = await res.json();
      if (data.success) {
        setAchievements(data.data);
      } else {
        setError(data.message || 'Failed to fetch achievements');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const formDataToSend = new FormData();
      
      // Add all form data
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Add file if selected
      if (achievementFile) {
        formDataToSend.append('certificate', achievementFile);
      }
      
      const res = await fetch('/api/achievements', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: formDataToSend
      });
      const data = await res.json();
      if (data.success) {
        setAchievements([...achievements, data.data]);
        setFormData({
          title: '',
          description: '',
          category: ''
        });
        setAchievementFile(null);
      } else {
        setError(data.message || 'Failed to add achievement');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/achievements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      });
      const data = await res.json();
      if (data.success) {
        setAchievements(achievements.filter(achievement => achievement._id !== id));
      } else {
        setError(data.message || 'Failed to delete achievement');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  const handleCertificationChange = (e) => {
    setCertificationData({
      ...certificationData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setCertificateFile(e.target.files[0]);
  };

  const handleAchievementFileChange = (e) => {
    setAchievementFile(e.target.files[0]);
  };

  const handleAddCertification = async (e) => {
    e.preventDefault();
    if (!selectedAchievement) return;

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('certificate', certificateFile);
    Object.keys(certificationData).forEach(key => {
      if (certificationData[key]) {
        formData.append(key, certificationData[key]);
      }
    });

    try {
      const res = await fetch(`/api/achievements/${selectedAchievement._id}/certifications`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        // Update the achievement in the list
        setAchievements(achievements.map(achievement => 
          achievement._id === selectedAchievement._id ? data.data : achievement
        ));
        setSelectedAchievement(data.data);
        setShowCertificationForm(false);
        setCertificationData({
          title: '',
          issuer: '',
          issueDate: '',
          expiryDate: '',
          certificateNumber: '',
          description: '',
          status: 'active'
        });
        setCertificateFile(null);
      } else {
        setError(data.message || 'Failed to add certification');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  const handleDeleteCertification = async (achievementId, certificationId) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/achievements/${achievementId}/certifications/${certificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      });
      const data = await res.json();
      if (data.success) {
        // Update the achievement in the list
        const updatedAchievement = achievements.find(a => a._id === achievementId);
        if (updatedAchievement) {
          updatedAchievement.certifications = updatedAchievement.certifications.filter(
            cert => cert._id !== certificationId
          );
          setAchievements([...achievements]);
          if (selectedAchievement && selectedAchievement._id === achievementId) {
            setSelectedAchievement(updatedAchievement);
          }
        }
      } else {
        setError(data.message || 'Failed to delete certification');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  const handleDownloadAttachment = async (achievementId, attachmentIndex) => {
    try {
      const achievement = achievements.find(a => a._id === achievementId);
      if (!achievement || !achievement.attachments || !achievement.attachments[attachmentIndex]) {
        setError('Attachment not found');
        return;
      }
      
      const attachment = achievement.attachments[attachmentIndex];
      const res = await fetch(`http://localhost:5000${attachment.url}`, {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = attachment.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to download attachment');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleDownloadCertification = async (achievementId, certificationId) => {
    try {
      const res = await fetch(`/api/achievements/${achievementId}/certifications/${certificationId}/download`, {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'certificate';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to download certificate');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Achievements & Certifications</h2>
      
      {/* Achievement Form */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>Add New Achievement</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="title">Achievement Title:</label>
            <input 
              type="text" 
              id="title" 
              name="title"
              value={formData.title} 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="description">Description:</label>
            <textarea 
              id="description" 
              name="description"
              value={formData.description} 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '8px', marginTop: '5px', height: '80px' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="category">Category:</label>
            <select 
              id="category" 
              name="category"
              value={formData.category} 
              onChange={handleChange} 
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            >
              <option value="">Select Category</option>
              <option value="academic">Academic</option>
              <option value="personal">Personal</option>
              <option value="work">Work</option>
              <option value="health">Health</option>
              <option value="social">Social</option>
              <option value="creative">Creative</option>
              <option value="learning">Learning</option>
              <option value="other">Other</option>
            </select>
          </div>


          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="achievementFile">Certificate/Evidence File (Optional):</label>
            <input 
              type="file" 
              id="achievementFile" 
              onChange={handleAchievementFileChange} 
              accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
            <small>Accepted formats: PDF, Images, Word documents (Max 10MB)</small>
            {achievementFile && (
              <p style={{ color: 'green', fontSize: '12px', marginTop: '5px' }}>
                ✅ File selected: {achievementFile.name}
              </p>
            )}
          </div>
          <button type="submit" disabled={loading} style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            {loading ? 'Adding Achievement...' : 'Add Achievement'}
          </button>
        </form>
      </div>
      
      {error && <p style={{color: 'red', marginBottom: '20px'}}>{error}</p>}
      {loading && <p>Loading...</p>}
      
      {/* Achievements List */}
      <div>
        <h3>Your Achievements</h3>
        {achievements.length === 0 ? (
          <p>No achievements yet. Start adding your accomplishments!</p>
        ) : (
          <div>
            {achievements.map(achievement => (
              <div key={achievement._id} style={{
                border: '1px solid #ddd',
                padding: '20px',
                margin: '15px 0',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 10px 0' }}>{achievement.title}</h4>
                    <p><strong>Category:</strong> {achievement.category}</p>
                    <p><strong>Description:</strong> {achievement.description}</p>

                    
                    {/* Display uploaded files */}
                    {achievement.attachments && achievement.attachments.length > 0 && (
                      <div style={{ marginTop: '10px' }}>
                        <p><strong>Attached Files:</strong></p>
                        {achievement.attachments.map((attachment, index) => (
                          <div key={index} style={{
                            border: '1px solid #e0e0e0',
                            padding: '8px',
                            margin: '5px 0',
                            borderRadius: '4px',
                            backgroundColor: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <span>{attachment.filename}</span>
                            <button 
                              onClick={() => handleDownloadAttachment(achievement._id, index)}
                              style={{
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Certifications Section */}
                    <div style={{ marginTop: '15px' }}>
                      <h5>Certifications ({achievement.certifications ? achievement.certifications.length : 0})</h5>
                      {achievement.certifications && achievement.certifications.length > 0 ? (
                        <div>
                          {achievement.certifications.map(cert => (
                            <div key={cert._id} style={{
                              border: '1px solid #e0e0e0',
                              padding: '10px',
                              margin: '10px 0',
                              borderRadius: '4px',
                              backgroundColor: 'white'
                            }}>
                              <p><strong>{cert.title}</strong> - {cert.issuer}</p>
                              <p>Issue Date: {new Date(cert.issueDate).toLocaleDateString()}</p>
                              {cert.expiryDate && (
                                <p>Expiry Date: {new Date(cert.expiryDate).toLocaleDateString()}</p>
                              )}
                              {cert.certificateNumber && (
                                <p>Certificate #: {cert.certificateNumber}</p>
                              )}
                              {cert.description && (
                                <p>Description: {cert.description}</p>
                              )}
                              <p>Status: <span style={{
                                color: cert.status === 'active' ? 'green' : 
                                       cert.status === 'expired' ? 'red' : 'orange'
                              }}>{cert.status}</span></p>
                              <div style={{ marginTop: '10px' }}>
                                <button 
                                  onClick={() => handleDownloadCertification(achievement._id, cert._id)}
                                  style={{
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    padding: '5px 10px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    marginRight: '10px'
                                  }}
                                >
                                  Download
                                </button>
                                <button 
                                  onClick={() => handleDeleteCertification(achievement._id, cert._id)}
                                  style={{
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    padding: '5px 10px',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>No certifications added yet.</p>
                      )}
                      
                      <button 
                        onClick={() => {
                          setSelectedAchievement(achievement);
                          setShowCertificationForm(true);
                        }}
                        style={{
                          backgroundColor: '#17a2b8',
                          color: 'white',
                          border: 'none',
                          padding: '8px 15px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          marginTop: '10px'
                        }}
                      >
                        Add Certification
                      </button>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleDelete(achievement._id)}
                    disabled={loading}
                    style={{
                      backgroundColor: '#ff4444',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete Achievement
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certification Upload Modal */}
      {showCertificationForm && selectedAchievement && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3>Add Certification to "{selectedAchievement.title}"</h3>
            <form onSubmit={handleAddCertification}>
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="certTitle">Certification Title:</label>
                <input 
                  type="text" 
                  id="certTitle" 
                  name="title"
                  value={certificationData.title} 
                  onChange={handleCertificationChange} 
                  required 
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="issuer">Issuer:</label>
                <input 
                  type="text" 
                  id="issuer" 
                  name="issuer"
                  value={certificationData.issuer} 
                  onChange={handleCertificationChange} 
                  required 
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="issueDate">Issue Date:</label>
                <input 
                  type="date" 
                  id="issueDate" 
                  name="issueDate"
                  value={certificationData.issueDate} 
                  onChange={handleCertificationChange} 
                  required 
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="expiryDate">Expiry Date (Optional):</label>
                <input 
                  type="date" 
                  id="expiryDate" 
                  name="expiryDate"
                  value={certificationData.expiryDate} 
                  onChange={handleCertificationChange} 
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="certificateNumber">Certificate Number (Optional):</label>
                <input 
                  type="text" 
                  id="certificateNumber" 
                  name="certificateNumber"
                  value={certificationData.certificateNumber} 
                  onChange={handleCertificationChange} 
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="certDescription">Description (Optional):</label>
                <textarea 
                  id="certDescription" 
                  name="description"
                  value={certificationData.description} 
                  onChange={handleCertificationChange} 
                  style={{ width: '100%', padding: '8px', marginTop: '5px', height: '80px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="status">Status:</label>
                <select 
                  id="status" 
                  name="status"
                  value={certificationData.status} 
                  onChange={handleCertificationChange} 
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                >
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="pending">Pending</option>
                  <option value="revoked">Revoked</option>
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="certificateFile">Certificate File:</label>
                <input 
                  type="file" 
                  id="certificateFile" 
                  onChange={handleFileChange} 
                  required 
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
                <small>Accepted formats: PDF, Images, Word documents (Max 10MB)</small>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  onClick={() => setShowCertificationForm(false)}
                  style={{
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {loading ? 'Adding...' : 'Add Certification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Achievements; 