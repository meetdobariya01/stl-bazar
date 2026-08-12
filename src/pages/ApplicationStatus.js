// pages/ApplicationStatus.js - UPDATED WITH BETTER DEBUGGING

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
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        console.log("🔍 ApplicationStatus Page Loaded");
        console.log("📌 Tracking ID:", trackingId);
        console.log("🔗 Full URL:", window.location.href);
        console.log("📝 Search Params:", window.location.search);

        // Get token from URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        console.log("🔑 Token found:", token ? "YES" : "NO");

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
        console.error("Response:", err.response?.data);
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
                {/* Header */}
                <Card.Header className="status-header">
                  <div className="d-flex justify-content-between align-items-center flex-wrap">
                    <h4 className="mb-0 text-white">
                      <FaStore className="me-2" />
                      Application Status
                    </h4>
                    <span className="application-id">
                      ID: {application.trackingId}
                    </span>
                  </div>
                </Card.Header>

                <Card.Body className="p-4">
                  {/* Status Icon */}
                  <div className="text-center status-icon-container">
                    {getStatusIcon(application.status)}
                  </div>

                  {/* Status Title */}
                  <h3 className="text-center mt-3" style={{ color: statusInfo.color }}>
                    {statusInfo.title}
                  </h3>

                  {/* Status Badge */}
                  <div className="text-center mb-4">
                    {getStatusBadge(application.status)}
                  </div>

                  {/* Status Description */}
                  <p className="text-center text-muted mb-4">
                    {statusInfo.description}
                  </p>

                  {/* Applicant Info */}
                  <div className="applicant-info mb-4">
                    <h6 className="mb-3 text-uppercase text-muted small fw-bold">
                      <FaUser className="me-2" /> Application Details
                    </h6>
                    <Row>
                      <Col md={6}>
                        <div className="info-item">
                          <FaBuilding className="info-icon" />
                          <div>
                            <label>Business Name</label>
                            <p className="mb-0">{application.businessName}</p>
                          </div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="info-item">
                          <FaEnvelope className="info-icon" />
                          <div>
                            <label>Email</label>
                            <p className="mb-0">{application.email}</p>
                          </div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="info-item">
                          <FaPhone className="info-icon" />
                          <div>
                            <label>Phone</label>
                            <p className="mb-0">{application.phoneNumber || 'N/A'}</p>
                          </div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="info-item">
                          <FaCalendarAlt className="info-icon" />
                          <div>
                            <label>Registered On</label>
                            <p className="mb-0">
                              {new Date(application.registeredAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  {/* Rejection Reason */}
                  {application.status === 'rejected' && application.rejectionReason && (
                    <Alert variant="danger" className="mt-3">
                      <h6 className="mb-2">📝 Reason for Rejection</h6>
                      <p className="mb-0">{application.rejectionReason}</p>
                    </Alert>
                  )}

                  {/* Admin Notes */}
                  {application.adminNotes && application.status !== 'pending' && (
                    <Alert variant="info" className="mt-3">
                      <h6 className="mb-2">📌 Admin Notes</h6>
                      <p className="mb-0">{application.adminNotes}</p>
                    </Alert>
                  )}

                  {/* Vendor Info (if approved) */}
                  {application.status === 'approved' && application.vendor && (
                    <Alert variant="success" className="mt-3">
                      <h6 className="mb-2">🏪 Vendor Account Created</h6>
                      <p className="mb-0">
                        <strong>Company:</strong> {application.vendor.company}
                      </p>
                      <p className="mb-0">
                        <strong>Status:</strong> {application.vendor.status}
                      </p>
                    </Alert>
                  )}

                  {/* Action Button */}
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
                    <div className="text-center mt-4 p-3 bg-light rounded">
                      <p className="text-muted mb-0">
                        <FaClock className="me-2" />
                        Your application is under review. We'll notify you via email once reviewed.
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
                </Card.Body>

                <Card.Footer className="text-muted text-center bg-light py-3">
                  <small>
                    <FaClock className="me-1" />
                    Last updated: {new Date(application.updatedAt).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
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