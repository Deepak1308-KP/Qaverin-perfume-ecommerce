import { useState } from "react";
import { OrderContext } from "./OrderContext";

export function OrderProvider({ children }) {

  const [orders, setOrders] = useState(() => {

    try {

      const savedOrders =
        localStorage.getItem("qaverin-orders");

      if (!savedOrders) {
        return [];
      }

      const parsedOrders =
        JSON.parse(savedOrders);

      return Array.isArray(parsedOrders)
        ? parsedOrders
        : [];

    } catch (error) {

      console.error(
        "Failed to load orders:",
        error
      );

      return [];

    }

  });


  /* =========================================
     SAVE ORDERS
  ========================================= */

  const saveOrders = (newOrders) => {

    setOrders(newOrders);

    localStorage.setItem(
      "qaverin-orders",
      JSON.stringify(newOrders)
    );

  };


  /* =========================================
     ADD ORDER
  ========================================= */

  const addOrder = (order) => {

    const newOrder = {

      ...order,

      /* =====================================
         ORDER ID
      ===================================== */

      id: `QV-${Math.floor(
        100000 +
        Math.random() * 900000
      )}`,

      /* =====================================
         ORDER DATE
      ===================================== */

      date:
        new Date().toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        ),

      /* =====================================
         EXACT CREATION TIME
      ===================================== */

      createdAt:
        new Date().toISOString(),

      /* =====================================
         STATUS
      ===================================== */

      status:
        order.status || "ORDER PLACED",

    };


    /* =====================================
       ADD NEW ORDER FIRST
    ===================================== */

    const updatedOrders = [
      newOrder,
      ...orders,
    ];


    saveOrders(updatedOrders);


    /* =====================================
       RETURN CREATED ORDER
       Useful if needed later
    ===================================== */

    return newOrder;

  };


  /* =========================================
     GET ORDER BY ID
  ========================================= */

  const getOrderById = (id) => {

    return orders.find(
      (order) =>
        String(order.id) === String(id)
    );

  };


  /* =========================================
     CLEAR ORDERS
  ========================================= */

  const clearOrders = () => {

    saveOrders([]);

  };


  /* =========================================
     DELETE SINGLE ORDER
  ========================================= */

  const deleteOrder = (id) => {

    const updatedOrders =
      orders.filter(
        (order) =>
          String(order.id) !== String(id)
      );

    saveOrders(updatedOrders);

  };


  /* =========================================
     CONTEXT
  ========================================= */

  return (

    <OrderContext.Provider
      value={{
        orders,

        addOrder,

        getOrderById,

        deleteOrder,

        clearOrders,
      }}
    >

      {children}

    </OrderContext.Provider>

  );

}