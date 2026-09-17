import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaChevronRight } from "react-icons/fa";
import "./breadcrumb.css";

const Breadcrumb = () => {
  const location = useLocation();

  // Get breadcrumb history passed through navigation
  const breadcrumbHistory = location.state?.breadcrumbHistory || [];

  // Current page name
  const getPageName = (pathname) => {
    const name = pathname.split("/").filter(Boolean).pop();

    if (!name) return "Home";

    let decoded = name;

    try {
      decoded = decodeURIComponent(name);
    } catch (e) {
      decoded = name;
    }

    return decoded
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="breadcrumb-wrapper">
      <div className="container">
        <nav aria-label="breadcrumb">
          <ol className="custom-breadcrumb">
            {/* Home */}
            <li className="breadcrumb-item">
              <Link to="/">
                <FaHome />
                <span>Home</span>
              </Link>
            </li>

            {breadcrumbHistory.map((item, index) => (
              <React.Fragment key={`${item.path}-${index}`}>
                <li className="breadcrumb-separator">
                  <FaChevronRight />
                </li>

                <li
                  className={`breadcrumb-item ${
                    index === breadcrumbHistory.length - 1 ? "active" : ""
                  }`}
                >
                  {index === breadcrumbHistory.length - 1 ? (
                    <span>{item.name}</span>
                  ) : (
                    <Link
                      to={item.path}
                      state={{
                        breadcrumbHistory: breadcrumbHistory.slice(
                          0,
                          index + 1,
                        ),
                      }}
                    >
                      {item.name}
                    </Link>
                  )}
                </li>
              </React.Fragment>
            ))}

            {/* Fallback when no history exists */}
            {breadcrumbHistory.length === 0 && location.pathname !== "/" && (
              <>
                <li className="breadcrumb-separator">
                  <FaChevronRight />
                </li>

                <li className="breadcrumb-item active">
                  <span>{getPageName(location.pathname)}</span>
                </li>
              </>
            )}
          </ol>
        </nav>
      </div>
    </div>
  );
};

export default Breadcrumb;
