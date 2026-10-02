import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";

import noir from "../assets/noir.png";
import rose from "../assets/rose.png";
import oud from "../assets/oud.png";
import eclat from "../assets/eclat.png";

/* =========================================
   GET PRODUCT IMAGE
========================================= */

function getProductImage(name) {
  const productName = name
    ? String(name).toLowerCase()
    : "";

  if (productName.includes("noir")) {
    return noir;
  }

  if (productName.includes("rose")) {
    return rose;
  }

  if (productName.includes("oud")) {
    return oud;
  }

  if (
    productName.includes("éclat") ||
    productName.includes("eclat")
  ) {
    return eclat;
  }

  return null;
}


/* =========================================
   ADMIN PRODUCTS
========================================= */

function AdminProducts() {

  /* =========================================
     LOGIN STATUS
  ========================================= */

  const isLoggedIn =
    localStorage.getItem("qaverin-logged-in") === "true";


  /* =========================================
     CURRENT USER
  ========================================= */

  const userData =
    localStorage.getItem("qaverin-current-user");

  let user = null;

  try {
    user = userData
      ? JSON.parse(userData)
      : null;
  } catch (error) {
    console.error("Unable to read current user:", error);
  }


  /* =========================================
     STATE
  ========================================= */

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [saving, setSaving] = useState(false);

  const [deletingProductId, setDeletingProductId] =
    useState(null);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [editingProductId, setEditingProductId] =
    useState(null);


  /* =========================================
     FORM STATE
  ========================================= */

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    price: "",
    stock: "0",
    description: "",
    image: "",
    category: "",
  });


  /* =========================================
     LOAD PRODUCTS
  ========================================= */

  useEffect(() => {

    let cancelled = false;

    const loadProducts = async () => {

      try {

        const response = await fetch(
          "http://127.0.0.1:5000/api/products"
        );

        const data = await response.json();

        if (cancelled) {
          return;
        }

        if (!response.ok) {

          setError(
            data.message ||
            "Unable to fetch products."
          );

          setLoading(false);
          return;
        }

        const backendProducts =
          Array.isArray(data.products)
            ? data.products
            : [];

        setProducts(backendProducts);

        setLoading(false);

      } catch (error) {

        if (cancelled) {
          return;
        }

        console.error(
          "Products fetch error:",
          error
        );

        setError(
          "Unable to connect to the server."
        );

        setLoading(false);
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };

  }, []);


  /* =========================================
     FORM INPUT CHANGE
  ========================================= */

  const handleInputChange = (event) => {

    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

  };


  /* =========================================
     RESET FORM
  ========================================= */

  const resetForm = () => {

    setFormData({
      name: "",
      brand: "",
      price: "",
      stock: "0",
      description: "",
      image: "",
      category: "",
    });

  };


  /* =========================================
     EDIT PRODUCT
  ========================================= */

  const handleEditProduct = (product) => {

    setEditingProductId(product.id);

    setFormData({

      name:
        product.name || "",

      brand:
        product.brand || "",

      price:
        product.price ?? "",

      stock:
        product.stock ?? 0,

      description:
        product.description || "",

      image:
        product.image || "",

      category:
        product.category || "",

    });

    setShowForm(true);

    setError("");

    setSuccessMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  };


  /* =========================================
     UPDATE PRODUCT
  ========================================= */

  const handleUpdateProduct = async (event) => {

    event.preventDefault();

    setSaving(true);

    setError("");

    setSuccessMessage("");

    try {

      const token =
        localStorage.getItem("qaverin-token");

      if (!token) {

        setError("Login token not found.");

        setSaving(false);

        return;
      }


      const response = await fetch(

        `http://127.0.0.1:5000/api/admin/products/${editingProductId}`,

        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({

            name:
              formData.name.trim(),

            brand:
              formData.brand.trim(),

            price:
              Number(formData.price),

            stock:
              Number(formData.stock),

            description:
              formData.description.trim(),

            image:
              formData.image.trim(),

            category:
              formData.category.trim(),

          }),
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        setError(
          data.message ||
          "Unable to update product."
        );

        setSaving(false);

        return;
      }


      setSuccessMessage(
        "Product updated successfully."
      );

      resetForm();

      setEditingProductId(null);

      setShowForm(false);


      /* =====================================
         REFRESH PRODUCTS
      ===================================== */

      const productsResponse =
        await fetch(
          "http://127.0.0.1:5000/api/products"
        );

      const productsData =
        await productsResponse.json();


      if (
        productsResponse.ok &&
        Array.isArray(productsData.products)
      ) {

        setProducts(
          productsData.products
        );

      }

    } catch (error) {

      console.error(
        "Update product error:",
        error
      );

      setError(
        "Unable to connect to the server."
      );

    }

    setSaving(false);

  };


  /* =========================================
     ADD PRODUCT
  ========================================= */

  const handleAddProduct = async (event) => {

    event.preventDefault();

    setSaving(true);

    setError("");

    setSuccessMessage("");

    try {

      const token =
        localStorage.getItem("qaverin-token");

      if (!token) {

        setError("Login token not found.");

        setSaving(false);

        return;
      }


      const response = await fetch(

        "http://127.0.0.1:5000/api/admin/products",

        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({

            name:
              formData.name.trim(),

            brand:
              formData.brand.trim(),

            price:
              Number(formData.price),

            stock:
              Number(formData.stock),

            description:
              formData.description.trim(),

            image:
              formData.image.trim(),

            category:
              formData.category.trim(),

          }),
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        setError(
          data.message ||
          "Unable to create product."
        );

        setSaving(false);

        return;
      }


      setSuccessMessage(
        "Product created successfully."
      );

      resetForm();

      setShowForm(false);


      /* =====================================
         REFRESH PRODUCTS
      ===================================== */

      const productsResponse =
        await fetch(
          "http://127.0.0.1:5000/api/products"
        );

      const productsData =
        await productsResponse.json();


      if (
        productsResponse.ok &&
        Array.isArray(productsData.products)
      ) {

        setProducts(
          productsData.products
        );

      }

    } catch (error) {

      console.error(
        "Add product error:",
        error
      );

      setError(
        "Unable to connect to the server."
      );

    }

    setSaving(false);

  };


  /* =========================================
     DELETE PRODUCT
  ========================================= */

  const handleDeleteProduct = async (product) => {

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${product.name}"?`
      );


    if (!confirmed) {
      return;
    }


    setDeletingProductId(product.id);

    setError("");

    setSuccessMessage("");


    try {

      const token =
        localStorage.getItem("qaverin-token");


      if (!token) {

        setError(
          "Login token not found."
        );

        setDeletingProductId(null);

        return;
      }


      const response = await fetch(

        `http://127.0.0.1:5000/api/admin/products/${product.id}`,

        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        setError(
          data.message ||
          "Unable to delete product."
        );

        setDeletingProductId(null);

        return;
      }


      /* =====================================
         REMOVE FROM SCREEN
      ===================================== */

      setProducts(
        (previousProducts) =>
          previousProducts.filter(
            (item) =>
              item.id !== product.id
          )
      );


      setSuccessMessage(
        "Product deleted successfully."
      );

    } catch (error) {

      console.error(
        "Delete product error:",
        error
      );

      setError(
        "Unable to connect to the server."
      );

    }


    setDeletingProductId(null);

  };


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
     LOADING
  ========================================= */

  if (loading) {

    return (

      <main style={pageStyle}>

        <p style={eyebrowStyle}>
          QAVERIN · ADMIN · PRODUCTS
        </p>

        <h1 style={headingStyle}>
          Loading products...
        </h1>

      </main>

    );

  }


  /* =========================================
     MAIN PAGE
  ========================================= */

  return (

    <main style={pageStyle}>


      {/* =====================================
          HEADER
      ===================================== */}

      <section>

        <p style={eyebrowStyle}>
          QAVERIN · ADMIN · PRODUCTS
        </p>


        <h1 style={headingStyle}>
          Manage <em>products.</em>
        </h1>


        <p style={descriptionStyle}>
          View and manage all products in
          the Qaverin collection.
        </p>


        <Link
          to="/admin"
          style={backLinkStyle}
        >
          ← BACK TO ADMIN
        </Link>

      </section>


      {/* =====================================
          MESSAGES
      ===================================== */}

      {error && (

        <div style={errorStyle}>
          {error}
        </div>

      )}


      {successMessage && (

        <div style={successStyle}>
          {successMessage}
        </div>

      )}


      {/* =====================================
          PRODUCT TOOLBAR
      ===================================== */}

      <section style={toolbarStyle}>

        <div style={countStyle}>

          {products.length}{" "}

          {products.length === 1
            ? "PRODUCT"
            : "PRODUCTS"}

        </div>


        <button
          type="button"
          onClick={() => {

            setShowForm(
              (previous) =>
                !previous
            );

            if (showForm) {

              resetForm();

              setEditingProductId(null);

            }

            setError("");

            setSuccessMessage("");

          }}
          style={primaryButtonStyle}
        >

          {showForm
            ? "CLOSE FORM"
            : "＋ ADD PRODUCT"}

        </button>

      </section>


      {/* =====================================
          PRODUCT FORM
      ===================================== */}

      {showForm && (

        <section style={formContainerStyle}>

          <p style={formEyebrowStyle}>

            {editingProductId
              ? "EDIT PRODUCT"
              : "NEW PRODUCT"}

          </p>


          <h2 style={formHeadingStyle}>

            {editingProductId
              ? (
                <>
                  Edit <em>product.</em>
                </>
              )
              : (
                <>
                  Add <em>product.</em>
                </>
              )}

          </h2>


          <form
            onSubmit={
              editingProductId
                ? handleUpdateProduct
                : handleAddProduct
            }
          >

            <div style={formGridStyle}>


              {/* NAME */}

              <div>

                <label style={labelStyle}>
                  PRODUCT NAME
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Qaverin Noir"
                  required
                  style={inputStyle}
                />

              </div>


              {/* BRAND */}

              <div>

                <label style={labelStyle}>
                  BRAND
                </label>

                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="Qaverin"
                  required
                  style={inputStyle}
                />

              </div>


              {/* PRICE */}

              <div>

                <label style={labelStyle}>
                  PRICE
                </label>

                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="4999"
                  min="0"
                  step="0.01"
                  required
                  style={inputStyle}
                />

              </div>


              {/* STOCK */}

              <div>

                <label style={labelStyle}>
                  STOCK QUANTITY
                </label>

                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="5"
                  min="0"
                  step="1"
                  required
                  style={inputStyle}
                />

              </div>


              {/* CATEGORY */}

              <div>

                <label style={labelStyle}>
                  CATEGORY
                </label>

                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="Men"
                  required
                  style={inputStyle}
                />

              </div>


              {/* IMAGE */}

              <div
                style={{
                  gridColumn: "1 / -1",
                }}
              >

                <label style={labelStyle}>
                  IMAGE
                </label>

                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="noir.png"
                  style={inputStyle}
                />

              </div>


              {/* DESCRIPTION */}

              <div
                style={{
                  gridColumn: "1 / -1",
                }}
              >

                <label style={labelStyle}>
                  DESCRIPTION
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the fragrance..."
                  rows="5"
                  required
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                  }}
                />

              </div>

            </div>


            {/* FORM BUTTONS */}

            <div
              style={{
                marginTop: "25px",
                display: "flex",
                gap: "12px",
              }}
            >

              <button
                type="submit"
                disabled={saving}
                style={{
                  ...primaryButtonStyle,
                  opacity: saving ? 0.6 : 1,
                  cursor: saving
                    ? "not-allowed"
                    : "pointer",
                }}
              >

                {saving
                  ? (
                    editingProductId
                      ? "UPDATING..."
                      : "CREATING..."
                  )
                  : (
                    editingProductId
                      ? "UPDATE PRODUCT →"
                      : "CREATE PRODUCT →"
                  )}

              </button>


              <button
                type="button"
                onClick={() => {

                  resetForm();

                  setShowForm(false);

                  setEditingProductId(null);

                }}
                style={secondaryButtonStyle}
              >

                CANCEL

              </button>

            </div>

          </form>

        </section>

      )}


      {/* =====================================
          EMPTY PRODUCTS
      ===================================== */}

      {products.length === 0 ? (

        <section style={emptyStyle}>

          <h2>
            No products found.
          </h2>

          <p>
            There are currently no
            products in the database.
          </p>

        </section>

      ) : (

        /* =====================================
           PRODUCTS GRID
        ===================================== */

        <section style={productsGridStyle}>

          {products.map((product) => {

            const image =
              getProductImage(product.name);

            const isDeleting =
              deletingProductId === product.id;

            const stock =
              Number(product.stock ?? 0);

            const stockClass =
              stock === 0
                ? "OUT OF STOCK"
                : stock <= 5
                  ? "LOW STOCK"
                  : "IN STOCK";


            return (

              <article
                key={product.id}
                style={productCardStyle}
              >


                {/* PRODUCT IMAGE */}

                <div style={productImageStyle}>

                  {image ? (

                    <img
                      src={image}
                      alt={
                        product.name ||
                        "Qaverin product"
                      }
                      style={imageStyle}
                    />

                  ) : (

                    <div style={noImageStyle}>

                      <span
                        style={{
                          fontFamily:
                            "Georgia, serif",
                          color: "#9b7540",
                          fontSize: "40px",
                        }}
                      >
                        ✦
                      </span>

                      <p>
                        No image
                      </p>

                    </div>

                  )}

                </div>


                {/* PRODUCT DETAILS */}

                <div style={productDetailsStyle}>

                  <p
                    style={{
                      margin: "0 0 8px",
                      fontFamily:
                        "Arial, sans-serif",
                      fontSize: "9px",
                      letterSpacing: "2px",
                      color: "#9b7540",
                    }}
                  >
                    {product.brand ||
                      "QAVERIN"}
                  </p>


                  <h2
                    style={{
                      margin: "0 0 10px",
                      fontFamily:
                        "Georgia, serif",
                      fontSize: "25px",
                      fontWeight: "400",
                    }}
                  >
                    {product.name}
                  </h2>


                  <p
                    style={{
                      margin: "0 0 15px",
                      color: "#6f6962",
                      fontSize: "13px",
                      lineHeight: "1.6",
                    }}
                  >
                    {product.description ||
                      "No description available."}
                  </p>


                  {/* PRICE + CATEGORY */}

                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      gap: "15px",
                    }}
                  >

                    <strong
                      style={{
                        fontFamily:
                          "Georgia, serif",
                        fontSize: "20px",
                        fontWeight: "400",
                      }}
                    >
                      ₹
                      {Number(
                        product.price || 0
                      ).toFixed(2)}
                    </strong>


                    <span
                      style={{
                        fontSize: "10px",
                        letterSpacing: "1px",
                        color: "#6f6962",
                        textAlign: "right",
                      }}
                    >
                      {product.category ||
                        "FRAGRANCE"}
                    </span>

                  </div>


                  {/* =================================
                      STOCK INFORMATION
                  ================================= */}

                  <div
                    style={{
                      marginTop: "18px",
                      paddingTop: "15px",
                      borderTop:
                        "1px solid #eee8df",
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                    }}
                  >

                    <span
                      style={{
                        fontSize: "9px",
                        letterSpacing: "2px",
                        color: "#6f6962",
                      }}
                    >
                      STOCK
                    </span>


                    <strong
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color:
                          stock === 0
                            ? "#b24a3b"
                            : stock <= 5
                              ? "#9b7540"
                              : "#38613d",
                      }}
                    >
                      {stock}
                    </strong>

                  </div>


                  {/* STOCK STATUS */}

                  <p
                    style={{
                      margin:
                        "8px 0 0",
                      fontSize: "9px",
                      letterSpacing: "1.5px",
                      color:
                        stock === 0
                          ? "#b24a3b"
                          : stock <= 5
                            ? "#9b7540"
                            : "#38613d",
                    }}
                  >
                    {stockClass}
                  </p>


                  {/* PRODUCT ID */}

                  <p
                    style={{
                      margin:
                        "15px 0 0",
                      paddingTop:
                        "15px",
                      borderTop:
                        "1px solid #eee8df",
                      fontSize: "10px",
                      color: "#9b7540",
                      letterSpacing: "1px",
                    }}
                  >
                    PRODUCT ID: #
                    {product.id}
                  </p>


                  {/* EDIT BUTTON */}

                  <button
                    type="button"
                    onClick={() =>
                      handleEditProduct(
                        product
                      )
                    }
                    disabled={isDeleting}
                    style={{
                      width: "100%",
                      marginTop: "18px",
                      padding:
                        "13px 18px",
                      border:
                        "1px solid #171513",
                      background:
                        "#171513",
                      color: "#ffffff",
                      cursor:
                        isDeleting
                          ? "not-allowed"
                          : "pointer",
                      fontFamily:
                        "Arial, sans-serif",
                      fontSize: "10px",
                      letterSpacing:
                        "1.5px",
                      opacity:
                        isDeleting
                          ? 0.5
                          : 1,
                    }}
                  >
                    EDIT PRODUCT →
                  </button>


                  {/* DELETE BUTTON */}

                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteProduct(
                        product
                      )
                    }
                    disabled={isDeleting}
                    style={{
                      width: "100%",
                      marginTop: "10px",
                      padding:
                        "13px 18px",
                      border:
                        "1px solid #b24a3b",
                      background:
                        "transparent",
                      color: "#b24a3b",
                      cursor:
                        isDeleting
                          ? "not-allowed"
                          : "pointer",
                      fontFamily:
                        "Arial, sans-serif",
                      fontSize: "10px",
                      letterSpacing:
                        "1.5px",
                      opacity:
                        isDeleting
                          ? 0.5
                          : 1,
                    }}
                  >
                    {isDeleting
                      ? "DELETING..."
                      : "DELETE PRODUCT"}
                  </button>

                </div>

              </article>

            );

          })}

        </section>

      )}

    </main>

  );
}


/* =========================================
   STYLES
========================================= */

const pageStyle = {
  minHeight: "80vh",
  padding: "60px 8%",
  background: "#f7f4ef",
  color: "#171513",
};


const eyebrowStyle = {
  margin: 0,
  fontFamily: "Arial, sans-serif",
  fontSize: "10px",
  letterSpacing: "4px",
  color: "#9b7540",
};


const headingStyle = {
  margin: "15px 0",
  fontFamily: "Georgia, serif",
  fontSize: "52px",
  fontWeight: "400",
};


const descriptionStyle = {
  fontFamily: "Arial, sans-serif",
  color: "#6f6962",
};


const backLinkStyle = {
  display: "inline-block",
  marginTop: "25px",
  color: "#171513",
  textDecoration: "none",
  fontFamily: "Arial, sans-serif",
  fontSize: "11px",
  letterSpacing: "1.5px",
};


const errorStyle = {
  marginTop: "30px",
  padding: "15px 20px",
  background: "#fff0ed",
  border: "1px solid #d9aaa0",
  color: "#8b3a2f",
  fontFamily: "Arial, sans-serif",
  fontSize: "13px",
};


const successStyle = {
  marginTop: "30px",
  padding: "15px 20px",
  background: "#edf7ef",
  border: "1px solid #a9c9ad",
  color: "#38613d",
  fontFamily: "Arial, sans-serif",
  fontSize: "13px",
};


const toolbarStyle = {
  marginTop: "40px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  flexWrap: "wrap",
};


const countStyle = {
  fontFamily: "Arial, sans-serif",
  fontSize: "11px",
  letterSpacing: "2px",
  color: "#9b7540",
};


const primaryButtonStyle = {
  padding: "13px 22px",
  border: "none",
  background: "#171513",
  color: "#ffffff",
  cursor: "pointer",
  fontFamily: "Arial, sans-serif",
  fontSize: "10px",
  letterSpacing: "1.5px",
};


const secondaryButtonStyle = {
  padding: "14px 25px",
  border: "1px solid #171513",
  background: "transparent",
  color: "#171513",
  cursor: "pointer",
  fontFamily: "Arial, sans-serif",
  fontSize: "10px",
  letterSpacing: "1.5px",
};


const formContainerStyle = {
  marginTop: "25px",
  padding: "35px",
  background: "#ffffff",
  border: "1px solid #ded8d0",
};


const formEyebrowStyle = {
  margin: "0 0 8px",
  fontFamily: "Arial, sans-serif",
  fontSize: "9px",
  letterSpacing: "2px",
  color: "#9b7540",
};


const formHeadingStyle = {
  margin: "0 0 30px",
  fontFamily: "Georgia, serif",
  fontSize: "32px",
  fontWeight: "400",
};


const formGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "20px",
};


const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontFamily: "Arial, sans-serif",
  fontSize: "9px",
  letterSpacing: "2px",
  color: "#9b7540",
};


const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 14px",
  background: "#fdfcf9",
  color: "#171513",
  border: "1px solid #ded8d0",
  outline: "none",
  fontFamily: "Arial, sans-serif",
  fontSize: "13px",
};


const emptyStyle = {
  marginTop: "25px",
  padding: "60px 30px",
  background: "#ffffff",
  border: "1px solid #ded8d0",
  textAlign: "center",
};


const productsGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "20px",
  marginTop: "25px",
};


const productCardStyle = {
  background: "#ffffff",
  border: "1px solid #ded8d0",
  overflow: "hidden",
};


const productImageStyle = {
  height: "300px",
  background: "#f1eee8",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
};


const imageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  display: "block",
};


const noImageStyle = {
  textAlign: "center",
};


const productDetailsStyle = {
  padding: "25px",
};


export default AdminProducts;