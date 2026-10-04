import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_BASE_URL;

function Admin() {
  /* =========================================
     LOGIN STATUS
  ========================================= */

  const isLoggedIn =
    localStorage.getItem("qaverin-logged-in") === "true";

  /* =========================================
     GET CURRENT USER
  ========================================= */

  const userData =
    localStorage.getItem("qaverin-current-user");

  const user = (() => {
    if (!userData) {
      return null;
    }

    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error(
        "Unable to read current user:",
        error
      );

      return null;
    }
  })();

  /* =========================================
     SHARED THEME
  ========================================= */

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("qaverin-theme") === "dark";
  });

  useEffect(() => {
    const applyTheme = () => {
      setDarkMode(
        localStorage.getItem("qaverin-theme") === "dark"
      );
    };

    applyTheme();

    window.addEventListener(
      "qaverin-theme-change",
      applyTheme
    );

    window.addEventListener(
      "storage",
      applyTheme
    );

    return () => {
      window.removeEventListener(
        "qaverin-theme-change",
        applyTheme
      );

      window.removeEventListener(
        "storage",
        applyTheme
      );
    };
  }, []);

  const theme = {
    background: darkMode ? "#171513" : "#f7f4ef",
    text: darkMode ? "#f7f4ef" : "#171513",
    secondaryText: darkMode ? "#bdb6ae" : "#6f6962",
    card: darkMode ? "#24211e" : "#ffffff",
    border: darkMode ? "#3d3935" : "#ded8d0",
    buttonBackground: darkMode ? "#f7f4ef" : "#171513",
    buttonText: darkMode ? "#171513" : "#ffffff",
    errorBackground: darkMode ? "#3a2521" : "#fff0ed",
    errorBorder: darkMode ? "#74443b" : "#d9aaa0",
    errorText: darkMode ? "#f0b8ad" : "#8b3a2f",
  };

  /* =========================================
     DASHBOARD STATISTICS
  ========================================= */

  const [stats, setStats] = useState({
    orders: 0,
    products: 0,
    customers: 0,
    revenue: 0,
  });

  const [statsLoading, setStatsLoading] =
    useState(true);

  const [statsError, setStatsError] =
    useState("");

  /* =========================================
     FETCH DASHBOARD STATISTICS
  ========================================= */

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "admin") {
      return;
    }

    let cancelled = false;

    const fetchDashboardStats = async () => {
      try {
        setStatsLoading(true);
        setStatsError("");

        const token =
          localStorage.getItem("qaverin-token");

        if (!token) {
          setStatsError(
            "Login token not found."
          );

          setStatsLoading(false);
          return;
        }

        const response = await fetch(
          `${API_URL}/api/admin/dashboard-stats`,
          {
            method: "GET",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const data =
          await response.json();

        if (cancelled) {
          return;
        }

        if (!response.ok) {
          setStatsError(
            data.message ||
              "Unable to fetch dashboard statistics."
          );

          setStatsLoading(false);
          return;
        }

        /* =====================================
           GET STATS FROM BACKEND
        ===================================== */

        const dashboardStats =
          data.stats || {};

        setStats({
          orders: Number(
            dashboardStats.orders || 0
          ),

          products: Number(
            dashboardStats.products || 0
          ),

          customers: Number(
            dashboardStats.customers || 0
          ),

          revenue: Number(
            dashboardStats.revenue || 0
          ),
        });

        setStatsLoading(false);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Dashboard statistics error:",
          error
        );

        setStatsError(
          "Unable to connect to the server."
        );

        setStatsLoading(false);
      }
    };

    fetchDashboardStats();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, user?.role]);

  /* =========================================
     PROTECT ADMIN PAGE
  ========================================= */

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  /* =========================================
     CHECK ADMIN ROLE
  ========================================= */

  if (user?.role !== "admin") {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  /* =========================================
     ADMIN DASHBOARD
  ========================================= */

  return (
    <main
      style={{
        minHeight: "100vh",
        background: theme.background,
        color: theme.text,
        padding: "45px 6%",
        boxSizing: "border-box",
        "--admin-button-bg": theme.buttonBackground,
        "--admin-button-text": theme.buttonText,
        "--admin-button-border": theme.text,
      }}
    >

      {/* =====================================
          HEADER
      ===================================== */}

      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "30px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontFamily:
                "Arial, sans-serif",
              fontSize: "10px",
              letterSpacing: "4px",
              color: "#9b7540",
            }}
          >
            QAVERIN · ADMIN PANEL
          </p>

          <h1
            style={{
              margin: "12px 0 8px",
              fontFamily:
                "Georgia, serif",
              fontSize: "48px",
              fontWeight: "400",
            }}
          >
            Admin <em>Dashboard.</em>
          </h1>

          <p
            style={{
              margin: 0,
              fontFamily:
                "Arial, sans-serif",
              color: theme.secondaryText,
              fontSize: "14px",
            }}
          >
            Welcome back,{" "}
            <strong>
              {user?.name || "Admin"}
            </strong>.
          </p>
        </div>

        {/* VIEW STORE */}

        <Link
          to="/"
          style={{
            padding: "12px 18px",
            border:
              `1px solid ${theme.text}`,
            color: theme.text,
            textDecoration: "none",
            fontFamily:
              "Arial, sans-serif",
            fontSize: "10px",
            letterSpacing: "1.5px",
          }}
        >
          VIEW STORE →
        </Link>
      </header>


      {/* =====================================
          OVERVIEW
      ===================================== */}

      <section
        style={{
          marginTop: "50px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily:
              "Arial, sans-serif",
            fontSize: "9px",
            letterSpacing: "3px",
            color: "#9b7540",
          }}
        >
          OVERVIEW
        </p>

        <h2
          style={{
            margin: "10px 0 0",
            fontFamily:
              "Georgia, serif",
            fontSize: "30px",
            fontWeight: "400",
          }}
        >
          Store <em>at a glance.</em>
        </h2>
      </section>


      {/* =====================================
          ERROR MESSAGE
      ===================================== */}

      {statsError && (
        <div
          style={{
            marginTop: "25px",
            padding: "14px 18px",
            background: "#fff0ed",
            border:
              "1px solid #d9aaa0",
            color: "#8b3a2f",
            fontFamily:
              "Arial, sans-serif",
            fontSize: "13px",
          }}
        >
          {statsError}
        </div>
      )}


      {/* =====================================
          STATISTICS
      ===================================== */}

      <section
        style={{
          marginTop: "25px",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "18px",
        }}
      >

        {/* ORDERS */}

        <div
          style={{
            ...statCardStyle,
            background: theme.card,
            border: `1px solid ${theme.border}`,
          }}
        >
          <p style={statLabelStyle}>
            ORDERS
          </p>

          <h3 style={statNumberStyle}>
            {statsLoading
              ? "..."
              : stats.orders}
          </h3>

          <p
            style={{
              ...statDescriptionStyle,
              color: theme.secondaryText,
            }}
          >
            Total customer orders
          </p>
        </div>


        {/* PRODUCTS */}

        <div
          style={{
            ...statCardStyle,
            background: theme.card,
            border: `1px solid ${theme.border}`,
          }}
        >
          <p style={statLabelStyle}>
            PRODUCTS
          </p>

          <h3 style={statNumberStyle}>
            {statsLoading
              ? "..."
              : stats.products}
          </h3>

          <p
            style={{
              ...statDescriptionStyle,
              color: theme.secondaryText,
            }}
          >
            Products in collection
          </p>
        </div>


        {/* CUSTOMERS */}

        <div
          style={{
            ...statCardStyle,
            background: theme.card,
            border: `1px solid ${theme.border}`,
          }}
        >
          <p style={statLabelStyle}>
            CUSTOMERS
          </p>

          <h3 style={statNumberStyle}>
            {statsLoading
              ? "..."
              : stats.customers}
          </h3>

          <p
            style={{
              ...statDescriptionStyle,
              color: theme.secondaryText,
            }}
          >
            Registered customers
          </p>
        </div>


        {/* REVENUE */}

        <div
          style={{
            ...statCardStyle,
            background: theme.card,
            border: `1px solid ${theme.border}`,
          }}
        >
          <p style={statLabelStyle}>
            REVENUE
          </p>

          <h3 style={statNumberStyle}>
            {statsLoading
              ? "..."
              : `₹${stats.revenue.toFixed(2)}`}
          </h3>

          <p
            style={{
              ...statDescriptionStyle,
              color: theme.secondaryText,
            }}
          >
            Total store revenue
          </p>
        </div>

      </section>


      {/* =====================================
          MANAGEMENT
      ===================================== */}

      <section
        style={{
          marginTop: "50px",
        }}
      >
        <p style={sectionLabelStyle}>
          MANAGEMENT
        </p>

        <h2 style={sectionTitleStyle}>
          Manage your <em>store.</em>
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >

          {/* PRODUCTS */}

          <div
            style={{
              ...managementCardStyle,
              background: theme.card,
              border: `1px solid ${theme.border}`,
            }}
          >
            <p style={managementLabelStyle}>
              PRODUCTS
            </p>

            <h3 style={managementTitleStyle}>
              Manage Products
            </h3>

            <p
              style={
                managementDescriptionStyle
              }
            >
              Add new fragrances, edit
              existing products, update
              prices and manage products.
            </p>

            <Link
              to="/admin/products"
              style={
                managementButtonStyle
              }
            >
              MANAGE PRODUCTS →
            </Link>
          </div>


          {/* ORDERS */}

          <div
            style={{
              ...managementCardStyle,
              background: theme.card,
              border: `1px solid ${theme.border}`,
            }}
          >
            <p style={managementLabelStyle}>
              ORDERS
            </p>

            <h3 style={managementTitleStyle}>
              Manage Orders
            </h3>

            <p
              style={
                managementDescriptionStyle
              }
            >
              View customer orders and
              update their order status.
            </p>

            <Link
              to="/admin/orders"
              style={
                managementButtonStyle
              }
            >
              MANAGE ORDERS →
            </Link>
          </div>


          {/* CUSTOMERS */}

          <div
            style={{
              ...managementCardStyle,
              background: theme.card,
              border: `1px solid ${theme.border}`,
            }}
          >
            <p style={managementLabelStyle}>
              CUSTOMERS
            </p>

            <h3 style={managementTitleStyle}>
              Customers
            </h3>

            <p
              style={
                managementDescriptionStyle
              }
            >
              View registered customers
              and their account information.
            </p>

            <Link
              to="/admin/customers"
              style={
                managementButtonStyle
              }
            >
              VIEW CUSTOMERS →
            </Link>
          </div>

        </div>
      </section>


      {/* =====================================
          SALES ANALYTICS
      ===================================== */}

      <section
        style={{
          marginTop: "50px",
        }}
      >
        <p style={sectionLabelStyle}>
          ANALYTICS
        </p>

        <h2 style={sectionTitleStyle}>
          Sales <em>analytics.</em>
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          <div
            style={{
              ...managementCardStyle,
              background: theme.card,
              border: `1px solid ${theme.border}`,
            }}
          >
            <p style={managementLabelStyle}>
              ANALYTICS
            </p>

            <h3 style={managementTitleStyle}>
              Sales Analytics
            </h3>

            <p
              style={
                managementDescriptionStyle
              }
            >
              View sales performance, revenue,
              order activity and other store
              analytics.
            </p>

            <Link
              to="/admin/analytics"
              style={
                managementButtonStyle
              }
            >
              VIEW ANALYTICS →
            </Link>
          </div>
        </div>
      </section>


      {/* =====================================
          QUICK ACTIONS
      ===================================== */}

      <section
        style={{
          marginTop: "50px",
          padding: "30px",
          background: "#171513",
          color: "#ffffff",
        }}
      >
        <p
          style={{
            margin: "0 0 10px",
            fontFamily:
              "Arial, sans-serif",
            fontSize: "9px",
            letterSpacing: "3px",
            color: "#d1ad76",
          }}
        >
          QUICK ACTIONS
        </p>

        <h2
          style={{
            margin:
              "0 0 25px",
            fontFamily:
              "Georgia, serif",
            fontSize: "30px",
            fontWeight: "400",
          }}
        >
          What would you like to{" "}
          <em>manage?</em>
        </h2>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <Link
            to="/admin/products"
            style={{
              padding:
                "13px 20px",
              background:
                "#ffffff",
              color:
                "#171513",
              textDecoration:
                "none",
              fontFamily:
                "Arial, sans-serif",
              fontSize: "10px",
              letterSpacing:
                "1.5px",
            }}
          >
            + ADD / MANAGE PRODUCTS
          </Link>

          <Link
            to="/admin/orders"
            style={{
              padding:
                "13px 20px",
              border:
                "1px solid #ffffff",
              color:
                "#ffffff",
              textDecoration:
                "none",
              fontFamily:
                "Arial, sans-serif",
              fontSize: "10px",
              letterSpacing:
                "1.5px",
            }}
          >
            VIEW ORDERS →
          </Link>

          <Link
            to="/admin/customers"
            style={{
              padding:
                "13px 20px",
              border:
                "1px solid #ffffff",
              color:
                "#ffffff",
              textDecoration:
                "none",
              fontFamily:
                "Arial, sans-serif",
              fontSize: "10px",
              letterSpacing:
                "1.5px",
            }}
          >
            VIEW CUSTOMERS →
          </Link>
        </div>
      </section>


      {/* =====================================
          ADMIN ACCOUNT
      ===================================== */}

      <section
        style={{
          marginTop: "25px",
          padding:
            "25px 30px",
          background:
            "#ffffff",
          border:
            "1px solid #ded8d0",
        }}
      >
        <p
          style={{
            margin:
              "0 0 15px",
            fontFamily:
              "Arial, sans-serif",
            fontSize: "9px",
            letterSpacing:
              "3px",
            color:
              "#9b7540",
          }}
        >
          ADMIN ACCOUNT
        </p>

        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px",
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily:
                "Arial, sans-serif",
              fontSize: "13px",
            }}
          >
            <strong>Name</strong>
            <br />
            {user?.name || "—"}
          </p>

          <p
            style={{
              margin: 0,
              fontFamily:
                "Arial, sans-serif",
              fontSize: "13px",
            }}
          >
            <strong>Email</strong>
            <br />
            {user?.email || "—"}
          </p>

          <p
            style={{
              margin: 0,
              fontFamily:
                "Arial, sans-serif",
              fontSize: "13px",
            }}
          >
            <strong>Role</strong>
            <br />
            {user?.role || "—"}
          </p>
        </div>
      </section>

    </main>
  );
}


/* =========================================
   STAT CARD STYLES
========================================= */

const statCardStyle = {
  padding: "25px",
  background: "#ffffff",
  border:
    "1px solid #ded8d0",
};

const statLabelStyle = {
  margin: "0 0 12px",
  fontFamily:
    "Arial, sans-serif",
  fontSize: "9px",
  letterSpacing: "2px",
  color: "#9b7540",
};

const statNumberStyle = {
  margin: 0,
  fontFamily:
    "Georgia, serif",
  fontSize: "34px",
  fontWeight: "400",
};

const statDescriptionStyle = {
  margin: "8px 0 0",
  color: "#6f6962",
  fontFamily:
    "Arial, sans-serif",
  fontSize: "12px",
};


/* =========================================
   SECTION STYLES
========================================= */

const sectionLabelStyle = {
  margin: 0,
  fontFamily:
    "Arial, sans-serif",
  fontSize: "9px",
  letterSpacing: "3px",
  color: "#9b7540",
};

const sectionTitleStyle = {
  margin:
    "10px 0 25px",
  fontFamily:
    "Georgia, serif",
  fontSize: "30px",
  fontWeight: "400",
};


/* =========================================
   MANAGEMENT CARD
========================================= */

const managementCardStyle = {
  padding: "30px",
  background: "#ffffff",
  border:
    "1px solid #ded8d0",
};

const managementLabelStyle = {
  margin:
    "0 0 10px",
  fontFamily:
    "Arial, sans-serif",
  fontSize: "9px",
  letterSpacing: "2px",
  color: "#9b7540",
};

const managementTitleStyle = {
  margin:
    "0 0 12px",
  fontFamily:
    "Georgia, serif",
  fontSize: "27px",
  fontWeight: "400",
};

const managementDescriptionStyle = {
  margin:
    "0 0 25px",
  color: "#6f6962",
  fontFamily:
    "Arial, sans-serif",
  fontSize: "13px",
  lineHeight: "1.7",
};

const managementButtonStyle = {
  display:
    "inline-block",
  padding:
    "13px 18px",
  border:
    "1px solid var(--admin-button-border)",
  background:
    "var(--admin-button-bg)",
  color:
    "var(--admin-button-text)",
  textDecoration:
    "none",
  fontFamily:
    "Arial, sans-serif",
  fontSize: "10px",
  letterSpacing:
    "1.5px",
  cursor:
    "pointer",
};

export default Admin;