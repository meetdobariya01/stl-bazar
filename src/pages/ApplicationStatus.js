// pages/ApplicationStatus.js - UPDATED WITH WEBSITE & PRICING PLAN

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Card,
  Spinner,
  Alert,
  Badge,
  Row,
  Col,
  Button,
} from "react-bootstrap";
import {
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaStore,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaArrowLeft,
  FaUser,
  FaCalendarAlt,
  FaInfoCircle,
  FaGlobe,
  FaTag,
  FaLeaf,
} from "react-icons/fa";
import axios from "axios";
import Header from "../components/header/header";
import Footer from "../components/footer/footer";
import "./ApplicationStatus.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:9000/api";

const ApplicationStatus = () => {
  const { trackingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [application, setApplication] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        console.log("🔍 ApplicationStatus Page Loaded");
        console.log("📌 Tracking ID:", trackingId);

        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (!token) {
          setError("Invalid tracking link. Please check your email.");
          setLoading(false);
          return;
        }

        if (!trackingId) {
          setError("No tracking ID provided in the URL.");
          setLoading(false);
          return;
        }

        const apiUrl = `${API_URL}/sellers/status/${trackingId}?token=${token}`;
        console.log("🌐 Calling API:", apiUrl);

        const response = await axios.get(apiUrl);
        console.log("📥 API Response:", response.data);

        if (response.data.success) {
          setApplication(response.data.data);
        } else {
          setError(response.data.message || "Failed to fetch application status");
        }
      } catch (err) {
        console.error("❌ Status fetch error:", err);
        setError(
          err.response?.data?.message || 
          "Failed to fetch application status. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [trackingId, location]);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return (
          <Badge bg="warning" className="status-badge-pending px-4 py-2">
            <FaClock className="me-2" /> Pending Review
          </Badge>
        );
      case 'approved':
        return (
          <Badge bg="success" className="status-badge-approved px-4 py-2">
            <FaCheckCircle className="me-2" /> Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge bg="danger" className="status-badge-rejected px-4 py-2">
            <FaTimesCircle className="me-2" /> Rejected
          </Badge>
        );
      default:
        return <Badge bg="secondary" className="px-4 py-2">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending':
        return <FaClock className="status-icon pending" />;
      case 'approved':
        return <FaCheckCircle className="status-icon approved" />;
      case 'rejected':
        return <FaTimesCircle className="status-icon rejected" />;
      default:
        return <FaInfoCircle className="status-icon" />;
    }
  };

  const getStatusMessage = (status) => {
    switch(status) {
      case 'pending':
        return {
          title: "⏳ Application Under Review",
          description: "Your application is currently being reviewed by our team. We'll notify you via email once a decision is made.",
          color: "#f39c12"
        };
      case 'approved':
        return {
          title: "🎉 Application Approved!",
          description: "Congratulations! Your application has been approved. You can now login to your vendor dashboard.",
          color: "#27ae60"
        };
      case 'rejected':
        return {
          title: "📋 Application Not Approved",
          description: "We regret to inform you that your application was not approved at this time.",
          color: "#e74c3c"
        };
      default:
        return {
          title: "Status Unknown",
          description: "Unable to determine application status.",
          color: "#6c757d"
        };
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      "Organic Food & Healthy Snacks": "🍎",
      "Natural Skin Care & Wellness": "🌿",
      "Gifts & Hamper": "🎁",
      "Handmade Home Decor": "🏠",
      "Sustainable Lifestyle": "♻️",
      "Jewelry & Accessories": "💎",
      "Pet Care": "🐾",
    };
    return icons[category] || "📦";
  };

  if (loading) {
    return (
      <>
        <Header />
        <Container className="py-5 text-center" style={{ minHeight: "60vh" }}>
          <Spinner animation="border" variant="primary" size="lg" />
          <p className="mt-3 text-muted">Loading application status...</p>
          <p className="text-muted small">Tracking ID: {trackingId}</p>
        </Container>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <Container className="py-5" style={{ minHeight: "60vh" }}>
          <Row className="justify-content-center">
            <Col lg={8} md={10}>
              <Alert variant="danger" className="text-center py-5">
                <FaTimesCircle size={50} className="mb-3 text-danger" />
                <h5 className="mb-3">⚠️ {error}</h5>
                <p className="text-muted">Please check your tracking link or contact support.</p>
                <div className="mt-3">
                  <Button 
                    variant="primary" 
                    className="me-2"
                    onClick={() => navigate('/sell')}
                  >
                    <FaArrowLeft className="me-2" /> Back to Application
                  </Button>
                  <Button 
                    variant="outline-secondary"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                </div>
              </Alert>
            </Col>
          </Row>
        </Container>
        <Footer />
      </>
    );
  }

  if (!application) {
    return (
      <>
        <Header />
        <Container className="py-5" style={{ minHeight: "60vh" }}>
          <Row className="justify-content-center">
            <Col lg={8} md={10}>
              <Alert variant="warning" className="text-center py-5">
                <FaStore size={50} className="mb-3 text-warning" />
                <h5 className="mb-3">Application Not Found</h5>
                <p className="text-muted">We couldn't find an application with the provided tracking ID.</p>
                <p className="text-muted small">Tracking ID: {trackingId}</p>
                <Button 
                  variant="primary" 
                  className="mt-3"
                  onClick={() => navigate('/sell')}
                >
                  <FaArrowLeft className="me-2" /> Back to Application
                </Button>
              </Alert>
            </Col>
          </Row>
        </Container>
        <Footer />
      </>
    );
  }

  const statusInfo = getStatusMessage(application.status);

  return (
    <>
      <Header />
      <div className="application-status-page">
        <Container className="py-5">
          <Row className="justify-content-center">
            <Col lg={8} xl={7}>
              <Card className="status-card shadow-lg border-0">
                <Card.Header className="status-header" style={{ background: '#11231e', color: '#fff' }}>
                  <div className="d-flex justify-content-between align-items-center flex-wrap">
                    <h4 className="mb-0 text-white">
                      <FaStore className="me-2" />
                      Application Status
                    </h4>
                    <span className="application-id" style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '20px', fontSize: '13px' }}>
                      ID: {application.trackingId}
                    </span>
                  </div>
                </Card.Header>

                <Card.Body className="p-4">
                  <div className="text-center status-icon-container">
                    {getStatusIcon(application.status)}
                  </div>

                  <h3 className="text-center mt-3" style={{ color: statusInfo.color }}>
                    {statusInfo.title}
                  </h3>

                  <div className="text-center mb-4">
                    {getStatusBadge(application.status)}
                  </div>

                  <p className="text-center text-muted mb-4">
                    {statusInfo.description}
                  </p>

                  <div className="applicant-info mb-4">
                    <h6 className="mb-3 text-uppercase text-muted small fw-bold" style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>
                      <FaUser className="me-2" /> Application Details
                    </h6>
                    <Row>
                      <Col md={6}>
                        <div className="info-item" style={{ background: '#f8f9fa', padding: '12px 15px', borderRadius: '8px', marginBottom: '10px' }}>
                          <FaUser className="info-icon" style={{ color: '#96783f' }} />
                          <div>
                            <label style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</label>
                            <p className="mb-0" style={{ fontWeight: '600', color: '#1a1a1a' }}>{application.fullName || 'N/A'}</p>
                          </div>
                        </div>
                      </Col>

                      <Col md={6}>
                        <div className="info-item" style={{ background: '#f8f9fa', padding: '12px 15px', borderRadius: '8px', marginBottom: '10px' }}>
                          <FaBuilding className="info-icon" style={{ color: '#96783f' }} />
                          <div>
                            <label style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Business Name</label>
                            <p className="mb-0" style={{ fontWeight: '600', color: '#1a1a1a' }}>{application.businessName || 'N/A'}</p>
                          </div>
                        </div>
                      </Col>

                      <Col md={6}>
                        <div className="info-item" style={{ background: '#f8f9fa', padding: '12px 15px', borderRadius: '8px', marginBottom: '10px' }}>
                          <FaEnvelope className="info-icon" style={{ color: '#96783f' }} />
                          <div>
                            <label style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</label>
                            <p className="mb-0" style={{ fontWeight: '600', color: '#1a1a1a' }}>{application.email || 'N/A'}</p>
                          </div>
                        </div>
                      </Col>

                      <Col md={6}>
                        <div className="info-item" style={{ background: '#f8f9fa', padding: '12px 15px', borderRadius: '8px', marginBottom: '10px' }}>
                          <FaPhone className="info-icon" style={{ color: '#96783f' }} />
                          <div>
                            <label style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone Number</label>
                            <p className="mb-0" style={{ fontWeight: '600', color: '#1a1a1a' }}>{application.phoneNumber || 'N/A'}</p>
                          </div>
                        </div>
                      </Col>

                      <Col md={12}>
                        <div className="info-item" style={{ background: '#f8f9fa', padding: '12px 15px', borderRadius: '8px', marginBottom: '10px' }}>
                          <FaTag className="info-icon" style={{ color: '#96783f' }} />
                          <div>
                            <label style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Product Category</label>
                            <p className="mb-0" style={{ fontWeight: '600', color: '#1a1a1a' }}>
                              {getCategoryIcon(application.category)} {application.category || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </Col>

                      {/* ✅ Website / Social Media */}
                      <Col md={12}>
                        <div className="info-item" style={{ background: '#f8f9fa', padding: '12px 15px', borderRadius: '8px', marginBottom: '10px' }}>
                          <FaGlobe className="info-icon" style={{ color: '#96783f' }} />
                          <div>
                            <label style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Website / Social Media</label>
                            <p className="mb-0" style={{ fontWeight: '600', color: '#1a1a1a' }}>
                              {application.website ? (
                                <a href={application.website} target="_blank" rel="noopener noreferrer" style={{ color: '#96783f', textDecoration: 'none' }}>
                                  {application.website}
                                </a>
                              ) : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </Col>

                      {/* ✅ Pricing Plan */}
                      <Col md={12}>
                        <div className="info-item" style={{ background: '#f8f9fa', padding: '12px 15px', borderRadius: '8px', marginBottom: '10px' }}>
                          <FaLeaf className="info-icon" style={{ color: '#96783f' }} />
                          <div>
                            <label style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pricing Plan</label>
                            <p className="mb-0" style={{ fontWeight: '600', color: '#1a1a1a' }}>
                              {application.pricingPlan ? (
                                <Badge bg="success" style={{ fontSize: '13px' }}>{application.pricingPlan}</Badge>
                              ) : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </Col>

                      <Col md={12}>
                        <div className="info-item" style={{ background: '#f8f9fa', padding: '12px 15px', borderRadius: '8px' }}>
                          <FaCalendarAlt className="info-icon" style={{ color: '#96783f' }} />
                          <div>
                            <label style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Registered On</label>
                            <p className="mb-0" style={{ fontWeight: '600', color: '#1a1a1a' }}>
                              {application.registeredAt ? new Date(application.registeredAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  {application.status === 'rejected' && application.rejectionReason && (
                    <Alert variant="danger" className="mt-3" style={{ borderLeft: '4px solid #dc3545' }}>
                      <h6 className="mb-2">📝 Reason for Rejection</h6>
                      <p className="mb-0">{application.rejectionReason}</p>
                    </Alert>
                  )}

                  {application.adminNotes && application.status !== 'pending' && (
                    <Alert variant="info" className="mt-3" style={{ borderLeft: '4px solid #17a2b8' }}>
                      <h6 className="mb-2">📌 Admin Notes</h6>
                      <p className="mb-0">{application.adminNotes}</p>
                    </Alert>
                  )}

                  {application.status === 'approved' && application.vendor && (
                    <Alert variant="success" className="mt-3" style={{ borderLeft: '4px solid #28a745' }}>
                      <h6 className="mb-2">🏪 Vendor Account Created</h6>
                      <p className="mb-0">
                        <strong>Company:</strong> {application.vendor.company}
                      </p>
                      <p className="mb-0">
                        <strong>Status:</strong> {application.vendor.status}
                      </p>
                    </Alert>
                  )}

                  {application.status === 'approved' && (
                    <div className="text-center mt-4">
                      <Button 
                        variant="success" 
                        size="lg"
                        className="px-5"
                        onClick={() => window.location.href = '/login'}
                      >
                        <FaCheckCircle className="me-2" />
                        Login to Dashboard
                      </Button>
                    </div>
                  )}

                  {application.status === 'pending' && (
                    <div className="text-center mt-4 p-3 bg-light rounded" style={{ border: '1px dashed #ccc' }}>
                      <p className="text-muted mb-0">
                        <FaClock className="me-2" style={{ color: '#f39c12' }} />
                        Your application is under review. We'll notify you via email once reviewed.
                      </p>
                      <p className="text-muted small mt-2 mb-0">
                        Review typically takes 24-48 hours.
                      </p>
                    </div>
                  )}

                  {application.status === 'rejected' && (
                    <div className="text-center mt-4">
                      <p className="text-muted small">
                        You can reapply after 30 days if you wish.
                      </p>
                      <Button 
                        variant="outline-primary" 
                        onClick={() => navigate('/sell')}
                      >
                        Apply Again
                      </Button>
                    </div>
                  )}

                  <div className="text-center mt-4">
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={() => navigate('/sell')}
                    >
                      <FaArrowLeft className="me-2" />
                      Back to Sell Page
                    </Button>
                  </div>
                </Card.Body>

                <Card.Footer className="text-muted text-center bg-light py-3" style={{ borderTop: '1px solid #eee' }}>
                  <small>
                    <FaClock className="me-1" />
                    Last updated: {application.updatedAt ? new Date(application.updatedAt).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'N/A'}
                  </small>
                </Card.Footer>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
      <Footer />
    </>
  );
};

export default ApplicationStatus;
