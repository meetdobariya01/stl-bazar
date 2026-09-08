import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaChevronRight } from "react-icons/fa";
import "./breadcrumb.css";

const Breadcrumb = () => {
  const location = useLocation();

  const pathnames = location.pathname.split("/").filter((x) => x);

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

            {/* Other Pages */}
            {pathnames.map((name, index) => {
              const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;

              const isLast = index === pathnames.length - 1;

              const pageName = name
                .replace(/-/g, " ")
                .replace(/\b\w/g, (char) => char.toUpperCase());

              return (
                <React.Fragment key={routeTo}>
                  <li className="breadcrumb-separator">
                    <FaChevronRight />
                  </li>

                  <li className={`breadcrumb-item ${isLast ? "active" : ""}`}>
                    {isLast ? (
                      <span>{pageName}</span>
                    ) : (
                      <Link to={routeTo}>{pageName}</Link>
                    )}
                  </li>
                </React.Fragment>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
};

export default Breadcrumb;
