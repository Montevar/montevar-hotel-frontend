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
      const response = await fetch(`${getApiBaseUrl()}/api/bookings`);
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

 const handleClearAll = async () => {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/bookings/clear-all`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Failed to clear bookings");
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
    console.error("Error clearing bookings:", error);
    toast({
      title: "Failed to clear bookings.",
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
  const endDate = new Date(booking.endDate);
  endDate.setHours(12, 0, 0, 0);
  const isExpired = endDate.getTime() < now.getTime();
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
      </Text>
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

      <Flex mt={3} gap={2} wrap="wrap">
        {/* Centralized label */}
        {booking.source === "online" && booking.isPaid && (
          <Badge colorScheme="teal">ONLINE USER · VIA PAYSTACK · PAID</Badge>
        )}
        {booking.source === "online" && !booking.isPaid && (
          <Badge colorScheme="orange">ONLINE USER · RESERVED · UNPAID</Badge>
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

      {isCancelable && (
        <Button
          mt={4}
          colorScheme="red"
          onClick={() => handleCancel(booking._id)}
        >
                  Cancel
                </Button>
              )}
            </Box>
          );
        })}


                    <Button
            onClick={() => {
              const confirm = window.confirm("Are you sure you want to clear all bookings? This action is irreversible.");
              if (confirm) {
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
