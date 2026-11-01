"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  Badge,
  Flex,
  Stack,
} from "@chakra-ui/react";
import { Booking } from "@/types";
import { useToast } from "@chakra-ui/react";
import { getApiBaseUrl } from "@/utils/apiConfig";


const DashboardInfoPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const toast = useToast();

 useEffect(() => {
  const fetchBookings = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/bookings`, {
        credentials: "include", // admin session cookie
      });
      if (!response.ok) throw new Error(`Failed with status ${response.status}`);
      const data = await response.json();

      // Sort by MongoDB ObjectId timestamp (newest first)
      const sorted = data.sort(
        (a: Booking, b: Booking) =>
          parseInt(b._id.toString().substring(0, 8), 16) -
          parseInt(a._id.toString().substring(0, 8), 16)
      );

      setBookings(sorted);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    }
  };

  fetchBookings();
}, []);


  const handleCancel = async (id: string) => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/bookings/cancel/${id}`, {
        method: "PATCH",
        credentials: "include",
      });
      const result = await res.json();
      if (res.ok) {
       setBookings((prev) =>
        prev.map((b) =>
          b._id === id ? { ...b, isCancelled: true, status: "cancelled" } : b
        )
      );

      } else {
        console.error("Cancel failed", result.message);
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Error cancelling booking", error.message);
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/bookings/${id}/mark-paid`, {
        method: "PATCH",
        credentials: "include",
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to mark as paid");

      setBookings((prev) => prev.map((b) => (b._id === id ? result.booking : b)));
      toast({ title: "Booking marked as paid.", status: "success", duration: 3000, isClosable: true });
    } catch (err: unknown) {
      const error = err as Error;
      toast({ title: error.message, status: "error", duration: 3000, isClosable: true });
    }
  };

 const handleClearAll = async () => {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/bookings/clear-all`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: "DELETE ALL BOOKINGS" }),
    });

    if (!res.ok) {
      throw new Error(
        res.status === 401 ? "Only upper management can clear all bookings." : "Failed to clear bookings."
      );
    }

    toast({
      title: "All bookings cleared permanently.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    // Refresh the bookings list in UI
    setBookings([]);
  } catch (error) {
    toast({
      title: error instanceof Error ? error.message : "Failed to clear bookings.",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  }
};



  return (
    <Box p={6}>
      <Heading mb={4}>All Bookings & Reservations</Heading>

      {bookings.length === 0 ? (
        <Text>No bookings yet.</Text>
      ) : (
        <Stack spacing={4}>
         
         {bookings.map((booking) => {
  const now = new Date();
  const endDate = new Date(booking.endDate); // already 12:00 noon check-out from the server
  const isExpired = endDate.getTime() < now.getTime();
  const isAwaitingPaystack = !booking.isPaid && !!booking.holdExpiresAt;
  const isCanceled =
    booking.isCancelled || booking.status?.toLowerCase() === "cancelled";
  const isCancelable =
    !isExpired && !isCanceled && now < new Date(booking.startDate);

  return (
    <Box
      key={booking._id}
      border="1px solid #ccc"
      borderRadius="md"
      p={4}
    >
      <Text>
        <strong>Room:</strong> {booking.roomName} ({booking.roomNumber})
      </Text>
      <Text>
        <strong>Price:</strong>{" "}
        ₦
        {typeof booking.roomPrice === "number"
          ? booking.roomPrice.toLocaleString()
          : "N/A"}
        {booking.nights ? ` per night · ${booking.nights} night${booking.nights > 1 ? "s" : ""}` : ""}
      </Text>
      {typeof booking.totalAmount === "number" && (
        <Text>
          <strong>Total:</strong> ₦{booking.totalAmount.toLocaleString()}
        </Text>
      )}
      <Text>
        <strong>Name:</strong> {booking.fullName}
      </Text>
      <Text>
        <strong>Email:</strong> {booking.email}
      </Text>
      <Text>
        <strong>Phone:</strong> {booking.phone}
      </Text>
      <Text>
        <strong>From:</strong>{" "}
        {new Date(booking.startDate).toDateString()}
      </Text>
      <Text>
        <strong>To:</strong> {new Date(booking.endDate).toDateString()}
      </Text>
      <Text>
        <strong>Status:</strong> {booking.status}
      </Text>
      {!!booking.discountAmount && (
        <Text
          color={booking.discountStatus === "approved" ? "green.600" : booking.discountStatus === "rejected" ? "red.600" : "orange.600"}
        >
          <strong>Discount:</strong> ₦{booking.discountAmount.toLocaleString()}{" "}
          {booking.discountStatus === "approved"
            ? "· approved by manager"
            : booking.discountStatus === "rejected"
              ? `· rejected by manager${booking.discountNote ? ` (${booking.discountNote})` : ""}`
              : "· waiting for manager approval"}
        </Text>
      )}
      {booking.payBy && !booking.isPaid && !isCanceled && (
        <Text color={new Date(booking.payBy) <= now ? "red.600" : "orange.600"}>
          <strong>Pay by:</strong>{" "}
          {new Date(booking.payBy).toLocaleString("en-GB", { timeZone: "Africa/Lagos", dateStyle: "medium", timeStyle: "short" })}
          {" "}(cancelled automatically if not paid)
        </Text>
      )}

      <Flex mt={3} gap={2} wrap="wrap">
        {/* Centralized label */}
        {booking.source === "online" && booking.isPaid && (
          <Badge colorScheme="teal">ONLINE USER · VIA PAYSTACK · PAID</Badge>
        )}
        {booking.source === "online" && !booking.isPaid && !isAwaitingPaystack && (
          <Badge colorScheme="orange">ONLINE USER · RESERVED · UNPAID</Badge>
        )}
        {isAwaitingPaystack && (
          <Badge colorScheme="yellow">ONLINE USER · PAYING ON PAYSTACK</Badge>
        )}
        {booking.needsAttention && (
          <Badge colorScheme="red" variant="solid" whiteSpace="normal">
            NEEDS ATTENTION: {booking.needsAttention}
          </Badge>
        )}
        {booking.source === "dashboard" && booking.isPaid && (
          <Badge colorScheme="green">ADMIN · BOOKED · PAID</Badge>
        )}
        {booking.source === "dashboard" && !booking.isPaid && (
          <Badge colorScheme="purple">ADMIN · RESERVED · UNPAID</Badge>
        )}

        {/* Additional status */}
        {isCanceled && (
          <Badge colorScheme="red">CANCELED BOOKING</Badge>
        )}
        {isExpired && (
          <Badge colorScheme="gray">THIS ROOM HAS EXPIRED</Badge>
        )}
      </Flex>

      <Flex mt={4} gap={2} wrap="wrap">
        {!booking.isPaid && !isCanceled && !isExpired && !isAwaitingPaystack && (
          <Button colorScheme="green" onClick={() => handleMarkPaid(booking._id)}>
            Mark as Paid
          </Button>
        )}
        {isCancelable && (
          <Button colorScheme="red" onClick={() => handleCancel(booking._id)}>
            Cancel
          </Button>
        )}
      </Flex>
            </Box>
          );
        })}


                    <Button
            onClick={() => {
              const typed = window.prompt(
                "Managers only. This permanently deletes EVERY booking. Type DELETE ALL BOOKINGS to confirm."
              );
              if (typed === "DELETE ALL BOOKINGS") {
                handleClearAll();
              }
            }}
            colorScheme="red"
            variant="outline"
          >
            Clear All
          </Button>

        </Stack>
      )}
    </Box>
  );
};

export default DashboardInfoPage;
