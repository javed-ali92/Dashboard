"use client";

import React, { useEffect, useState } from "react";
import { client } from "@/sanity/lib/client";
import Image from "next/image";
import Swal from "sweetalert2";
import ProtectedRoute from "../../components/ProtectedRoute";
interface Order {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
  total: number;
  discount: number;
  orderDate: string;
  status: string | null;
  cartItems: { productName: string; image: string }[];
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    client
      .fetch(
        `*[_type == "order"]{
          _id,
          firstName,
          lastName,
          phone,
          email,
          address,
          city,
          zipCode,
          total,
          discount,
          orderDate,
          status,
          cartItems[]->{
            productName,
            image
          }
        }`
      )
      .then((data) => setOrders(data))
      .catch((error) => console.error("Error fetching orders:", error));
  }, []);

  const filteredOrders =
    filter === "All" ? orders : orders.filter((order) => order.status === filter);

  const toggleOrderDetails = (orderId: string) => {
    setSelectedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const handleDelete = async (orderId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await client.delete(orderId);
      setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
      Swal.fire("Deleted!", "Your order has been deleted.", "success");
    } catch (error) {
      console.error("Error deleting order:", error);
      Swal.fire("Error!", "Something went wrong while deleting.", "error");
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await client
        .patch(orderId)
        .set({ status: newStatus })
        .commit();
      
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      if (newStatus === "dispatch") {
        Swal.fire("Dispatch", "The order is now dispatched.", "success");
      } else if (newStatus === "success") {
        Swal.fire("Success", "The order has been completed.", "success");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      Swal.fire("Error!", "Something went wrong while updating the status.", "error");
    }
  };

  return (
      <ProtectedRoute>
       <div className="min-h-screen bg-[#634c15] text-gray-100 flex flex-col">
      {/* Navbar */}
      <nav className="bg-[#B88E2F] text-white p-4 shadow-md flex flex-wrap items-center justify-between">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
          {["All", "pending", "dispatch", "success"].map((status) => (
            <button
              key={status}
              className={`px-4 py-2 rounded-lg transition-all text-base font-medium shadow-sm ${
                filter === status ? "bg-white text-[#B88E2F] font-bold" : "bg-[#B88E2F] hover:bg-[#B88E2F]"
              }`}
              onClick={() => setFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </nav>

      {/* Orders Table */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-center">Orders</h2>
        <div className="overflow-x-auto bg-[#795c19] shadow-lg rounded-lg">
          <table className="w-full text-sm md:text-base text-gray-100">
            <thead className="bg-[#795c19] text-[#e4b64d]">
              <tr>
                <th className="p-3">ID</th>
                <th>Customer</th>
                <th className="hidden md:table-cell">Address</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4b64d]">
              {filteredOrders.map((order) => (
                <React.Fragment key={order._id}>
                  <tr
                    className="cursor-pointer hover:bg-[#a38235] transition-all"
                    onClick={() => toggleOrderDetails(order._id)}
                  >
                    <td className="p-3">{order._id}</td>
                    <td>{order.firstName} {order.lastName}</td>
                    <td className="hidden md:table-cell">{order.address}</td>
                    <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                    <td>${order.total}</td>
                    <td>
                      <select
                        value={order.status || ""}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="bg-[#bd8f23] p-2 rounded border text-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="dispatch">Dispatch</option>
                        <option value="success">Completed</option>
                      </select>
                    </td>
                    <td>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(order._id);
                        }}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-800 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  {selectedOrderId === order._id && (
                    <tr>
                      <td colSpan={7} className="p-4">
                        <div className="bg-[#be942f] p-4 rounded-lg shadow-md animate-fadeIn">
                          <h3 className="font-bold text-[#725920]">Order Details</h3>
                          <p><strong>Phone:</strong> {order.phone}</p>
                          <p><strong>Email:</strong> {order.email}</p>
                          <p><strong>City:</strong> {order.city}</p>
                          <ul className="mt-2 space-y-2">
                            {order.cartItems.map((item, index) => (
                              <li key={`${order._id}-${index}`} className="flex items-center gap-2">
                                {item.image && (
                                  <Image src={item.image} width={40} height={40} alt={item.productName} className="rounded" />
                                )}
                                <span>{item.productName}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}